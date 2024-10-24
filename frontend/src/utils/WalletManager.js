import { useState, useEffect } from 'react';
import { WalletState } from './WalletStatus';

export const WALLET_ERRORS = {
  NO_WALLET: 'NO_WALLET',
  USER_REJECTED: 'USER_REJECTED',
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  NO_ACCOUNT_FOUND: 'NO_ACCOUNT_FOUND',
  INVALID_CHAIN: 'INVALID_CHAIN',
};

const HARDHAT_CHAIN_ID = 31337;

export const useWalletManager = () => {
  const [walletStatus, setWalletStatus] = useState(WalletState.empty()); // Stato iniziale

  const connectWallet = async () => {
    setWalletStatus(WalletState.loading()); // Inizia il caricamento

    if (!window.ethereum) {
      setWalletStatus(WalletState.failed(WALLET_ERRORS.NO_WALLET));
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const chainIdHex = `0x${HARDHAT_CHAIN_ID.toString(16)}`
      if (chainId !== chainIdHex) {
        setWalletStatus(WalletState.failed(WALLET_ERRORS.INVALID_CHAIN));
        return;
      }

      if (accounts.length > 0) {
        setWalletStatus(WalletState.success(accounts[0])); // Imposta stato success
      } else {
        setWalletStatus(WalletState.failed(WALLET_ERRORS.NO_ACCOUNT_FOUND));
      }
    } catch (err) {
      if (err.code === 4001) {
        setWalletStatus(WalletState.failed(WALLET_ERRORS.USER_REJECTED));
      } else {
        setWalletStatus(WalletState.failed(WALLET_ERRORS.CONNECTION_FAILED));
      }
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setWalletStatus(WalletState.failed(WALLET_ERRORS.NO_ACCOUNT_FOUND));
        } else {
          setWalletStatus(WalletState.success(accounts[0]));
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        if (parseInt(chainId, 10) !== HARDHAT_CHAIN_ID) {
          setWalletStatus(WalletState.failed(WALLET_ERRORS.INVALID_CHAIN));
        } else {
          setWalletStatus(WalletState.empty()); // Resetta allo stato vuoto se necessario
        }
      });
    }
  }, []);

  return { walletStatus, connectWallet }; // Restituisce stato del wallet e funzione di connessione
};
