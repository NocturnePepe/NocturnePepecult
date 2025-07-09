import React, { useState, useEffect } from 'react';
import './GovernanceDAO.css';

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: 'active' | 'passed' | 'failed' | 'queued' | 'executed';
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  quorum: number;
  endTime: string;
  category: 'parameter' | 'upgrade' | 'treasury' | 'general';
  executionTime?: string;
}

interface VotingPower {
  staked: number;
  delegated: number;
  total: number;
  lockedUntil: string;
}

interface TreasuryStats {
  totalValue: number;
  tokens: { symbol: string; amount: number; value: number }[];
  monthlyIncome: number;
  monthlyExpenses: number;
}

const GovernanceDAO: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [votingPower, setVotingPower] = useState<VotingPower | null>(null);
  const [treasuryStats, setTreasuryStats] = useState<TreasuryStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateProposal, setShowCreateProposal] = useState<boolean>(false);
  const [userVotes, setUserVotes] = useState<{ [key: string]: 'for' | 'against' }>({});

  useEffect(() => {
    loadGovernanceData();
  }, []);

  const loadGovernanceData = () => {
    // Mock proposals data
    const mockProposals: Proposal[] = [
      {
        id: 'prop-001',
        title: 'Reduce Trading Fees to 0.25%',
        description: 'Lower the current trading fee from 0.3% to 0.25% to increase competitiveness and attract more volume.',
        proposer: '7xKXtg...9rQ8mP',
        status: 'active',
        votesFor: 125000,
        votesAgainst: 45000,
        totalVotes: 170000,
        quorum: 100000,
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'parameter'
      },
      {
        id: 'prop-002',
        title: 'Treasury Allocation for Marketing',
        description: 'Allocate 500,000 USDC from treasury for Q2 marketing campaigns and partnership development.',
        proposer: 'AKz9p...8nM4vL',
        status: 'active',
        votesFor: 89000,
        votesAgainst: 23000,
        totalVotes: 112000,
        quorum: 100000,
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'treasury'
      },
      {
        id: 'prop-003',
        title: 'Upgrade AMM Algorithm',
        description: 'Implement new concentrated liquidity AMM to improve capital efficiency and reduce slippage.',
        proposer: 'BPm4k...6qR2wX',
        status: 'passed',
        votesFor: 234000,
        votesAgainst: 67000,
        totalVotes: 301000,
        quorum: 100000,
        endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'upgrade',
        executionTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'prop-004',
        title: 'Add Support for New Tokens',
        description: 'Enable trading support for MNGO, ORCA, and STEP tokens based on community demand.',
        proposer: 'CNx7q...4tL9sY',
        status: 'queued',
        votesFor: 156000,
        votesAgainst: 78000,
        totalVotes: 234000,
        quorum: 100000,
        endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'general'
      }
    ];

    setProposals(mockProposals);

    // Mock voting power
    setVotingPower({
      staked: 15000,
      delegated: 5000,
      total: 20000,
      lockedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });

    // Mock treasury stats
    setTreasuryStats({
      totalValue: 12500000,
      tokens: [
        { symbol: 'USDC', amount: 8500000, value: 8500000 },
        { symbol: 'SOL', amount: 15000, value: 2137500 },
        { symbol: 'RAY', amount: 500000, value: 1725000 },
        { symbol: 'SRM', amount: 250000, value: 145000 }
      ],
      monthlyIncome: 450000,
      monthlyExpenses: 180000
    });
  };

  const castVote = (proposalId: string, vote: 'for' | 'against') => {
    if (!votingPower) {
      alert('Please stake tokens to vote');
      return;
    }

    setUserVotes(prev => ({ ...prev, [proposalId]: vote }));
    
    // Update proposal vote counts
    setProposals(prev => 
      prev.map(proposal => {
        if (proposal.id === proposalId) {
          const prevVote = userVotes[proposalId];
          let newVotesFor = proposal.votesFor;
          let newVotesAgainst = proposal.votesAgainst;
          
          // Remove previous vote if exists
          if (prevVote === 'for') newVotesFor -= votingPower.total;
          if (prevVote === 'against') newVotesAgainst -= votingPower.total;
          
          // Add new vote
          if (vote === 'for') newVotesFor += votingPower.total;
          if (vote === 'against') newVotesAgainst += votingPower.total;
          
          return {
            ...proposal,
            votesFor: newVotesFor,
            votesAgainst: newVotesAgainst,
            totalVotes: newVotesFor + newVotesAgainst
          };
        }
        return proposal;
      })
    );
  };

  const getProposalProgress = (proposal: Proposal) => {
    const forPercentage = (proposal.votesFor / proposal.totalVotes) * 100;
    const againstPercentage = (proposal.votesAgainst / proposal.totalVotes) * 100;
    const quorumPercentage = (proposal.totalVotes / proposal.quorum) * 100;
    
    return { forPercentage, againstPercentage, quorumPercentage };
  };

  const getTimeRemaining = (endTime: string): string => {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  const filteredProposals = selectedCategory === 'all' 
    ? proposals 
    : proposals.filter(p => p.category === selectedCategory);

  return (
    <div className="governance-dao">
      <div className="dao-header holo-card">
        <h1 className="holo-text">🏛️ Governance Council</h1>
        <p className="font-mystical">Shape the future of NocturneSwap through collective wisdom</p>
        
        <div className="governance-stats">
          <div className="stat-item">
            <div className="stat-value holo-text">{proposals.length}</div>
            <div className="stat-label">Total Proposals</div>
          </div>
          <div className="stat-item">
            <div className="stat-value holo-text">{formatCurrency(treasuryStats?.totalValue || 0)}</div>
            <div className="stat-label">Treasury Value</div>
          </div>
          <div className="stat-item">
            <div className="stat-value holo-text">{formatNumber(votingPower?.total || 0)}</div>
            <div className="stat-label">Your Voting Power</div>
          </div>
        </div>
      </div>

      <div className="dao-content">
        <div className="dao-main">
          {/* Category Filter */}
          <div className="category-filter holo-card">
            <div className="filter-buttons">
              {['all', 'parameter', 'upgrade', 'treasury', 'general'].map(category => (
                <button
                  key={category}
                  className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
            
            <button 
              className="glow-btn create-proposal"
              onClick={() => setShowCreateProposal(true)}
            >
              ✨ Create Proposal
            </button>
          </div>

          {/* Proposals List */}
          <div className="proposals-list">
            {filteredProposals.map(proposal => {
              const { forPercentage, againstPercentage, quorumPercentage } = getProposalProgress(proposal);
              const userVote = userVotes[proposal.id];
              
              return (
                <div key={proposal.id} className="proposal-card holo-card">
                  <div className="proposal-header">
                    <div className="proposal-meta">
                      <span className={`proposal-status ${proposal.status}`}>
                        {proposal.status.toUpperCase()}
                      </span>
                      <span className="proposal-category">
                        {proposal.category}
                      </span>
                      <span className="proposal-id">#{proposal.id}</span>
                    </div>
                    
                    <div className="proposal-time">
                      {proposal.status === 'active' ? (
                        <span className="time-remaining">
                          ⏰ {getTimeRemaining(proposal.endTime)} remaining
                        </span>
                      ) : proposal.executionTime ? (
                        <span className="execution-time">
                          🚀 Executes in {getTimeRemaining(proposal.executionTime)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="proposal-content">
                    <h3 className="proposal-title">{proposal.title}</h3>
                    <p className="proposal-description">{proposal.description}</p>
                    
                    <div className="proposal-proposer">
                      Proposed by: <span className="proposer-address">{proposal.proposer}</span>
                    </div>
                  </div>

                  <div className="voting-section">
                    <div className="vote-bars">
                      <div className="vote-bar for">
                        <div className="vote-label">
                          <span>For</span>
                          <span>{formatNumber(proposal.votesFor)} ({forPercentage.toFixed(1)}%)</span>
                        </div>
                        <div className="vote-progress">
                          <div 
                            className="vote-fill for" 
                            style={{ width: `${forPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="vote-bar against">
                        <div className="vote-label">
                          <span>Against</span>
                          <span>{formatNumber(proposal.votesAgainst)} ({againstPercentage.toFixed(1)}%)</span>
                        </div>
                        <div className="vote-progress">
                          <div 
                            className="vote-fill against" 
                            style={{ width: `${againstPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="quorum-status">
                      <span>Quorum: {formatNumber(proposal.totalVotes)} / {formatNumber(proposal.quorum)}</span>
                      <span className={quorumPercentage >= 100 ? 'met' : 'pending'}>
                        ({quorumPercentage.toFixed(1)}%)
                      </span>
                    </div>

                    {proposal.status === 'active' && (
                      <div className="vote-buttons">
                        <button
                          className={`vote-btn for ${userVote === 'for' ? 'voted' : ''}`}
                          onClick={() => castVote(proposal.id, 'for')}
                          disabled={!votingPower}
                        >
                          {userVote === 'for' ? '✅ Voted For' : '👍 Vote For'}
                        </button>
                        <button
                          className={`vote-btn against ${userVote === 'against' ? 'voted' : ''}`}
                          onClick={() => castVote(proposal.id, 'against')}
                          disabled={!votingPower}
                        >
                          {userVote === 'against' ? '❌ Voted Against' : '👎 Vote Against'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="dao-sidebar">
          {/* Voting Power */}
          <div className="voting-power holo-card">
            <h3 className="ember-glow">Your Voting Power</h3>
            {votingPower ? (
              <div className="power-breakdown">
                <div className="power-item">
                  <span>Staked Tokens</span>
                  <span className="holo-text">{formatNumber(votingPower.staked)}</span>
                </div>
                <div className="power-item">
                  <span>Delegated to You</span>
                  <span className="holo-text">{formatNumber(votingPower.delegated)}</span>
                </div>
                <div className="power-total">
                  <span>Total Power</span>
                  <span className="holo-text">{formatNumber(votingPower.total)}</span>
                </div>
                <div className="lock-info">
                  Locked until: {new Date(votingPower.lockedUntil).toLocaleDateString()}
                </div>
                <button className="glow-btn">Increase Stake</button>
              </div>
            ) : (
              <div className="no-power">
                <p>Stake NOCTURNE tokens to participate in governance</p>
                <button className="glow-btn">Stake Tokens</button>
              </div>
            )}
          </div>

          {/* Treasury Overview */}
          <div className="treasury-overview holo-card">
            <h3 className="ember-glow">Treasury Status</h3>
            {treasuryStats && (
              <div className="treasury-content">
                <div className="treasury-total">
                  <span>Total Value</span>
                  <span className="holo-text">{formatCurrency(treasuryStats.totalValue)}</span>
                </div>
                
                <div className="treasury-breakdown">
                  {treasuryStats.tokens.map(token => (
                    <div key={token.symbol} className="treasury-token">
                      <span>{token.symbol}</span>
                      <span>{formatNumber(token.amount)}</span>
                      <span>{formatCurrency(token.value)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="treasury-flow">
                  <div className="flow-item income">
                    <span>Monthly Income</span>
                    <span className="positive">+{formatCurrency(treasuryStats.monthlyIncome)}</span>
                  </div>
                  <div className="flow-item expense">
                    <span>Monthly Expenses</span>
                    <span className="negative">-{formatCurrency(treasuryStats.monthlyExpenses)}</span>
                  </div>
                  <div className="flow-item net">
                    <span>Net Flow</span>
                    <span className="positive">
                      +{formatCurrency(treasuryStats.monthlyIncome - treasuryStats.monthlyExpenses)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Governance Calendar */}
          <div className="governance-calendar holo-card">
            <h3 className="ember-glow">Upcoming Events</h3>
            <div className="calendar-events">
              <div className="calendar-event">
                <div className="event-date">Mar 15</div>
                <div className="event-info">
                  <div className="event-title">Quarterly Treasury Report</div>
                  <div className="event-type">📊 Report</div>
                </div>
              </div>
              <div className="calendar-event">
                <div className="event-date">Mar 20</div>
                <div className="event-info">
                  <div className="event-title">Community Call</div>
                  <div className="event-type">🎙️ Meeting</div>
                </div>
              </div>
              <div className="calendar-event">
                <div className="event-date">Mar 25</div>
                <div className="event-info">
                  <div className="event-title">Proposal Deadline</div>
                  <div className="event-type">⏰ Deadline</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernanceDAO;
