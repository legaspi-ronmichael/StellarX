import {
  StellarSdk,
  getServer,
  getNetworkPassphrase,
  fundTestnetAccount,
  generateKeypair,
  getAccountInfo,
} from '../config/stellar.js';

/**
 * Build, sign and submit a payment transaction.
 * @param {Object} params
 * @param {string} params.sourceSecret - Secret key of the sender
 * @param {string} params.destination - Public key of the recipient
 * @param {string|number} params.amount - Amount in XLM
 * @param {string} [params.memo] - Optional memo text
 * @returns {Promise<Object>} The transaction result from Horizon
 */
export async function sendPayment({ sourceSecret, destination, amount, memo }) {
  const server = getServer();
  const passphrase = getNetworkPassphrase();
  const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecret);
  const sourcePublic = sourceKeypair.publicKey();

  const sourceAccount = await server.loadAccount(sourcePublic);

  const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: passphrase,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination,
        asset: StellarSdk.Asset.native(),
        amount: amount.toString(),
      })
    );

  if (memo) {
    transaction.addMemo(StellarSdk.Memo.text(memo.slice(0, 28)));
  }

  const builtTx = transaction.setTimeout(180).build();
  builtTx.sign(sourceKeypair);

  const result = await server.submitTransaction(builtTx);
  return result;
}

/**
 * Verify a transaction by hash on the network.
 * @param {string} txHash
 */
export async function verifyTransaction(txHash) {
  try {
    const server = getServer();
    const tx = await server.transactions().transaction(txHash).call();
    return {
      hash: tx.hash,
      ledger: tx.ledger,
      sourceAccount: tx.source_account,
      fee: tx.fee_charged,
      feeXLM: (parseInt(tx.fee_charged) / 10_000_000).toFixed(7),
      memo: tx.memo,
      createdAt: tx.created_at,
      successful: tx.successful,
    };
  } catch (err) {
    if (err.response?.status === 404) {
      return { found: false };
    }
    throw err;
  }
}

/**
 * Get all payments to/from a specific account (for the public ledger view).
 */
export async function getAccountPayments(publicKey, limit = 50) {
  const server = getServer();
  const payments = await server
    .payments()
    .forAccount(publicKey)
    .limit(limit)
    .order('desc')
    .call();
  return payments.records.map((p) => ({
    id: p.id,
    type: p.type,
    from: p.from,
    to: p.to,
    amount: p.amount,
    assetType: p.asset_type,
    assetCode: p.asset_code,
    assetIssuer: p.asset_issuer,
    createdAt: p.created_at,
    transactionHash: p.transaction_hash,
  }));
}

/**
 * Create a multi-signature treasury account.
 * Returns the keypair for the new account, signs the multi-sig setup transaction.
 * The treasury will require 2-of-3 signatures.
 *
 * @param {string[]} signerSecrets - Array of 3 signer secret keys
 */
export async function createMultiSigTreasury(signerSecrets) {
  if (signerSecrets.length !== 3) {
    throw new Error('Exactly 3 signers are required');
  }

  const server = getServer();
  const passphrase = getNetworkPassphrase();

  // 1. Create the new treasury keypair
  const treasuryKeypair = StellarSdk.Keypair.random();
  const treasuryPublic = treasuryKeypair.publicKey();

  // 2. Fund the treasury via Friendbot (testnet only)
  await fundTestnetAccount(treasuryPublic);

  // 3. Wait a moment for the account to be created
  await new Promise((r) => setTimeout(r, 2000));

  // 4. Load the new account
  let treasuryAccount = await server.loadAccount(treasuryPublic);

  // 5. Get the public keys of the signers
  const signers = signerSecrets.map((s) => StellarSdk.Keypair.fromSecret(s).publicKey());

  // 6. Build the multi-sig setup transaction
  const tx = new StellarSdk.TransactionBuilder(treasuryAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: passphrase,
  })
    .addOperation(
      StellarSdk.Operation.setOptions({
        lowThreshold: 2,
        medThreshold: 2,
        highThreshold: 2,
        masterWeight: 0, // Disable master key
      })
    );

  // Add each signer with weight 1
  for (const signerPub of signers) {
    tx.addOperation(
      StellarSdk.Operation.setOptions({
        signer: {
          ed25519PublicKey: signerPub,
          weight: 1,
        },
      })
    );
  }

  const builtTx = tx.setTimeout(180).build();
  // The first signer signs the multi-sig setup
  builtTx.sign(StellarSdk.Keypair.fromSecret(signerSecrets[0]));

  const result = await server.submitTransaction(builtTx);

  return {
    publicKey: treasuryPublic,
    secretKey: treasuryKeypair.secret(),
    signers: signers.map((pk) => ({ publicKey: pk, weight: 1 })),
    setupTxHash: result.hash,
  };
}

/**
 * Build a multi-sig payment transaction (returns the XDR to be signed off-chain by other signers).
 * For demo, we will use 2-of-3 signing by having 2 signers co-sign the transaction.
 */
export async function buildMultiSigPayment({
  sourcePublicKey,
  destination,
  amount,
  memo,
  signerSecrets, // Array of 2 signer secrets that will co-sign
}) {
  const server = getServer();
  const passphrase = getNetworkPassphrase();
  const sourceAccount = await server.loadAccount(sourcePublicKey);

  let txBuilder = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: passphrase,
  }).addOperation(
    StellarSdk.Operation.payment({
      destination,
      asset: StellarSdk.Asset.native(),
      amount: amount.toString(),
    })
  );

  if (memo) {
    txBuilder = txBuilder.addMemo(StellarSdk.Memo.text(memo.slice(0, 28)));
  }

  const tx = txBuilder.setTimeout(180).build();

  // Co-sign with provided signers
  const signers = signerSecrets.map((s) => StellarSdk.Keypair.fromSecret(s));
  signers.forEach((kp) => tx.sign(kp));

  return tx;
}

/**
 * Submit a pre-built transaction (already signed by all required signers).
 */
export async function submitTransaction(signedTxXdr) {
  const server = getServer();
  const tx = StellarSdk.TransactionBuilder.fromXDR(
    signedTxXdr,
    getNetworkPassphrase()
  );
  return server.submitTransaction(tx);
}

/**
 * Get the XLM balance of an account.
 */
export async function getXlmBalance(publicKey) {
  const info = await getAccountInfo(publicKey);
  if (!info.exists) return '0';
  const native = info.balances.find((b) => b.asset_type === 'native');
  return native ? native.balance : '0';
}

export {
  StellarSdk,
  fundTestnetAccount,
  generateKeypair,
  getAccountInfo,
};
