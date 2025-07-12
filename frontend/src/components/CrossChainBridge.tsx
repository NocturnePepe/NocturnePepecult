import React, { useState, useEffect } from 'react';
import './CrossChainBridge.css';

interface SupportedChain {
  id: string;
  name: string;
  symbol: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  icon: string;
  bridgeContracts: {
    [token: string]: string;
  };
}

interface BridgeAsset {
  symbol: string;
  name: string;
  icon: string;
  contractAddress: {
    [chainId: number]: string;
  };
  decimals: number;
  isNative: boolean;
  bridgeFee: number;
  estimatedTime: string;
}

interface BridgeTransaction {
  id: string;
  fromChain: string;
  toChain: string;
  asset: string;
  amount: number;
  status: 'pending' | 'bridging' | 'completed' | 'failed';
  txHash: string;
  destinationTxHash?: string;
  timestamp: Date;
  estimatedCompletion: Date;
  bridgeFee: number;
}

interface BridgeRoute {
  fromChain: string;
  toChain: string;
  asset: string;
  protocol: 'wormhole' | 'allbridge' | 'portal' | 'multichain';
  fee: number;
  estimatedTime: string;
  liquidity: number;
  reliability: number;
}

const CrossChainBridge: React.FC = () => {
  const [supportedChains] = useState<SupportedChain[]>([
    {
      id: 'solana',
      name: 'Solana',
      symbol: 'SOL',
      chainId: 101,
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      blockExplorer: 'https://solscan.io',
      nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
      icon: '🔮',
      bridgeContracts: {
        'USDC': '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
        'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
      }
    },
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      chainId: 1,
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
      blockExplorer: 'https://etherscan.io',
      nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
      icon: '⚡',
      bridgeContracts: {
        'USDC': '0xA0b86a33E6441B8cE2C55f4E7a5d5A37A2A8Ba',
        'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7'
      }
    },
    {
      id: 'bsc',
      name: 'Binance Smart Chain',
      symbol: 'BNB',
      chainId: 56,
      rpcUrl: 'https://bsc-dataseed1.binance.org',
      blockExplorer: 'https://bscscan.com',
      nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
      icon: '🟡',
      bridgeContracts: {
        'USDC': '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        'USDT': '0x55d398326f99059fF775485246999027B3197955'
      }
    },
    {
      id: 'polygon',
      name: 'Polygon',
      symbol: 'MATIC',
      chainId: 137,
      rpcUrl: 'https://polygon-rpc.com',
      blockExplorer: 'https://polygonscan.com',
      nativeCurrency: { name: 'Polygon', symbol: 'MATIC', decimals: 18 },
      icon: '🟣',
      bridgeContracts: {
        'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
      }
    }
  ]);

  const [bridgeAssets] = useState<BridgeAsset[]>([
    {
      symbol: 'SOL',
      name: 'Solana',
      icon: '🔮',
      contractAddress: {
        101: 'native',
        1: '0x8f8e8b3c4De84F5D5c3F4b9b4c7e1c2a3b4f5d6e7',
        56: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5g6h',
        137: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8g9h0'
      },
      decimals: 9,
      isNative: true,
      bridgeFee: 0.001,
      estimatedTime: '5-15 minutes'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      icon: '💵',
      contractAddress: {
        101: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
        1: '0xA0b86a33E6441B8cE2C55f4E7a5d5A37A2A8Ba',
        56: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
      },
      decimals: 6,
      isNative: false,
      bridgeFee: 5,
      estimatedTime: '2-10 minutes'
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      icon: '💚',
      contractAddress: {
        101: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        1: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        56: '0x55d398326f99059fF775485246999027B3197955',
        137: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
      },
      decimals: 6,
      isNative: false,
      bridgeFee: 5,
      estimatedTime: '2-10 minutes'
    }
  ]);

  const [fromChain, setFromChain] = useState<string>('solana');
  const [toChain, setToChain] = useState<string>('ethereum');
  const [selectedAsset, setSelectedAsset] = useState<string>('USDC');
  const [amount, setAmount] = useState<string>('');
  const [bridgeTransactions, setBridgeTransactions] = useState<BridgeTransaction[]>([]);
  const [availableRoutes, setAvailableRoutes] = useState<BridgeRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [isBridging, setIsBridging] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [destinationBalance, setDestinationBalance] = useState<number>(0);

  useEffect(() => {
    findAvailableRoutes();
    loadUserBalances();
  }, [fromChain, toChain, selectedAsset]);

  const findAvailableRoutes = () => {
    // Simulate finding bridge routes
    const routes: BridgeRoute[] = [
      {
        fromChain,
        toChain,
        asset: selectedAsset,
        protocol: 'wormhole',
        fee: 0.1,
        estimatedTime: '5-15 minutes',
        liquidity: 95,
        reliability: 98
      },
      {
        fromChain,
        toChain,
        asset: selectedAsset,
        protocol: 'allbridge',
        fee: 0.08,
        estimatedTime: '3-10 minutes',
        liquidity: 87,
        reliability: 96
      },
      {
        fromChain,
        toChain,
        asset: selectedAsset,
        protocol: 'portal',
        fee: 0.12,
        estimatedTime: '2-8 minutes',
        liquidity: 92,
        reliability: 99
      }
    ];

    setAvailableRoutes(routes);
    setSelectedRoute('wormhole');
  };

  const loadUserBalances = async () => {
    // Simulate loading user balances
    setBalance(Math.random() * 1000 + 100);
    setDestinationBalance(Math.random() * 500 + 50);
  };

  const initiateBridge = async () => {
    if (!amount || !selectedRoute) return;

    setIsBridging(true);

    const transaction: BridgeTransaction = {
      id: Math.random().toString(36).substring(2, 15),
      fromChain,
      toChain,
      asset: selectedAsset,
      amount: parseFloat(amount),
      status: 'pending',
      txHash: '0x' + Math.random().toString(16).substring(2, 66),
      timestamp: new Date(),
      estimatedCompletion: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      bridgeFee: availableRoutes.find(r => r.protocol === selectedRoute)?.fee || 0.1
    };

    setBridgeTransactions(prev => [transaction, ...prev]);

    // Simulate bridge process
    setTimeout(() => {
      setBridgeTransactions(prev => 
        prev.map(tx => 
          tx.id === transaction.id 
            ? { ...tx, status: 'bridging' }
            : tx
        )
      );
    }, 2000);

    setTimeout(() => {
      setBridgeTransactions(prev => 
        prev.map(tx => 
          tx.id === transaction.id 
            ? { 
                ...tx, 
                status: 'completed',
                destinationTxHash: '0x' + Math.random().toString(16).substring(2, 66)
              }
            : tx
        )
      );
      setIsBridging(false);
      setAmount('');
    }, 8000);
  };

  const swapChains = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
  };

  const getAssetIcon = (symbol: string) => {
    return bridgeAssets.find(asset => asset.symbol === symbol)?.icon || '💰';
  };

  const getChainIcon = (chainId: string) => {
    return supportedChains.find(chain => chain.id === chainId)?.icon || '🔗';
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="cross-chain-bridge">
      <div className="bridge-header">
        <h2 className="bridge-title">🌉 Cross-Chain Bridge</h2>
        <p className="bridge-subtitle">Transfer assets seamlessly across blockchains</p>
      </div>

      <div className="bridge-content">
        {/* Bridge Interface */}
        <div className="bridge-interface">
          <div className="chain-selector-section">
            <div className="chain-selector from-chain">
              <label>From</label>
              <select 
                value={fromChain} 
                onChange={(e) => setFromChain(e.target.value)}
                className="chain-select"
              >
                {supportedChains.map(chain => (
                  <option key={chain.id} value={chain.id}>
                    {chain.icon} {chain.name}
                  </option>
                ))}
              </select>
              <div className="balance-info">
                Balance: {formatAmount(balance)} {selectedAsset}
              </div>
            </div>

            <button className="swap-chains-btn" onClick={swapChains}>
              🔄
            </button>

            <div className="chain-selector to-chain">
              <label>To</label>
              <select 
                value={toChain} 
                onChange={(e) => setToChain(e.target.value)}
                className="chain-select"
              >
                {supportedChains.filter(chain => chain.id !== fromChain).map(chain => (
                  <option key={chain.id} value={chain.id}>
                    {chain.icon} {chain.name}
                  </option>
                ))}
              </select>
              <div className="balance-info">
                Balance: {formatAmount(destinationBalance)} {selectedAsset}
              </div>
            </div>
          </div>

          {/* Asset Selection */}
          <div className="asset-selection">
            <label>Asset to Bridge</label>
            <div className="asset-selector">
              {bridgeAssets.map(asset => (
                <button
                  key={asset.symbol}
                  className={`asset-btn ${selectedAsset === asset.symbol ? 'selected' : ''}`}
                  onClick={() => setSelectedAsset(asset.symbol)}
                >
                  {asset.icon} {asset.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="amount-section">
            <label>Amount</label>
            <div className="amount-input-container">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="amount-input"
                max={balance}
              />
              <button 
                className="max-btn"
                onClick={() => setAmount(balance.toString())}
              >
                MAX
              </button>
            </div>
          </div>

          {/* Route Selection */}
          <div className="route-selection">
            <label>Bridge Route</label>
            <div className="routes-grid">
              {availableRoutes.map(route => (
                <div
                  key={route.protocol}
                  className={`route-card ${selectedRoute === route.protocol ? 'selected' : ''}`}
                  onClick={() => setSelectedRoute(route.protocol)}
                >
                  <div className="route-header">
                    <h4>{route.protocol.charAt(0).toUpperCase() + route.protocol.slice(1)}</h4>
                    <span className="route-fee">{route.fee}% fee</span>
                  </div>
                  <div className="route-metrics">
                    <div className="metric">
                      <span>Time:</span>
                      <span>{route.estimatedTime}</span>
                    </div>
                    <div className="metric">
                      <span>Liquidity:</span>
                      <span>{route.liquidity}%</span>
                    </div>
                    <div className="metric">
                      <span>Reliability:</span>
                      <span>{route.reliability}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bridge Button */}
          <button
            className="bridge-btn"
            onClick={initiateBridge}
            disabled={!amount || !selectedRoute || isBridging}
          >
            {isBridging ? '🌉 Bridging...' : `🚀 Bridge ${selectedAsset}`}
          </button>
        </div>

        {/* Transaction History */}
        <div className="transaction-history">
          <h3>🕒 Bridge History</h3>
          <div className="history-list">
            {bridgeTransactions.length === 0 ? (
              <div className="empty-state">
                <p>No bridge transactions yet</p>
              </div>
            ) : (
              bridgeTransactions.map(tx => (
                <div key={tx.id} className={`transaction-item ${tx.status}`}>
                  <div className="tx-header">
                    <div className="tx-route">
                      {getChainIcon(tx.fromChain)} → {getChainIcon(tx.toChain)}
                    </div>
                    <div className={`tx-status ${tx.status}`}>
                      {tx.status === 'pending' && '⏳ Pending'}
                      {tx.status === 'bridging' && '🌉 Bridging'}
                      {tx.status === 'completed' && '✅ Completed'}
                      {tx.status === 'failed' && '❌ Failed'}
                    </div>
                  </div>
                  <div className="tx-details">
                    <div className="tx-amount">
                      {getAssetIcon(tx.asset)} {formatAmount(tx.amount)} {tx.asset}
                    </div>
                    <div className="tx-fee">
                      Fee: {tx.bridgeFee}%
                    </div>
                    <div className="tx-time">
                      {formatTimeAgo(tx.timestamp)}
                    </div>
                  </div>
                  {tx.status === 'bridging' && (
                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                  )}
                  <div className="tx-links">
                    {tx.txHash && (
                      <a href={`#tx/${tx.txHash}`} className="tx-link">
                        View Source Tx
                      </a>
                    )}
                    {tx.destinationTxHash && (
                      <a href={`#tx/${tx.destinationTxHash}`} className="tx-link">
                        View Destination Tx
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossChainBridge;
