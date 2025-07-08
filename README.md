# 🌙 NocturneSwap - Solana DEX

A complete, production-ready decentralized exchange built on Solana.

## 🚀 Quick Start

### Development Server
```bash
cd frontend
python3 -m http.server 3000
```
Open: `http://localhost:3000/dev.html`

### Production Build
```bash
python3 build.py
cd build
python3 -m http.server 8080
```
Open: `http://localhost:8080`

## 📦 Features

- 🔄 **Token Swapping** with slippage protection
- 🏊 **Liquidity Pools** with yield farming
- 📊 **Admin Dashboard** with analytics
- 🔗 **Wallet Integration** (Phantom, Solflare)
- 📱 **Mobile Responsive** design
- ⚡ **Fast & Secure** Solana-based

## 🏗️ Architecture

- **Smart Contract**: Rust/Anchor (`contracts/programs/nocturne-swap/`)
- **Frontend**: React/TypeScript (`frontend/dev.html`)
- **Build System**: Python-based (no npm required)
- **Tests**: Comprehensive test suite (`tests/`)

## 🚀 Deployment

```bash
# Quick deployment
python3 deploy.py

# Options available:
# 1. GitHub Pages
# 2. Netlify
# 3. Vercel
# 4. Local testing
```

## 📁 Project Structure

```
NocturnePepecult/
├── contracts/          # Solana smart contracts
├── frontend/           # React frontend
├── build/              # Production build
├── tests/              # Test suite
├── build.py            # Build script
├── deploy.py           # Deployment script
└── test-build.py       # Testing utilities
```

## 🛠️ Development

### Prerequisites
- Python 3.7+
- Git

### Setup
```bash
git clone <repository>
cd NocturnePepecult
python3 test-build.py  # Run tests
```

### Available Scripts
```bash
python3 build.py       # Create production build
python3 deploy.py      # Deploy to hosting
python3 test-build.py  # Run test suite
python3 dev-server.py  # Start dev server
```

## 🌟 Live Demo

Visit the live demo at: [Your deployed URL]

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines.

---

**Built with ❤️ for the Solana ecosystem**
. 