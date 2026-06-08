# 🚀 Quick Start Guide

## Prerequisites
- **Node.js 18+** ([download](https://nodejs.org))
- **MongoDB** running locally OR a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free account
- **Freighter Wallet** browser extension ([get it](https://www.freighter.app/)) — optional for testnet testing

---

## Step 1: Install MongoDB (if you don't have it)

**Option A — Local install:**
- Download: https://www.mongodb.com/try/download/community
- Run `mongod` to start

**Option B — Use MongoDB Atlas (cloud, free):**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get your connection string (looks like `mongodb+srv://user:pass@cluster.mongodb.net/stellar-league`)

---

## Step 2: Configure Environment

### Backend
```bash
cd backend
copy .env.example .env
```

Edit `backend/.env`:
- `MONGODB_URI` — your MongoDB connection string
- `JWT_SECRET` — change to a random 32+ char string
- Other Stellar settings can stay as defaults (Testnet)

### Frontend
```bash
cd ..\frontend
copy .env.example .env
```

(No changes needed for default setup.)

---

## Step 3: Install Dependencies

Open two terminals.

**Terminal 1 — Backend:**
```bash
cd backend
npm install
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
```

---

## Step 4: Seed Demo Data

This creates users, teams, leagues, and **real Stellar testnet transactions** (uses Friendbot to fund wallets — no real money).

```bash
cd backend
npm run seed
```

You'll see output like:
```
🌱 Starting seed...
✅ DB connected
✅ Stellar initialized
👥 Creating demo users...
  ✓ Admin Santos (admin)
  ✓ Captain Reyes (captain)
  ...
🏀 Creating basketball league...
💸 Sending real testnet payments to treasury...
  ✓ Manila Eagles paid 50 XLM (tx: abc123...)
  ...
🎉 SEED COMPLETE!
```

The script will **automatically save 3 treasury signer keys to `backend/.env`**. These are needed for prize payouts.

---

## Step 5: Start the Servers

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```
You should see:
```
✅ MongoDB connected
✅ Stellar service initialized
🚀 Server running on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
You should see:
```
Local:   http://localhost:5173/
```

---

## Step 6: Open the App

Go to **http://localhost:5173** in your browser.

### 🔑 Demo Accounts (all password: `demo1234`)

| Role          | Email                    |
|---------------|--------------------------|
| 👑 Admin      | admin@league.test        |
| 🏀 Captain 1  | captain1@league.test     |
| 🏀 Captain 2  | captain2@league.test     |
| 🏀 Captain 3  | captain3@league.test     |
| 🏃 Player     | player1@league.test      |

Click the demo account buttons on the login page to autofill.

---

## 🎯 Try This Demo Flow

1. **Public view** — Open http://localhost:5173 in incognito, see the landing page with live transaction stats
2. **Login as admin** (`admin@league.test`) — View all leagues, see the multi-sig treasury, declare winners
3. **Login as captain** (`captain1@league.test`) — View your team, pay dues (real testnet transaction)
4. **Public Explorer** — Go to http://localhost:5173/explorer — see all transactions on-chain
5. **Verify on Stellar** — Click any "View on Explorer" link to see the transaction on https://stellar.expert

---

## 🔧 Troubleshooting

### "MongoDB connection error"
- Make sure MongoDB is running (`mongod` in a terminal)
- Or use MongoDB Atlas — paste your SRV string into `MONGODB_URI`

### "Friendbot failed"
- Check your internet connection
- Friendbot can be slow — wait a few minutes and retry
- The seed will still create the data, but wallets won't be funded

### "Port 5000 in use"
- Change `PORT=5000` in `backend/.env` to another port
- Update `VITE_API_URL` in `frontend/.env` to match

### "Port 5173 in use"
- Vite will automatically use the next available port

### Payments not working
- Make sure the seed completed and the captain's wallet was Friendbot-funded
- If a captain's wallet has no XLM, run `npm run seed` again to create a new wallet

### Payouts failing
- Make sure `backend/.env` has all 3 `TREASURY_SIGNER_*_SECRET` values
- The seed script auto-adds them on first run — re-run the seed if they're missing

---

## 📂 What to Look At

- **Public landing** — http://localhost:5173/ — no login required
- **Health check** — http://localhost:5000/health
- **Public API** — http://localhost:5000/api/public/overview
- **Stellar Expert (testnet)** — https://stellar.expert/explorer/testnet

---

## 🎉 What's Next?

After the demo:
- Swap Freighter wallet integration on (the code is there, just install the extension)
- Set up real hardware wallets for treasury signers
- Deploy to