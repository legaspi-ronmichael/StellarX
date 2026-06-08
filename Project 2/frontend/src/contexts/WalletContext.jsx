import { createContext, useContext, useState } from 'react';

const WalletContext = createContext(null);

/**
 * WalletContext - provides Freighter wallet integration.
 * In demo mode, the user gets a server-generated keypair that is also stored on the backend.
 * In production mode, the user connects Freighter (browser extension) to sign locally.
 */
export function WalletProvider({ children }) {
  const [walletType, setWalletType] = useState('demo'); // 'demo' or 'freighter'
  const [freighterConnected, setFreighterConnected] = useState(false);
  const [freighterAddress, setFreighterAddress] = useState(null);

  // Try to detect Freighter
  const detectFreighter = async () => {
    try {
      const isInstalled = await window.freighterApi?.isConnected();
      if (isInstalled) {
        setWalletType('freighter');
        return true;
      }
    } catch {
      // Freighter not installed
    }
    setWalletType('demo');
    return false;
  };

  const connectFreighter = async () => {
    if (typeof window.freighterApi === 'undefined') {
      throw new Error(
        'Freighter wallet extension is not installed. Get it at https://www.freighter.app/'
      );
    }
    await window.freighterApi.setAllowed();
    const address = await window.freighterApi.getAddress();
    setFreighterAddress(address);
    setFreighterConnected(true);
    setWalletType('freighter');
    return address;
  };

  /**
   * Sign and submit a payment via Freighter.
   * @param {Object} params
   * @param {string} params.destination
   * @param {string} params.amount
   * @param {string} params.memo
   * @returns {Promise<{hash: string}>}
   */
  const freighterPay = async ({ destination, amount, memo }) => {
    if (typeof window.freighterApi === 'undefined') {
      throw new Error('Freighter not installed');
    }
    // Build a Stellar transaction XDR and ask Freighter to sign+submit
    const { TransactionBuilder, Asset, Operation, Memo, Networks, BASE_FEE } = await import(
      '@stellar/stellar-sdk'
    );
    const Horizon = await import('@stellar/stellar-sdk');
    const server = new Horizon.Horizon.Server(import.meta.env.VITE_STELLAR_HORIZON_URL);
    const sourceAccount = await server.loadAccount(freighterAddress);
    const tx = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.payment({
          destination,
          asset: Asset.native(),
          amount: amount.toString(),
        })
      );
    if (memo) tx.addMemo(Memo.text(memo.slice(0, 28)));
    const built = tx.setTimeout(180).build();
    const signedXdr = await window.freighterApi.signTransaction(built.toXDR(), {
      networkPassphrase: import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE,
    });
    const result = await server.submitTransaction(signedXdr.signedTxXdr);
    return { hash: result.hash };
  };

  return (
    <WalletContext.Provider
      value={{
        walletType,
        setWalletType,
        freighterConnected,
        freighterAddress,
        detectFreighter,
        connectFreighter,
        freighterPay,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
};
