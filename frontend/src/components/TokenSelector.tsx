// TokenSelector.tsx - Lightweight token selection without heavy dependencies
import React, { useState, useCallback } from 'react';

interface Token {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
}

interface TokenSelectorProps {
  selectedToken: Token;
  onTokenSelect: (token: Token) => void;
  otherToken?: Token; // To prevent selecting the same token twice
  label: string;
}

// Extended token list with popular Solana tokens
export const EXTENDED_TOKEN_LIST: Token[] = [
  {
    mint: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },
  {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
  },
  {
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    symbol: 'USDT',
    name: 'Tether',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png'
  },
  {
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    symbol: 'BONK',
    name: 'Bonk',
    decimals: 5,
    logoURI: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I'
  },
  {
    mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    symbol: 'WIF',
    name: 'dogwifhat',
    decimals: 6,
    logoURI: 'https://bafkreibk3covs5ltyqxa272oaw6kq2i3k7nobarm2tbeovhv7ekprivgeu.ipfs.cf-ipfs.com'
  },
  {
    mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    symbol: 'JUP',
    name: 'Jupiter',
    decimals: 6,
    logoURI: 'https://static.jup.ag/jup/icon.png'
  },
  {
    mint: 'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof',
    symbol: 'RENDER',
    name: 'Render Token',
    decimals: 8,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof/logo.png'
  },
  {
    mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
    symbol: 'PYTH',
    name: 'Pyth Network',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3/logo.png'
  }
];

export const TokenSelector = ({
  selectedToken,
  onTokenSelect,
  otherToken,
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTokens = EXTENDED_TOKEN_LIST.filter(token => 
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(token => 
    !otherToken || token.mint !== otherToken.mint
  );

  const handleTokenSelect = useCallback((token: Token) => {
    onTokenSelect(token);
    setIsOpen(false);
    setSearchTerm('');
  }, [onTokenSelect]);

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <div className="token-selector-container">
      <div className="token-input-header">
        <label>{label}</label>
        <div 
          className={`token-selector ${isOpen ? 'open' : ''}`}
          onClick={handleToggle}
        >
          <img 
            src={selectedToken.logoURI} 
            alt={selectedToken.symbol} 
            width="24" 
            height="24"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🪙</text></svg>';
            }}
          />
          <span>{selectedToken.symbol}</span>
        </div>
      </div>

      {isOpen && (
        <div className="token-dropdown">
          <div className="token-search">
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="token-search-input"
              autoFocus
            />
          </div>
          
          <div className="token-list">
            {filteredTokens.map((token) => (
              <div
                key={token.mint}
                className="token-option"
                onClick={() => handleTokenSelect(token)}
              >
                <img 
                  src={token.logoURI} 
                  alt={token.symbol} 
                  width="20" 
                  height="20"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🪙</text></svg>';
                  }}
                />
                <div className="token-info">
                  <span className="token-symbol">{token.symbol}</span>
                  <span className="token-name">{token.name}</span>
                </div>
              </div>
            ))}
            
            {filteredTokens.length === 0 && (
              <div className="no-tokens">
                No tokens found for "{searchTerm}"
              </div>
            )}
          </div>
          
          <div className="custom-token-section">
            <div className="custom-token-hint">
              💡 Can't find your token? You can add custom tokens by mint address
            </div>
          </div>
        </div>
      )}
      
      {isOpen && (
        <div 
          className="token-dropdown-overlay" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default TokenSelector;
