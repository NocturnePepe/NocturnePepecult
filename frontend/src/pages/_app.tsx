import React from 'react';
import type { AppProps } from 'next/app';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Jupiter Provider (using CDN version)
declare global {
  interface Window {
    JupiterProvider: React.ComponentType<any>;
  }
}

const JupiterProvider = window?.JupiterProvider || React.Fragment;

export default function App({ Component, pageProps }: AppProps) {
  // Solana network configuration
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = clusterApiUrl(network);
  
  // Wallet adapters
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <JupiterProvider
            connection={endpoint}
            cluster="mainnet-beta"
            defaultReferrer="nocturnepepe.sol"
          >
            <Component {...pageProps} />
          </JupiterProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
