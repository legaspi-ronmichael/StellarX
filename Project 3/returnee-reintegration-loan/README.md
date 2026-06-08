# 🏀 Community Sports League Dues & Payout Ledger

A transparent, blockchain-powered system for managing community sports league finances on the **Stellar** network. Collect team registration fees and distribute prize payouts with full on-chain transparency.

## 🌟 Why Stellar?

- **Transparent Dues Collection** — Every payment is recorded on the Stellar ledger
- **Automated Prize Distribution** — Multi-signature payouts to winning teams
- **Auditable History** — Anyone can verify transactions on the public ledger
- **Low Fees** — Fractions of a cent per transaction
- **Fast Settlement** — 3-5 second finality

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  React Frontend │ ◄─────► │  Express API    │ ◄─────► │  Stellar SDK    │
│  (Vite + Tail)  │   HTTP  │  (Node.js)      │  TXNS   │  (Testnet)      │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │    MongoDB      │
                            │  (Users, Leagues│
                            │  Teams, Payouts)│
                            └─────────────────┘
```

## ✨ Features

### 👥 For League Admins
- Create and manage leagues (basketball/volleyball)
- Set registration fees and prize pool structure
- Multi-signature treasury for prize pool custody
- View complete payment and payout history
- Public transparency dashboard
- Declare winners and trigger automated payouts

### 🏀 For Team Captains
- Register teams in active leagues
- Invite and manage players
- Pay team registration fees via Stellar
- Track team payment status
- Receive automated prize payouts on victory

### 🏃 For Players
- Join teams with invite codes
- View league standings and brackets
- Pay individual contributions
- View complete on-chain transaction history

### 🌐 For Everyone (Public)
- Browse active leagues
- View transparent ledger of all dues and payouts
- See league statistics and analytics
- Verify any transaction on Stellar's block explorer

## 🚀 Tech Stack

**Frontend**
- React 18 (Vite)
- TailwindCSS
- React Router v6
- Stellar SDK (`@stellar/stellar-sdk`)
- Freighter Wallet integration
- Recharts (analytics)
- Axios (API client)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Stellar SDK (server-side transaction signing)
- JWT authentication
- Bcrypt password hashing
- Multi-signature escrow accounts

**Blockchain**
- Stellar Testnet (development)
- Native XLM asset
- Multi-sig treasury accounts
- On-chain memo tags for transaction context

## 📁 Project Structure

```
Project 2/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & Stellar config
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API endpoints
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth, error handling
│   │   ├── services/        # Stellar service layer
│   │   └── utils/           # Helpers
│   ├── server.js            # Entry point
│   ├── seed.js              # Seed demo data
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI
│   │   ├── pages/           # Route pages
│   │   ├── contexts/        # Auth & Wallet contexts
│   │   ├── services/        # API + Stellar clients
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── README.md
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+ (local or Atlas)
- [Freighter Wallet](https://www.freighter.app/) browser extension
- Git

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd "Project 2"

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stellar-league
JWT_SECRET=your_super_secret_jwt_key_change_me
STELLAR_NETWORK=TESTNET
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_STELLAR_NETWORK=TESTNET
VITE_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
```

### 3. Seed Demo Data

```bash
cd backend
npm run seed
```

This creates demo accounts, leagues, and teams. It also funds test wallets with testnet XLM via Friendbot.

### 4. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 🔑 Demo Accounts (after seeding)

| Role          | Email                        | Password    |
|---------------|------------------------------|-------------|
| League Admin  | admin@league.test            | demo1234    |
| Team Captain  | captain1@league.test         | demo1234    |
| Team Captain  | captain2@league.test         | demo1234    |
| Player        | player1@league.test          | demo1234    |

> ⚠️ **Freighter Setup**: Each test user has a Stellar keypair stored in the seed output. Import the secret key into Freighter to act as that user on testnet.

## 📖 How It Works

### Dues Collection Flow
1. League admin creates a league with a registration fee (e.g., 50 XLM per team)
2. A Stellar **treasury account** (multi-sig) is generated to hold the prize pool
3. Team captain connects Freighter wallet
4. Captain pays the registration fee in XLM to the treasury account
5. Transaction hash is stored in MongoDB + verified on Stellar Horizon
6. Anyone can view the payment in the public ledger

### Prize Payout Flow
1. League admin declares winning team(s) after tournament
2. System calculates payout (1st: 60%, 2nd: 30%, 3rd: 10%)
3. Backend builds & signs a payout transaction from the multi-sig treasury
4. XLM is sent to the winning team's wallet address
5. Transaction is recorded on the ledger and shown in the dashboard

### Transparency
Every transaction is queryable via:
- In-app public ledger viewer
- Direct Stellar Horizon API
- Stellar Laboratory block explorer

## 🔐 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with 7-day expiration
- Multi-signature treasury (2-of-3 signers) for prize pool
- All transactions on Stellar are signed server-side using env-stored secret keys in dev
- CORS protection on backend
- Input validation with express-validator

> ⚠️ **Production Note**: For production, treasury signing should be split across hardware wallets, not env variables. This MVP uses server-side signing for demo simplicity.

## 📜 License

MIT

## 🤝 Contributing

PRs welcome! This is a StellarX community project.

---

Built with ❤️ for transparent community sports.
