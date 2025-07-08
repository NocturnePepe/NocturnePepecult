// GovernanceDAO.tsx - Cult-themed DAO governance and voting interface
import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { cultSounds } from '../SoundEffects.js';
import './GovernanceDAO.css';

interface Proposal {
  id: string;
  title: string;
  description: string;
  category: 'protocol' | 'treasury' | 'community' | 'ritual';
  proposer: string;
  status: 'active' | 'passed' | 'rejected' | 'pending';
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  quorum: number;
  endTime: Date;
  executionTime?: Date;
  votingPower: number;
  userVote?: 'for' | 'against' | null;
  executionStatus?: 'pending' | 'executed' | 'failed';
}

interface GovernanceStats {
  totalProposals: number;
  activeProposals: number;
  totalVoters: number;
  treasuryValue: number;
  userVotingPower: number;
  userGovernanceLevel: number;
}

interface GovernanceDAOProps {
  isVisible: boolean;
  onClose: () => void;
  connection: any;
}

const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 'prop_001',
    title: 'Implement 0.1% Trading Fee Reduction for High-Volume Cultists',
    description: 'Proposal to reduce trading fees by 0.1% for users who have completed over 100 swaps and maintain a minimum balance of 1000 SOL equivalent. This will incentivize loyalty and increase platform volume.',
    category: 'protocol',
    proposer: 'VoidMaster_666',
    status: 'active',
    votesFor: 15420,
    votesAgainst: 3280,
    totalVotes: 18700,
    quorum: 20000,
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    votingPower: 50,
    userVote: null
  },
  {
    id: 'prop_002',
    title: 'Establish Dark Pool Ritual Treasury Fund',
    description: 'Create a community treasury fund of 100,000 SOL to be used for liquidity incentives, bug bounties, and community events. Funds will be managed by elected council members.',
    category: 'treasury',
    proposer: 'ShadowCouncil',
    status: 'active',
    votesFor: 22100,
    votesAgainst: 1800,
    totalVotes: 23900,
    quorum: 20000,
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    votingPower: 75,
    userVote: 'for'
  },
  {
    id: 'prop_003',
    title: 'Weekly Midnight Trading Ritual Events',
    description: 'Host special midnight trading events every Friday with bonus rewards, reduced fees, and exclusive NFT drops for participants. Events will feature cult-themed challenges and community competitions.',
    category: 'community',
    proposer: 'NightCultist',
    status: 'passed',
    votesFor: 18500,
    votesAgainst: 2200,
    totalVotes: 20700,
    quorum: 20000,
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    executionTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    votingPower: 85,
    userVote: 'for',
    executionStatus: 'pending'
  },
  {
    id: 'prop_004',
    title: 'Integrate Multi-Chain Bridge for Ethereum Cultists',
    description: 'Develop and integrate a cross-chain bridge to allow Ethereum users to participate in NocturneSwap rituals. This will expand our cult beyond Solana and increase total addressable market.',
    category: 'protocol',
    proposer: 'BridgeMaster',
    status: 'rejected',
    votesFor: 8200,
    votesAgainst: 15800,
    totalVotes: 24000,
    quorum: 20000,
    endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    votingPower: 45,
    userVote: 'against'
  }
];

const GovernanceDAO = ({ isVisible, onClose, connection }: GovernanceDAOProps) => {
  const { publicKey, connected } = useWallet();
  const [proposals, setProposals] = useState(MOCK_PROPOSALS);
  const [selectedTab, setSelectedTab] = useState('proposals');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [governanceStats, setGovernanceStats] = useState({
    totalProposals: 47,
    activeProposals: 12,
    totalVoters: 2847,
    treasuryValue: 185000,
    userVotingPower: 250,
    userGovernanceLevel: 3
  });
  
  // New proposal form state
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    category: 'protocol',
    executionDelay: 7 // days
  });
  
  const [votingOnProposal, setVotingOnProposal] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Load user's governance data
  useEffect(() => {
    if (connected && publicKey) {
      loadUserGovernanceData();
    }
  }, [connected, publicKey]);

  const loadUserGovernanceData = async () => {
    // In a real implementation, this would fetch from blockchain
    const savedVotes = localStorage.getItem(`governance_votes_${publicKey?.toString()}`);
    if (savedVotes) {
      const userVotes = JSON.parse(savedVotes);
      const updatedProposals = proposals.map(proposal => ({
        ...proposal,
        userVote: userVotes[proposal.id] || null
      }));
      setProposals(updatedProposals);
    }
  };

  const handleVote = useCallback(async (proposalId: string, vote: 'for' | 'against') => {
    if (!connected || !publicKey || votingOnProposal) return;
    
    setVotingOnProposal(proposalId);
    await cultSounds.playSwapSound();
    
    try {
      // Simulate voting delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update proposal with user's vote
      const updatedProposals = proposals.map(proposal => {
        if (proposal.id === proposalId) {
          const votePower = governanceStats.userVotingPower;
          return {
            ...proposal,
            userVote: vote,
            votesFor: proposal.votesFor + (vote === 'for' ? votePower : 0),
            votesAgainst: proposal.votesAgainst + (vote === 'against' ? votePower : 0),
            totalVotes: proposal.totalVotes + votePower
          };
        }
        return proposal;
      });
      
      setProposals(updatedProposals);
      
      // Save user's vote locally
      const savedVotes = localStorage.getItem(`governance_votes_${publicKey.toString()}`) || '{}';
      const userVotes = JSON.parse(savedVotes);
      userVotes[proposalId] = vote;
      localStorage.setItem(`governance_votes_${publicKey.toString()}`, JSON.stringify(userVotes));
      
      await cultSounds.playConnectSound();
    } catch (error) {
      console.error('Voting failed:', error);
      await cultSounds.playErrorSound();
    } finally {
      setVotingOnProposal(null);
    }
  }, [connected, publicKey, votingOnProposal, proposals, governanceStats.userVotingPower]);

  const handleCreateProposal = useCallback(async () => {
    if (!connected || !publicKey || !newProposal.title.trim() || !newProposal.description.trim()) return;
    
    await cultSounds.playSwapSound();
    
    try {
      const proposal: Proposal = {
        id: `prop_${Date.now()}`,
        title: newProposal.title,
        description: newProposal.description,
        category: newProposal.category,
        proposer: publicKey.toString().slice(0, 8) + '...',
        status: 'pending',
        votesFor: 0,
        votesAgainst: 0,
        totalVotes: 0,
        quorum: 20000,
        endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        votingPower: 0,
        userVote: null
      };
      
      setProposals([proposal, ...proposals]);
      setNewProposal({ title: '', description: '', category: 'protocol', executionDelay: 7 });
      setShowCreateForm(false);
      
      await cultSounds.playConnectSound();
    } catch (error) {
      console.error('Proposal creation failed:', error);
      await cultSounds.playErrorSound();
    }
  }, [connected, publicKey, newProposal, proposals]);

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#ffa500';
      case 'passed': return '#00ff88';
      case 'rejected': return '#ff4444';
      case 'pending': return '#8888ff';
      default: return '#cccccc';
    }
  };

  const filteredProposals = proposals
    .filter(proposal => filterStatus === 'all' || proposal.status === filterStatus)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
        case 'ending':
          return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
        case 'popular':
          return b.totalVotes - a.totalVotes;
        default:
          return 0;
      }
    });

  if (!isVisible) return null;

  return (
    <div className="governance-modal-overlay">
      <div className="governance-modal">
        <div className="governance-header">
          <h2>🗳️ Cult Governance DAO</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Governance Stats */}
        <div className="governance-stats">
          <div className="stat-card">
            <span className="stat-value">{governanceStats.totalProposals}</span>
            <span className="stat-label">Total Proposals</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{governanceStats.activeProposals}</span>
            <span className="stat-label">Active Votes</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{governanceStats.totalVoters.toLocaleString()}</span>
            <span className="stat-label">Cult Members</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{governanceStats.treasuryValue.toLocaleString()} SOL</span>
            <span className="stat-label">Treasury</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{governanceStats.userVotingPower}</span>
            <span className="stat-label">Your Power</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="governance-tabs">
          <button 
            className={selectedTab === 'proposals' ? 'active' : ''}
            onClick={() => setSelectedTab('proposals')}
          >
            📜 Proposals
          </button>
          <button 
            className={selectedTab === 'create' ? 'active' : ''}
            onClick={() => setSelectedTab('create')}
          >
            ✨ Create
          </button>
          <button 
            className={selectedTab === 'council' ? 'active' : ''}
            onClick={() => setSelectedTab('council')}
          >
            👥 Council
          </button>
          <button 
            className={selectedTab === 'treasury' ? 'active' : ''}
            onClick={() => setSelectedTab('treasury')}
          >
            💰 Treasury
          </button>
        </div>

        <div className="governance-content">
          {selectedTab === 'proposals' && (
            <>
              {/* Filters and Sorting */}
              <div className="proposal-controls">
                <div className="filter-group">
                  <label>Status:</label>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="passed">Passed</option>
                    <option value="rejected">Rejected</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Sort by:</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                    <option value="newest">Newest</option>
                    <option value="ending">Ending Soon</option>
                    <option value="popular">Most Votes</option>
                  </select>
                </div>
              </div>

              {/* Proposals List */}
              <div className="proposals-list">
                {filteredProposals.map(proposal => (
                  <div key={proposal.id} className={`proposal-card ${proposal.status}`}>
                    <div className="proposal-header">
                      <div className="proposal-meta">
                        <span 
                          className="proposal-status"
                          style={{ color: getStatusColor(proposal.status) }}
                        >
                          {proposal.status.toUpperCase()}
                        </span>
                        <span className="proposal-category">{proposal.category}</span>
                        <span className="proposal-time">{getTimeRemaining(proposal.endTime)}</span>
                      </div>
                      <div className="proposal-id">#{proposal.id.split('_')[1]}</div>
                    </div>
                    
                    <h3 className="proposal-title">{proposal.title}</h3>
                    <p className="proposal-description">{proposal.description}</p>
                    
                    <div className="proposal-stats">
                      <div className="vote-bars">
                        <div className="vote-bar for">
                          <div 
                            className="vote-fill"
                            style={{ width: `${(proposal.votesFor / Math.max(proposal.totalVotes, 1)) * 100}%` }}
                          />
                          <span className="vote-label">For: {proposal.votesFor.toLocaleString()}</span>
                        </div>
                        <div className="vote-bar against">
                          <div 
                            className="vote-fill"
                            style={{ width: `${(proposal.votesAgainst / Math.max(proposal.totalVotes, 1)) * 100}%` }}
                          />
                          <span className="vote-label">Against: {proposal.votesAgainst.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="proposal-progress">
                        <span>Quorum: {proposal.totalVotes.toLocaleString()} / {proposal.quorum.toLocaleString()}</span>
                        <div className="quorum-bar">
                          <div 
                            className="quorum-fill"
                            style={{ width: `${Math.min((proposal.totalVotes / proposal.quorum) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {proposal.status === 'active' && connected && !proposal.userVote && (
                      <div className="vote-actions">
                        <button 
                          className="vote-btn for"
                          onClick={() => handleVote(proposal.id, 'for')}
                          disabled={votingOnProposal === proposal.id}
                          onMouseEnter={() => cultSounds.playHoverSound()}
                        >
                          {votingOnProposal === proposal.id ? '🕯️ Voting...' : '✅ Vote For'}
                        </button>
                        <button 
                          className="vote-btn against"
                          onClick={() => handleVote(proposal.id, 'against')}
                          disabled={votingOnProposal === proposal.id}
                          onMouseEnter={() => cultSounds.playHoverSound()}
                        >
                          {votingOnProposal === proposal.id ? '🕯️ Voting...' : '❌ Vote Against'}
                        </button>
                      </div>
                    )}
                    
                    {proposal.userVote && (
                      <div className="user-vote-status">
                        You voted: <strong style={{ color: proposal.userVote === 'for' ? '#00ff88' : '#ff4444' }}>
                          {proposal.userVote.toUpperCase()}
                        </strong>
                      </div>
                    )}
                    
                    <div className="proposal-footer">
                      <span>Proposed by: {proposal.proposer}</span>
                      {proposal.executionTime && (
                        <span>Execution: {proposal.executionTime.toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {selectedTab === 'create' && (
            <div className="create-proposal-tab">
              <div className="create-proposal-header">
                <h3>🔮 Create New Proposal</h3>
                <p>Shape the future of the NocturnePepe cult through democratic governance</p>
              </div>
              
              <div className="proposal-form">
                <div className="form-group">
                  <label>Proposal Title</label>
                  <input
                    type="text"
                    value={newProposal.title}
                    onChange={(e) => setNewProposal({...newProposal, title: e.target.value})}
                    placeholder="Enter a clear, descriptive title..."
                    maxLength={100}
                  />
                </div>
                
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newProposal.category}
                    onChange={(e) => setNewProposal({...newProposal, category: e.target.value as any})}
                  >
                    <option value="protocol">Protocol Changes</option>
                    <option value="treasury">Treasury Management</option>
                    <option value="community">Community Initiatives</option>
                    <option value="ritual">Ritual Enhancements</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newProposal.description}
                    onChange={(e) => setNewProposal({...newProposal, description: e.target.value})}
                    placeholder="Provide detailed description, rationale, and implementation plan..."
                    rows={6}
                    maxLength={1000}
                  />
                  <span className="char-count">{newProposal.description.length}/1000</span>
                </div>
                
                <div className="form-group">
                  <label>Execution Delay (days)</label>
                  <input
                    type="number"
                    value={newProposal.executionDelay}
                    onChange={(e) => setNewProposal({...newProposal, executionDelay: parseInt(e.target.value)})}
                    min={1}
                    max={30}
                  />
                  <span className="input-help">Time delay before execution if proposal passes</span>
                </div>
                
                <button 
                  className="create-proposal-btn"
                  onClick={handleCreateProposal}
                  disabled={!connected || !newProposal.title.trim() || !newProposal.description.trim()}
                  onMouseEnter={() => cultSounds.playHoverSound()}
                >
                  🌙 Submit Proposal
                </button>
              </div>
            </div>
          )}

          {selectedTab === 'council' && (
            <div className="council-tab">
              <h3>👥 Shadow Council</h3>
              <p>Elected members who oversee proposal execution and treasury management</p>
              
              <div className="council-members">
                <div className="council-member">
                  <div className="member-avatar">🌙</div>
                  <div className="member-info">
                    <h4>VoidMaster_666</h4>
                    <p>Lead Architect • 15,420 votes</p>
                    <div className="member-term">Term: 6 months remaining</div>
                  </div>
                </div>
                
                <div className="council-member">
                  <div className="member-avatar">⚡</div>
                  <div className="member-info">
                    <h4>ShadowCouncil</h4>
                    <p>Treasury Guardian • 12,850 votes</p>
                    <div className="member-term">Term: 4 months remaining</div>
                  </div>
                </div>
                
                <div className="council-member">
                  <div className="member-avatar">🔮</div>
                  <div className="member-info">
                    <h4>NightCultist</h4>
                    <p>Community Lead • 11,200 votes</p>
                    <div className="member-term">Term: 8 months remaining</div>
                  </div>
                </div>
              </div>
              
              <div className="next-election">
                <h4>🗳️ Next Election</h4>
                <p>Council elections occur every 6 months. Next election: <strong>March 15, 2025</strong></p>
                <button className="election-btn" disabled>
                  Nominations Open Soon
                </button>
              </div>
            </div>
          )}

          {selectedTab === 'treasury' && (
            <div className="treasury-tab">
              <h3>💰 Cult Treasury</h3>
              <p>Community-controlled funds for development, rewards, and ecosystem growth</p>
              
              <div className="treasury-overview">
                <div className="treasury-balance">
                  <h4>Total Balance</h4>
                  <div className="balance-amount">185,420 SOL</div>
                  <div className="balance-usd">~$18.5M USD</div>
                </div>
                
                <div className="treasury-allocation">
                  <h4>Allocation</h4>
                  <div className="allocation-item">
                    <span>Development Fund</span>
                    <span>40% (74,168 SOL)</span>
                  </div>
                  <div className="allocation-item">
                    <span>Liquidity Incentives</span>
                    <span>30% (55,626 SOL)</span>
                  </div>
                  <div className="allocation-item">
                    <span>Community Rewards</span>
                    <span>20% (37,084 SOL)</span>
                  </div>
                  <div className="allocation-item">
                    <span>Emergency Reserve</span>
                    <span>10% (18,542 SOL)</span>
                  </div>
                </div>
              </div>
              
              <div className="recent-spending">
                <h4>📊 Recent Activity</h4>
                <div className="spending-item">
                  <span>Jupiter Integration Bounty</span>
                  <span className="spending-amount">-2,500 SOL</span>
                  <span className="spending-date">7 days ago</span>
                </div>
                <div className="spending-item">
                  <span>UI/UX Enhancement Fund</span>
                  <span className="spending-amount">-1,200 SOL</span>
                  <span className="spending-date">14 days ago</span>
                </div>
                <div className="spending-item">
                  <span>Security Audit Payment</span>
                  <span className="spending-amount">-3,000 SOL</span>
                  <span className="spending-date">21 days ago</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GovernanceDAO;
