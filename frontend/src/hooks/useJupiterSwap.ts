// useJupiterSwap.ts - Mobile-friendly Jupiter swap execution
// Uses only fetch API and existing @solana/web3.js - no heavy dependencies!

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface SwapParams {
  quoteResponse: any;
  userPublicKey: string;
  wrapAndUnwrapSol?: boolean;
  feeAccount?: string;
}

interface SwapResult {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
}

interface UseJupiterSwapReturn {
  executeSwap: (quote: any) => Promise<string | null>;
  loading: boolean;
  error: string | null;
  txHash: string | null;
}

const JUPITER_API_BASE = 'https://quote-api.jup.ag/v6';

export const useJupiterSwap = (): UseJupiterSwapReturn => {
  const { publicKey, signTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);

  const executeSwap = useCallback(async (quote: any): Promise<string | null> => {
    if (!publicKey || !signTransaction || !quote) {
      setError('Wallet not connected or quote missing');
      return null;
    }

    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      // Step 1: Get swap transaction from Jupiter
      console.log('🔮 Building swap transaction...');
      
      const swapParams: SwapParams = {
        quoteResponse: quote,
        userPublicKey: publicKey.toString(),
        wrapAndUnwrapSol: true,
        // Optional: Add your fee account for referrer rewards
        // feeAccount: "YOUR_FEE_ACCOUNT_ADDRESS"
      };

      const swapResponse = await fetch(`${JUPITER_API_BASE}/swap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(swapParams),
      });

      if (!swapResponse.ok) {
        throw new Error(`Swap API error: ${swapResponse.status} ${swapResponse.statusText}`);
      }

      const swapResult: SwapResult = await swapResponse.json();
      console.log('✨ Swap transaction built:', swapResult);

      // Step 2: Deserialize the transaction
      const { Transaction } = await import('@solana/web3.js');
      const swapTransactionBuf = Buffer.from(swapResult.swapTransaction, 'base64');
      const transaction = Transaction.from(swapTransactionBuf);

      // Step 3: Sign the transaction
      console.log('🌙 Signing transaction...');
      const signedTransaction = await signTransaction(transaction);

      // Step 4: Send the transaction
      console.log('⚡ Sending transaction...');
      
      // We'll use a simple RPC endpoint for now
      const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';
      
      const rawTransaction = signedTransaction.serialize();
      const txid = await sendRawTransaction(rawTransaction, RPC_ENDPOINT);
      
      console.log('🎯 Transaction sent:', txid);
      setTxHash(txid);
      
      return txid;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown swap error';
      console.error('❌ Swap failed:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [publicKey, signTransaction]);

  return {
    executeSwap,
    loading,
    error,
    txHash
  };
};

// Helper function to send raw transaction using fetch
async function sendRawTransaction(rawTransaction: Uint8Array, rpcEndpoint: string): Promise<string> {
  const response = await fetch(rpcEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'sendTransaction',
      params: [
        Buffer.from(rawTransaction).toString('base64'),
        {
          encoding: 'base64',
          skipPreflight: false,
          preflightCommitment: 'processed'
        }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`RPC error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  
  if (result.error) {
    throw new Error(`Transaction failed: ${result.error.message}`);
  }

  return result.result;
}

// Helper function to confirm transaction
export async function confirmTransaction(txHash: string, rpcEndpoint: string): Promise<boolean> {
  try {
    const response = await fetch(rpcEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignatureStatuses',
        params: [
          [txHash],
          {
            searchTransactionHistory: true
          }
        ],
      }),
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    const status = result.result?.value?.[0];
    
    return status && !status.err;
  } catch (error) {
    console.error('Error confirming transaction:', error);
    return false;
  }
}
