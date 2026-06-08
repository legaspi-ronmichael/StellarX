import * as StellarSdk from '@stellar/stellar-sdk';
import axios from 'axios';

let server;
let networkPassphrase;
let friendbotUrl;

export async function initStellar() {
  const network = process.env.STELLAR_NETWORK || 'TESTNET';
  const horizonUrl = process.env.STELLAR_HORIZON_URL;
  networkPassphrase = process.env.STELLAR_NETWORK_PASSPHRASE;
  friendbotUrl = process.env.STELLAR_FRIENDBOT_URL;

  if (!horizonUrl) throw new Error('STELLAR_HORIZON_URL is not set');
  if (!networkPassphrase) throw new Error('STELLAR_NETWORK_PASSPHRASE is not set');

  server = new StellarSdk.Horizon.Server(horizonUrl);

  // Verify connection
  try {
    await server.ledgers().limit(1).call();
  } catch (err) {
    console.warn('⚠️  Could not reach Stellar Horizon:', err.message);
  }
}

export function getServer() {
  if (!server) throw new Error('Stellar not initialized');
  return server;
}

export function getNetworkPassphrase() {
  return networkPassphrase;
}

/**
 * Fund a testnet account via Friendbot
 * @param {string} publicKey
 */
export async function fundTestnetAccount(publicKey) {
  if (!friendbotUrl) {
    throw new Error('Friendbot URL not configured');
  }
  const response = await axios.get(`${friendbotUrl}?addr=${publicKey}`);
  return response.data;
}

/**
 * Generate a new Stellar keypair
 */
export function generateKeypair() {
  return StellarSdk.Keypair.random();
}

/**
 * Get account info from Stellar network
 */
export async function getAccountInfo(publicKey) {
  try {
    const account = await getServer().loadAccount(publicKey);
    return {
      exists: true,
      sequence: account.sequenceNumber(),
      balances: account.balances.map((b) => ({
        asset_type: b.asset_type,
        asset_code: b.asset_code,
        asset_issuer: b.asset_issuer,
        balance: b.balance,
      })),
      subentry_count: account.subentry_count,
    };
  } catch (err) {
    if (err.response?.status === 404) {
      return { exists: false };
    }
    throw err;
  }
}

export { StellarSdk };
