// useJupiterQuotes.ts - Mobile-friendly Jupiter integration
// Perfect for GitHub Codespaces - no heavy dependencies needed!

import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';

interface JupiterQuote {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee: null;
  priceImpactPct: number;
  routePlan: any[];
  contextSlot: number;
  timeTaken: number;
}

interface QuoteParams {
  inputMint: string | PublicKey;
  outputMint: string | PublicKey;
  amount: number;
  slippageBps?: number;
}

interface UseJupiterQuotesReturn {
  quote: JupiterQuote | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  priceImpact: number;
  rate: number;
  routes: string[];
}

const JUPITER_API_BASE = 'https://quote-api.jup.ag/v6';

export const useJupiterQuotes = (params: QuoteParams): UseJupiterQuotesReturn => {
  const [quote, setQuote] = useState<JupiterQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { inputMint, outputMint, amount, slippageBps = 50 } = params;

  const fetchQuote = useCallback(async () => {
    // Don't fetch if amount is 0 or invalid
    if (!amount || amount <= 0) {
      setQuote(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const inputMintStr = typeof inputMint === 'string' ? inputMint : inputMint.toString();
      const outputMintStr = typeof outputMint === 'string' ? outputMint : outputMint.toString();

      const url = `${JUPITER_API_BASE}/quote?` + new URLSearchParams({
        inputMint: inputMintStr,
        outputMint: outputMintStr,
        amount: amount.toString(),
        slippageBps: slippageBps.toString(),
        onlyDirectRoutes: 'false',
        asLegacyTransaction: 'false'
      });

      console.log('🔍 Fetching Jupiter quote:', { inputMintStr, outputMintStr, amount, slippageBps });

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Jupiter API error: ${response.status} ${response.statusText}`);
      }

      const quoteData: JupiterQuote = await response.json();
      
      console.log('✅ Jupiter quote received:', quoteData);
      setQuote(quoteData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Jupiter quote failed:', errorMessage);
      setError(errorMessage);
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }, [inputMint, outputMint, amount, slippageBps]);

  // Auto-fetch when params change (debounced)
  useEffect(() => {
    const timer = setTimeout(fetchQuote, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [fetchQuote]);

  // Calculate derived values
  const priceImpact = quote?.priceImpactPct || 0;
  const rate = quote ? parseFloat(quote.outAmount) / parseFloat(quote.inAmount) : 0;
  const routes = quote?.routePlan?.map((route: any) => route.swapInfo?.label || 'Unknown') || [];

  return {
    quote,
    loading,
    error,
    refetch: fetchQuote,
    priceImpact,
    rate,
    routes
  };
};

// Token definitions for easy reference
export const POPULAR_TOKENS = {
  SOL: {
    mint: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },
  USDC: {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
  },
  USDT: {
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    symbol: 'USDT',
    name: 'Tether',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png'
  },
  // Add your custom NocturnePepe token here
  NCTP: {
    mint: 'YOUR_CUSTOM_TOKEN_MINT_HERE', // Replace with your token's mint address
    symbol: 'NCTP',
    name: 'NocturnePepe',
    decimals: 9,
    logoURI: 'https://your-logo-url.com/nctp.png'
  }
} as const;

// Helper function to format amounts based on token decimals
export const formatTokenAmount = (amount: string | number, decimals: number): number => {
  return typeof amount === 'string' ? 
    parseFloat(amount) / Math.pow(10, decimals) : 
    amount / Math.pow(10, decimals);
};

// Helper function to convert UI amount to raw amount (with decimals)
export const toRawAmount = (uiAmount: string | number, decimals: number): number => {
  const amount = typeof uiAmount === 'string' ? parseFloat(uiAmount) : uiAmount;
  return Math.floor(amount * Math.pow(10, decimals));
};
