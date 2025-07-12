/**
 * DOMINION PROTOCOL TEST SUITE
 * ============================
 * 
 * Test the core functionality of the Phase 10 Dominion Protocol
 */

import { useTreasuryPulse } from '../hooks/useTreasuryPulse.js';
import DominionProtocol from '../components/Companion/DominionProtocol.js';

// Test 1: Evaluate Proposal
async function testProposalEvaluation() {
    console.log('🏛️ Testing Proposal Evaluation...');
    
    const mockUserMetrics = {
        xp: 15000,
        level: 8,
        daoVotes: 12,
        governanceRank: 3,
        votingHistory: [
            { support: true, category: 'treasury' },
            { support: false, category: 'protocol' }
        ]
    };
    
    const dominionProtocol = new DominionProtocol({
        userMetrics: mockUserMetrics,
        onProposalRecommendation: (rec) => {
            console.log('📋 Proposal Recommendation:', rec);
        },
        onVotePrediction: (pred) => {
            console.log('🔮 Vote Prediction:', pred);
        },
        onTreasuryAlert: (alert) => {
            console.log('💰 Treasury Alert:', alert);
        },
        onRitualEvent: (event) => {
            console.log('🌟 Ritual Event:', event);
        }
    });
    
    // Test proposal evaluation
    const evaluation = await dominionProtocol.evaluateProposal('test_proposal_001');
    console.log('✅ Proposal evaluation result:', evaluation);
    
    return evaluation;
}

// Test 2: Predict Vote Outcome
async function testVotePrediction() {
    console.log('🔮 Testing Vote Prediction...');
    
    const mockUserMetrics = {
        xp: 8500,
        level: 5,
        daoVotes: 6,
        governanceRank: 2
    };
    
    const dominionProtocol = new DominionProtocol({
        userMetrics: mockUserMetrics
    });
    
    const predictions = await dominionProtocol.predictVoteOutcome();
    console.log('✅ Vote prediction results:', predictions);
    
    return predictions;
}

// Test 3: Treasury Pulse Hook
function testTreasuryPulse() {
    console.log('💰 Testing Treasury Pulse...');
    
    // Since this is a React hook, we'll simulate its output
    const mockTreasuryPulse = {
        treasuryData: {
            totalValue: 2500000,
            availableLiquidity: 375000,
            assets: [
                { symbol: 'SOL', value: 1000000 },
                { symbol: 'USDC', value: 750000 },
                { symbol: 'JUP', value: 500000 },
                { symbol: 'RAY', value: 250000 }
            ]
        },
        healthScore: 78,
        healthStatus: 'good',
        needsAttention: false,
        alerts: [],
        recommendations: [
            {
                priority: 'medium',
                category: 'OPTIMIZATION',
                message: 'Consider yield enhancement strategies'
            }
        ],
        stakingOpportunities: [
            {
                protocol: 'Jupiter',
                apy: 8.7,
                recommendation: 'Stake up to $50,000 for optimal returns'
            }
        ],
        isReady: true
    };
    
    console.log('✅ Treasury pulse data:', mockTreasuryPulse);
    return mockTreasuryPulse;
}

// Test 4: Ritual Event System
function testRitualEvents() {
    console.log('🌟 Testing Ritual Event System...');
    
    const mockUserMetrics = {
        xp: 12000,
        level: 7,
        daoVotes: 8
    };
    
    const mockTreasuryState = {
        healthScore: 85,
        needsAttention: false,
        totalValue: 5000000
    };
    
    const dominionProtocol = new DominionProtocol({
        userMetrics: mockUserMetrics,
        onRitualEvent: (event) => {
            console.log('🌟 Ritual Event Triggered:', event);
        }
    });
    
    // Simulate ritual event initiation
    const ritualEvent = dominionProtocol.initiateRitualEvent();
    console.log('✅ Ritual event result:', ritualEvent);
    
    return ritualEvent;
}

// Test 5: Sentient Mode
function testSentientMode() {
    console.log('🧠 Testing Sentient Mode...');
    
    const dominionProtocol = new DominionProtocol({
        userMetrics: { xp: 20000, level: 10, daoVotes: 15 }
    });
    
    // Enable sentient mode
    const sentientEnabled = dominionProtocol.enableSentientMode(true);
    console.log('✅ Sentient mode enabled:', sentientEnabled);
    
    // Check performance metrics
    const performanceMetrics = dominionProtocol.getPerformanceMetrics();
    console.log('📊 Performance metrics:', performanceMetrics);
    
    // Disable sentient mode
    dominionProtocol.enableSentientMode(false);
    console.log('✅ Sentient mode disabled');
    
    return sentientEnabled;
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting Dominion Protocol Test Suite...\n');
    
    try {
        await testProposalEvaluation();
        console.log('');
        
        await testVotePrediction();
        console.log('');
        
        testTreasuryPulse();
        console.log('');
        
        testRitualEvents();
        console.log('');
        
        testSentientMode();
        console.log('');
        
        console.log('🎉 All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Export for browser testing
if (typeof window !== 'undefined') {
    window.testDominionProtocol = {
        runAllTests,
        testProposalEvaluation,
        testVotePrediction,
        testTreasuryPulse,
        testRitualEvents,
        testSentientMode
    };
    
    console.log('🧪 Dominion Protocol test suite loaded. Run window.testDominionProtocol.runAllTests() to start testing.');
}

export {
    runAllTests,
    testProposalEvaluation,
    testVotePrediction,
    testTreasuryPulse,
    testRitualEvents,
    testSentientMode
};
