import React from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { JupiterProvider } from '@jup-ag/react-hook';
import { clusterApiUrl } from '@solana/web3.js';
import App from '../App';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

const AppWithProviders: React.FC = () => {
  // Configure supported wallets
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ];

  // Solana RPC endpoint
  const endpoint = clusterApiUrl('mainnet-beta');

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <JupiterProvider
            cluster="mainnet-beta"
            userPublicKey={undefined} // Will be set by wallet connection
            routeMap={undefined} // Use default Jupiter route map
            defaultReferrer="nocturnepepe.sol"
          >
            <App />
          </JupiterProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default AppWithProviders;
