import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import League from '../models/League.js';
import Team from '../models/Team.js';
import Payment from '../models/Payment.js';
import Payout from '../models/Payout.js';

const router = express.Router();

// GET /api/public/overview - public platform stats
router.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const [leaguesCount, teamsCount, paymentsCount, payoutsCount, totals] =
      await Promise.all([
        League.countDocuments({ status: { $ne: 'draft' } }),
        Team.countDocuments(),
        Payment.countDocuments({ status: 'confirmed' }),
        Payout.countDocuments({ status: 'confirmed' }),
        Promise.all([
          Payment.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]),
          Payout.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]),
        ]),
      ]);

    const totalCollected = totals[0][0]?.total || 0;
    const totalPaidOut = totals[1][0]?.total || 0;

    res.json({
      leaguesCount,
      teamsCount,
      paymentsCount,
      payoutsCount,
      totalCollected,
      totalPaidOut,
      netBalance: totalCollected - totalPaidOut,
    });
  })
);

// GET /api/public/recent-transactions - last 20 public transactions
router.get(
  '/recent-transactions',
  asyncHandler(async (req, res) => {
    const [payments, payouts] = await Promise.all([
      Payment.find({ status: 'confirmed' })
        .populate('league', 'name sport')
        .populate('team', 'name')
        .sort({ blockchainTimestamp: -1, createdAt: -1 })
        .limit(20),
      Payout.find({ status: 'confirmed' })
        .populate('league', 'name sport')
        .populate('team', 'name')
        .sort({ blockchainTimestamp: -1, createdAt: -1 })
        .limit(20),
    ]);

    const entries = [
      ...payments.map((p) => ({
        kind: 'dues',
        txHash: p.txHash,
        amount: p.amount,
        league: p.league,
        team: p.team,
        from: p.payerPublicKey,
        fromName: p.payerName,
        timestamp: p.blockchainTimestamp || p.createdAt,
        memo: p.memo,
      })),
      ...payouts.map((p) => ({
        kind: 'payout',
        txHash: p.txHash,
        amount: p.amount,
        league: p.league,
        team: p.team,
        to: p.recipientPublicKey,
        toName: p.recipientName,
        place: p.place,
        timestamp: p.blockchainTimestamp || p.createdAt,
        memo: p.memo,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);

    res.json({ transactions: entries });
  })
);

// GET /api/public/leagues - all public leagues
router.get(
  '/leagues',
  asyncHandler(async (req, res) => {
    const leagues = await League.find({ status: { $in: ['registration_open', 'in_progress', 'completed'] } })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });
    res.json({ leagues });
  })
);

export default router;
