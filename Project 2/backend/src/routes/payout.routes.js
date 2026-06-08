import express from 'express';
import Payout from '../models/Payout.js';
import League from '../models/League.js';
import Team from '../models/Team.js';
import dotenv from 'dotenv';
dotenv.config();
import { protect, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  buildMultiSigPayment,
  verifyTransaction,
  StellarSdk,
} from '../services/stellar.service.js';

const router = express.Router();

// GET /api/payouts - list payouts
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { league, team, status } = req.query;
    const filter = {};
    if (league) filter.league = league;
    if (team) filter.team = team;
    if (status) filter.status = status;

    const payouts = await Payout.find(filter)
      .populate('league', 'name sport')
      .populate('team', 'name logo')
      .populate('initiatedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ payouts });
  })
);

// GET /api/payouts/:id
router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const payout = await Payout.findById(req.params.id)
      .populate('league', 'name sport')
      .populate('team', 'name logo')
      .populate('initiatedBy', 'name email');
    if (!payout) return res.status(404).json({ error: 'Not found' });
    res.json({ payout });
  })
);

// POST /api/payouts/:id/execute - execute a pending payout (admin only)
router.post(
  '/:id/execute',
  protect,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const payout = await Payout.findById(req.params.id)
      .populate('league');
    if (!payout) return res.status(404).json({ error: 'Not found' });
    if (payout.status === 'confirmed') {
      return res.status(400).json({ error: 'Already paid' });
    }
    if (payout.status === 'processing') {
      return res.status(400).json({ error: 'Payout is being processed' });
    }

    const league = payout.league;
    if (league.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not your league' });
    }

    // Get 2 treasury signers
    const s1 = process.env.TREASURY_SIGNER_1_SECRET;
    const s2 = process.env.TREASURY_SIGNER_2_SECRET;
    if (!s1 || !s2) {
      return res.status(500).json({
        error: 'Treasury signers not configured. Set TREASURY_SIGNER_1_SECRET and TREASURY_SIGNER_2_SECRET in .env',
      });
    }

    payout.status = 'processing';
    await payout.save();

    try {
      const signedTx = await buildMultiSigPayment({
        sourcePublicKey: league.treasuryPublicKey,
        destination: payout.recipientPublicKey,
        amount: payout.amount.toString(),
        memo: payout.memo,
        signerSecrets: [s1, s2],
      });

      const server = new StellarSdk.Horizon.Server(process.env.STELLAR_HORIZON_URL);
      const result = await server.submitTransaction(signedTx);

      const verification = await verifyTransaction(result.hash);

      payout.txHash = result.hash;
      payout.ledger = result.ledger;
      payout.blockchainTimestamp = verification.createdAt;
      payout.status = 'confirmed';
      payout.signaturesCollected = [
        { signerPublicKey: StellarSdk.Keypair.fromSecret(s1).publicKey(), signedAt: new Date() },
        { signerPublicKey: StellarSdk.Keypair.fromSecret(s2).publicKey(), signedAt: new Date() },
      ];
      await payout.save();

      res.json({ payout, txHash: result.hash });
    } catch (err) {
      payout.status = 'failed';
      payout.failureReason =
        err.response?.data?.extras?.result_codes?.toString?.() || err.message;
      await payout.save();
      console.error('Payout failed:', err);
      res.status(500).json({
        error: 'Payout transaction failed: ' + payout.failureReason,
      });
    }
  })
);

// POST /api/payouts/:id/refresh - re-verify on-chain status
router.post(
  '/:id/refresh',
  protect,
  asyncHandler(async (req, res) => {
    const payout = await Payout.findById(req.params.id);
    if (!payout) return res.status(404).json({ error: 'Not found' });
    if (!payout.txHash) return res.json({ payout });

    const v = await verifyTransaction(payout.txHash);
    if (v.found && v.successful) {
      payout.status = 'confirmed';
      payout.ledger = v.ledger;
      payout.blockchainTimestamp = v.createdAt;
      await payout.save();
    }
    res.json({ payout });
  })
);

export default router;
