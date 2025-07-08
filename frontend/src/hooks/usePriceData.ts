// usePriceData.ts - Lightweight price data fetching using public APIs
import { useState, useEffect, useCallback } from 'react';

interface PriceData {
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: Date;
}

interface UsePriceDataReturn {
  priceData: PriceData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Map of token symbols to CoinGecko IDs
const COINGECKO_IDS: { [key: string]: string } = {
  'SOL': 'solana',
  'USDC': 'usd-coin',
  'USDT': 'tether',
  'BONK': 'bonk',
  'WIF': 'dogwifcoin',
  'JUP': 'jupiter-exchange-solana',
  'RENDER': 'render-token',
  'PYTH': 'pyth-network'
};

export const usePriceData = (tokenSymbol: string): UsePriceDataReturn => {
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPriceData = useCallback(async () => {
    const coinId = COINGECKO_IDS[tokenSymbol];
    if (!coinId) {
      setPriceData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Using CoinGecko's free API (no API key required)
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&include_last_updated_at=true`
      );

      if (!response.ok) {
        throw new Error(`Price API error: ${response.status}`);
      }

      const data = await response.json();
      const coinData = data[coinId];

      if (coinData) {
        setPriceData({
          price: coinData.usd || 0,
          change24h: coinData.usd_24h_change || 0,
          volume24h: coinData.usd_24h_vol || 0,
          marketCap: coinData.usd_market_cap || 0,
          lastUpdated: new Date(coinData.last_updated_at * 1000)
        });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Price fetch failed';
      setError(errorMessage);
      setPriceData(null);
    } finally {
      setLoading(false);
    }
  }, [tokenSymbol]);

  useEffect(() => {
    fetchPriceData();
    
    // Update prices every 30 seconds
    const interval = setInterval(fetchPriceData, 30000);
    return () => clearInterval(interval);
  }, [fetchPriceData]);

  return {
    priceData,
    loading,
    error,
    refetch: fetchPriceData
  };
};

// Helper function to format price with appropriate decimals
export const formatPrice = (price: number): string => {
  if (price === 0) return '$0.00';
  
  if (price >= 1) {
    return `$${price.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  } else if (price >= 0.01) {
    return `$${price.toFixed(4)}`;
  } else {
    return `$${price.toFixed(6)}`;
  }
};

// Helper function to format change percentage
export const formatChange = (change: number): string => {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
};

// Helper function to format large numbers (market cap, volume)
export const formatLargeNumber = (num: number): string => {
  if (num >= 1e9) {
    return `$${(num / 1e9).toFixed(2)}B`;
  } else if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(2)}M`;
  } else if (num >= 1e3) {
    return `$${(num / 1e3).toFixed(2)}K`;
  } else {
    return `$${num.toFixed(0)}`;
  }
};
