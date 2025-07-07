# 🚀 NocturneSwap Deployment Guide

## 📋 **Prerequisites**

### **System Requirements**
- **Node.js**: 18.x or higher
- **npm**: 8.x or higher
- **Rust**: 1.70+
- **Solana CLI**: 1.17+
- **Anchor**: 0.29+

### **Wallet Setup**
```bash
# Generate a new keypair for deployment
solana-keygen new --outfile ~/.config/solana/deployer-keypair.json

# Set the keypair as default
solana config set --keypair ~/.config/solana/deployer-keypair.json
```

## 🏗️ **Local Development**

### **1. Start Local Validator**
```bash
# Terminal 1: Start validator
solana-test-validator --reset

# Terminal 2: Monitor logs
solana logs
```

### **2. Deploy Smart Contract**
```bash
# Build the contract
anchor build

# Deploy to localnet
anchor deploy

# Get the program ID
anchor keys list
```

### **3. Run Tests**
```bash
# Run all tests
anchor test

# Run specific test
anchor test --grep "swap"
```

### **4. Start Frontend**
```bash
cd frontend
npm install
npm start
```

## 🌐 **Devnet Deployment**

### **1. Configure Network**
```bash
# Set cluster to devnet
solana config set --url https://api.devnet.solana.com

# Request airdrop for deployment
solana airdrop 5
```

### **2. Update Anchor.toml**
```toml
[programs.devnet]
nocturne_swap = "UPDATE_WITH_YOUR_PROGRAM_ID"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/deployer-keypair.json"
```

### **3. Deploy**
```bash
anchor build
anchor deploy --provider.cluster devnet
```

### **4. Update Frontend Config**
```typescript
// frontend/src/config.ts
export const NETWORK = WalletAdapterNetwork.Devnet;
export const RPC_ENDPOINT = "https://api.devnet.solana.com";
export const PROGRAM_ID = "YOUR_DEPLOYED_PROGRAM_ID";
```

## 🏦 **Mainnet Deployment**

### **1. Security Checklist**
- [ ] Audit smart contract code
- [ ] Test all functions thoroughly
- [ ] Verify fee calculations
- [ ] Check slippage protection
- [ ] Validate access controls

### **2. Configure Mainnet**
```bash
# Set cluster to mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Use a secure wallet for deployment
solana config set --keypair ~/.config/solana/mainnet-deployer.json
```

### **3. Update Configuration**
```toml
# Anchor.toml
[programs.mainnet]
nocturne_swap = "YOUR_MAINNET_PROGRAM_ID"

[provider]
cluster = "mainnet"
wallet = "~/.config/solana/mainnet-deployer.json"
```

### **4. Deploy with Verification**
```bash
# Build with release profile
anchor build --verifiable

# Deploy to mainnet
anchor deploy --provider.cluster mainnet-beta

# Verify deployment
anchor verify YOUR_PROGRAM_ID
```

## 🖥️ **Frontend Deployment**

### **1. Environment Setup**
```bash
# frontend/.env.production
REACT_APP_SOLANA_NETWORK=mainnet-beta
REACT_APP_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
REACT_APP_PROGRAM_ID=your_program_id_here
REACT_APP_COMMITMENT=confirmed
```

### **2. Build for Production**
```bash
cd frontend
npm run build
```

### **3. Deploy Options**

#### **Vercel Deployment**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### **Netlify Deployment**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=build
```

#### **AWS S3 + CloudFront**
```bash
# Build
npm run build

# Upload to S3
aws s3 sync build/ s3://your-bucket-name

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## 🔧 **Configuration Management**

### **Program IDs**
```typescript
// Keep track of deployed program IDs
export const PROGRAM_IDS = {
  localnet: "5X9KmqJtJbNrfvA3p8X4A3d4YQ9ZqXqQzJZQzJZQzJZQ",
  devnet: "UPDATE_WITH_DEVNET_ID",
  mainnet: "UPDATE_WITH_MAINNET_ID"
};
```

### **RPC Endpoints**
```typescript
export const RPC_ENDPOINTS = {
  localnet: "http://localhost:8899",
  devnet: "https://api.devnet.solana.com",
  mainnet: "https://api.mainnet-beta.solana.com"
};
```

## 📊 **Post-Deployment**

### **1. Initialize Pool**
```bash
# Create initial liquidity pool
anchor run initialize-pool --provider.cluster mainnet-beta
```

### **2. Add Initial Liquidity**
```bash
# Add liquidity to bootstrap the pool
anchor run add-liquidity --provider.cluster mainnet-beta
```

### **3. Verify Functionality**
```bash
# Test swap functionality
anchor run test-swap --provider.cluster mainnet-beta
```

## 🔍 **Monitoring**

### **1. Set Up Monitoring**
```bash
# Monitor program logs
solana logs YOUR_PROGRAM_ID

# Check account balance
solana balance YOUR_POOL_ADDRESS
```

### **2. Analytics Setup**
- Set up Solana Beach monitoring
- Configure custom dashboards
- Set up alerts for unusual activity

## 🛡️ **Security Best Practices**

### **1. Key Management**
- Use hardware wallets for mainnet
- Implement multi-sig for admin functions
- Rotate keys regularly

### **2. Access Controls**
- Implement proper admin controls
- Use time-locked upgrades
- Set up emergency stops

### **3. Monitoring**
- Monitor all transactions
- Set up alerts for large swaps
- Track fee collection

## 🚨 **Emergency Procedures**

### **1. Pause Protocol**
```rust
// Emergency pause function
pub fn emergency_pause(ctx: Context<EmergencyPause>) -> Result<()> {
    // Implementation
}
```

### **2. Upgrade Process**
```bash
# Upgrade program
anchor upgrade target/deploy/nocturne_swap.so --program-id YOUR_PROGRAM_ID --provider.cluster mainnet-beta
```

### **3. Recovery**
- Document all emergency procedures
- Test recovery mechanisms
- Maintain backup plans

## 📈 **Performance Optimization**

### **1. RPC Configuration**
```typescript
// Use premium RPC endpoints for better performance
const connection = new Connection(
  "https://your-premium-rpc-endpoint.com",
  {
    commitment: "confirmed",
    wsEndpoint: "wss://your-websocket-endpoint.com"
  }
);
```

### **2. Caching Strategy**
- Implement token price caching
- Cache user balances
- Use CDN for static assets

### **3. Load Testing**
```bash
# Test with multiple concurrent users
anchor test --parallel 10
```

## 📋 **Deployment Checklist**

### **Pre-Deployment**
- [ ] Code review completed
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Backup plans in place

### **During Deployment**
- [ ] Monitor deployment process
- [ ] Verify program ID
- [ ] Test basic functionality
- [ ] Check all integrations

### **Post-Deployment**
- [ ] Initialize pools
- [ ] Add initial liquidity
- [ ] Test all features
- [ ] Monitor for issues
- [ ] Update documentation

## 🔄 **Continuous Deployment**

### **1. CI/CD Pipeline**
```yaml
# .github/workflows/deploy.yml
name: Deploy NocturneSwap
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Solana
        uses: ./.github/actions/setup-solana
      - name: Deploy
        run: |
          anchor build
          anchor deploy --provider.cluster mainnet-beta
```

### **2. Automated Testing**
```bash
# Run tests on every deployment
npm run test:all
```

---

**For support, contact the NocturnePepe community:**
- **Telegram**: [@NocturnePepe](https://t.me/NocturnePepe)
- **Twitter**: [@NocturnePEPE](https://x.com/NocturnePEPE)

*Remember: Always test thoroughly before mainnet deployment!*
