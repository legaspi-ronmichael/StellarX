# 🏀 Stellar League — Community Sports Dues & Payout Ledger

> **Transparent community sports league finances on the Stellar blockchain.**
> Every team registration fee recorded on-chain. Every prize payout automated and auditable.

[![Stellar](https://img.shields.io/badge/Stellar-Testnet-7D00FF?style=flat-square)](https://stellar.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Node](https://img.shields.io/badge/Node-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-In--Memory-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com)

---

## 🎯 The Problem

Local basketball and volleyball leagues collect dues in **cash** and prize pools are **frequently mismanaged**. There's no transparent record of who paid what, no auditable trail of where the money went, and prize distribution is often unfair or delayed.

## 💡 The Solution

Move league finances **on-chain** with Stellar:

- ✅ **Transparent dues collection** — every team registration fee is recorded on the public Stellar ledger
- ✅ **Multi-signature treasury** — 2-of-3 multi-sig account holds the prize pool (no single person can run off with it)
- ✅ **Automated prize payouts** — admin declares winners, system sends payouts via multi-sig transactions
- ✅ **Public audit trail** — anyone can verify transactions on https://stellar.expert
- ✅ **Beautiful UI** — modern React app with live transaction feeds

## 🌟 Why Stellar?

- ⚡ **3-5 second finality** — fast payouts
- 💸 **Fractions of a cent fees** — economical for small transactions
- 🔐 **Native multi-sig** — built-in 2-of-3 treasury support
- 🌍 **Public ledger** — verifiable transparency by design

---

## 📸 Features

### 👑 League Admins
- Create leagues (basketball / volleyball)
- Set registration fees and prize distribution
- Deploy **multi-sig treasury** automatically
- View complete payment and payout history
- Declare winners → trigger **automated prize payouts**
- Public transparency dashboard

### 👕 Team Captains
- Register teams in active leagues
- Pay team registration fees via Stellar
- Share invite codes with players
- Receive automated prize payouts on victory
- Track team payment status

### 🏃 Players
- Join teams via invite codes
- View league standings and brackets
- View complete on-chain transaction history
- See prize pool and distribution

### 🌐 Public (No Login)
- Browse active leagues
- View transparent ledger of all dues and payouts
- See league statistics and analytics
- Verify transactions on Stellar Expert

---

## 🏗️ Architecture

```
┌─────────────────────┐         ┌─────────────────────┐         ┌─────────────────────┐
│  React Frontend     │ ◄─────► │  Express API        │ ◄─────► │  Stellar SDK        │
│  (Vite + Tailwind)  │   HTTP  │  (Node.js)          │  TXNS   │  (Testnet)          │
│  Port: 5173         │         │  Port: 5000         │         │                     │
└─────────────────────┘         └─────────────────────┘         └─────────────────────┘
                                          │
                                          ▼
                                 ┌─────────────────────┐
                                 │  MongoDB            │
                                 │  (or in-memory)     │
                                 │  - Users            │
                                 │  - Leagues          │
                                 │  - Teams            │
                                 │  - Payments         │
                                 │  - Payouts          │
                                 └─────────────────────┘
```

---

## 🚀 Tech Stack

**Frontend**
- React 18 + Vite
- TailwindCSS
- React Router v6
- Axios
- Lucide React (icons)
- React Hot Toast

**Backend**
- Node.js 18+ + Express
- MongoDB + Mongoose (or in-memory for dev)
- Stellar SDK (`@stellar/stellar-sdk`)
- JWT authentication
- Bcrypt password hashing
- Express Validator

**Blockchain**
- Stellar Testnet
- Native XLM asset
- 2-of-3 multi-signature treasuries
- Horizon API for transaction verification

---

## ⚡ Quick Start

### Prerequisites
- **Node.js 18+** — [download](https://nodejs.org)
- That's it! (MongoDB optional — we have in-memory mode)

### 🚀 Run in 4 commands

Open two terminals.

**Terminal 1 — Backend:**
```bash
cd backend
copy .env.example .env
npm install
npm run seed
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Open **http://localhost:5173** 🎉

> ⏱️ The first `npm run seed` takes 1-3 minutes as `mongodb-memory-server` downloads a MongoDB binary. Subsequent runs are fast.

### 🔑 Demo Accounts (all password: `demo1234`)

| Role | Email | What You Can Do |
|------|-------|-----------------|
| 👑 Admin | `admin@league.test` | Manage leagues, declare winners, trigger payouts |
| 🏀 Captain 1 | `captain1@league.test` | Team captain (Eagles - basketball) |
| 🏀 Captain 2 | `captain2@league.test` | Team captain (Bulldogs + Spikers) |
| 🏀 Captain 3 | `captain3@league.test` | Team captain (Tigers + Aces) |
| 🏃 Player | `player1@league.test` | View teams & ledger |

Click any demo button on the login page to autofill.

---

## 🎬 Try This Demo Flow

1. **Browse as a guest** — open http://localhost:5173 in an incognito window. See live on-chain stats and recent transactions.

2. **Login as admin** (`admin@league.test`) — view the two seeded leagues (Basketball & Volleyball), see the multi-sig treasury, check team payment status.

3. **Login as a captain** (`captain1@league.test`) — go to your team, pay registration dues (fires a **real Stellar testnet transaction**).

4. **Verify on Stellar** — click any "View on Explorer" link → see your transaction on https://stellar.expert.

5. **Trigger a payout** — log back in as admin, go to a league with 3+ paid teams, declare winners, click "Execute" on each pending payout. The treasury sends XLM to the winning team's wallet.

6. **Public Explorer** — go to http://localhost:5173/explorer — see all on-chain activity in real-time.

---

## 🔍 How It Works

### 1. League Creation (Admin)
1. Admin creates a league with name, sport, fee, prize distribution
2. System generates **3 random keypairs** (treasury signers)
3. System creates a new Stellar account and **funds it via Friendbot**
4. System configures the account as **2-of-3 multi-sig** (requires 2 of 3 signers to send funds)
5. League is live, teams can register

### 2. Team Dues Payment (Captain)
1. Captain registers a team → team gets its own Stellar wallet
2. Captain pays registration fee from their wallet to the league's treasury
3. Transaction is **submitted to Stellar** and confirmed in 3-5 seconds
4. Backend verifies the transaction on Horizon
5. Payment is recorded in MongoDB with on-chain details (hash, ledger, timestamp)

### 3. Prize Payout (Admin)
1. Tournament ends → admin logs in
2. Admin selects 1st, 2nd, 3rd place teams
3. System creates **Payout records** (status: pending)
4. Admin clicks "Execute" → system builds a payment transaction from the **multi-sig treasury** to the winning team's wallet
5. Two of the three signers co-sign the transaction
6. Transaction is submitted → **automatic prize distribution**
7. On-chain record is created, prize pool is reduced

### 4. Transparency
- Every transaction is queryable on https://stellar.expert
- The `/explorer` page shows all platform activity
- Each transaction has a "View on Explorer" link

---

## 🗂️ Project Structure

```
Project 2/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js             # MongoDB connection (real or in-memory)
│   │   │   └── stellar.js        # Stellar SDK + Horizon setup
│   │   ├── models/               # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── League.js
│   │   │   ├── Team.js
│   │   │   ├── Payment.js
│   │   │   ├── Payout.js
│   │   │   └── Match.js
│   │   ├── routes/               # Express API endpoints
│   │   │   ├── auth.routes.js    # /api/auth
│   │   │   ├── league.routes.js  # /api/leagues
│   │   │   ├── team.routes.js    # /api/teams
│   │   │   ├── payment.routes.js # /api/payments
│   │   │   ├── payout.routes.js  # /api/payouts
│   │   │   ├── ledger.routes.js  # /api/ledger
│   │   │   └── public.routes.js  # /api/public
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT + role checks
│   │   ├── services/
│   │   │   └── stellar.service.js # Multi-sig, payments, verification
│   │   └── utils/
│   │       └── asyncHandler.js
│   ├── seed.js                   # Demo data seeder
│   ├── server.js                 # Express entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── TransactionRow.jsx
│   │   │   └── Loading.jsx
│   │   ├── pages/                # Route pages
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Leagues.jsx
│   │   │   ├── LeagueDetail.jsx
│   │   │   ├── LeagueCreate.jsx
│   │   │   ├── Teams.jsx
│   │   │   ├── TeamDetail.jsx
│   │   │   ├── Ledger.jsx
│   │   │   ├── PublicExplorer.jsx
│   │   │   └── Profile.jsx
│   │   ├── contexts/             # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   └── WalletContext.jsx # Freighter integration
│   │   ├── services/
│   │   │   └── api.js            # Axios client
│   │   ├── utils/
│   │   │   └── format.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── README.md                     # This file
└── QUICKSTART.md                  # 1-page quick reference
```

---

## 🔌 API Reference

All endpoints are prefixed with `/api`.

### Public (no auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/public/overview` | Platform stats |
| `GET` | `/public/recent-transactions` | Last 20 txs |
| `GET` | `/public/leagues` | All active leagues |
| `GET` | `/leagues` | List leagues (filterable) |
| `GET` | `/leagues/:id` | League details + teams + payments |
| `POST` | `/auth/register` | Create account |
| `POST` | `/auth/login` | Login |
| `GET` | `/payments/verify/:hash` | Verify tx on Stellar |

### Authenticated
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/auth/me` | any | Current user |
| `POST` | `/leagues` | admin | Create league |
| `PATCH` | `/leagues/:id` | admin | Update league |
| `POST` | `/leagues/:id/declare-winners` | admin | Declare winners + queue payouts |
| `POST` | `/teams` | any | Register a team |
| `POST` | `/teams/join` | any | Join via invite code |
| `POST` | `/payments` | any | Record a payment |
| `POST` | `/payments/dues` | captain | Pay team dues (signed by backend in demo) |
| `GET` | `/payments` | any | List payments |
| `GET` | `/payouts` | any | List payouts |
| `POST` | `/payouts/:id/execute` | admin | Execute a multi-sig payout |
| `GET` | `/ledger` | any | Combined ledger |
| `GET` | `/ledger/summary` | any | Aggregate stats |

---

## 🔐 Security

### Current (Demo)
- Passwords hashed with **bcrypt** (12 rounds)
- **JWT** tokens (7-day expiration)
- Multi-sig treasury (2-of-3) for prize pool
- Server-side signing in demo for simplicity

### Production Recommendations
- ⚠️ **Never store user secret keys** — use Freighter wallet for user signing
- ⚠️ **Use hardware wallets** (Ledger, Trezor) for the 3 treasury signers
- ⚠️ **Move signing off-server** — co-sign transactions client-side or via HSMs
- ⚠️ **Use HTTPS** everywhere
- ⚠️ **Rate-limit API endpoints** (already done with express-rate-limit)
- ⚠️ **Add 2FA** for admin actions
- ⚠️ **Audit smart contract logic** before mainnet

---

## 🧪 Testing on Testnet

The system uses **Stellar Testnet** by default. Every transaction is real but uses worthless testnet XLM (funded by [Friendbot](https://friendbot.stellar.org)).

### Useful links
- **Stellar Expert (Testnet):** https://stellar.expert/explorer/testnet
- **Stellar Laboratory:** https://laboratory.stellar.org/#?network=testnet
- **Friendbot (fund a testnet account):** https://friendbot.stellar.org

### Get testnet XLM for any account
```bash
curl "https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY"
```

---

## 🐛 Troubleshooting

### "MongoServerSelectionError"
- **First run:** in-memory mode downloads a MongoDB binary (~50MB). Wait 1-3 minutes.
- **No internet:** check your connection (binary download needs it)
- **Want real MongoDB:** set `MONGODB_URI=mongodb://localhost:27017/stellar-league` and run `mongod`

### "Friendbot failed"
- Friendbot can be slow. The seed will continue but the wallet won't be funded.
- The user can manually fund via `https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY`
- Or re-run `npm run seed` after a few minutes.

### "Treasury signers not configured"
- Run `npm run seed` first to generate the 3 signer keys
- The seed automatically adds them to `backend/.env`

### "Port 5000 already in use"
- Edit `PORT=5000` in `backend/.env` to another port
- Update `VITE_API_URL` in `frontend/.env` to match

### "CORS error" in browser
- Make sure `CORS_ORIGIN` in `backend/.env` matches the frontend URL
- Default: `http://localhost:5173`

### Frontend shows "Network Error"
- Make sure the backend is running on port 5000
- Check `VITE_API_URL` in `frontend/.env`

---

## 🛣️ Roadmap

- [ ] **Freighter wallet integration** — user signs with own wallet (no secret stored)
- [ ] **Tournament brackets** — single-elimination match generation
- [ ] **Match score tracking** — declare winners via match results
- [ ] **Email notifications** — payment receipts, payout confirmations
- [ ] **Mobile-responsive improvements**
- [ ] **Recurring leagues** — weekly/monthly dues
- [ ] **Multi-asset support** — accept USDC, custom tokens
- [ ] **Mainnet deployment guide**

---

## 🤝 Contributing

PRs welcome! This is a StellarX community project. To contribute:

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Clone the repository
```bash
git clone https://github.com/legaspi-ronmichael/StellarX
```

---

## 👥 Team

| Name | Role | GitHub |
|------|------|--------|
| **Ron Michael C. Legaspi** | Project Lead / Backend & Stellar Integration | [@legaspi-ronmichael](https://github.com/legaspi-ronmichael) |
| **Gabriel Balang** | Frontend / UI/UX | [@lionyde](https://github.com/lionyde) |
| **Avril Lavigne Pascua** | Frontend / UI/UX | [@sunnymingming](https://github.com/sunnymingming) |