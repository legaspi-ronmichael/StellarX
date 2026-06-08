import express from 'express';
import { body, validationResult } from 'express-validator';
import Payment from '../models/Payment.js';
import Payout from '../models/Payout.js';
import League from '../models/League.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// GET /api/ledger - combined ledger (admin sees all)
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { league, type, limit = 100 } = req.query;
    const filter = {};
    if (league) filter.league = league;

    if (req.user.role !== 'admin') {
      filter.payer = req.user._id;
    }

    const [payments, payouts] = await Promise.all([
      Payment.find(filter)
        .populate('league', 'name sport')
        .populate('team', 'name')
        .populate('payer', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit)),
      Payout.find(league ? { league } : {})
        .populate('league', 'name sport')
        .populate('team', 'name')
        .populate('initiatedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit)),
    ]);

    // Combine into unified ledger entries
    const entries = [
      ...payments.map((p) => ({
        kind: 'dues',
        id: p._id,
        txHash: p.txHash,
        ledger: p.ledger,
        amount: p.amount,
        feeCharged: p.feeCharged,
        from: p.payerPublicKey,
        fromName: p.payerName,
        to: p.recipientPublicKey,
        memo: p.memo,
        status: p.status,
        timestamp: p.blockchainTimestamp || p.createdAt,
        league: p.league,
        team: p.team,
        type: p.type,
      })),
      ...payouts
        .filter((p) => p.status === 'confirmed')
        .map((p) => ({
          kind: 'payout',
          id: p._id,
          txHash: p.txHash,
          ledger: p.ledger,
          amount: p.amount,
          from: p.sourcePublicKey,
          to: p.recipientPublicKey,
          toName: p.recipientName,
          memo: p.memo,
          status: p.status,
          place: p.place,
          percentage: p.percentage,
          timestamp: p.blockchainTimestamp || p.createdAt,
          league: p.league,
          team: p.team,
        })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    let result = entries;
    if (type === 'dues') result = entries.filter((e) => e.kind === 'dues');
    if (type === 'payouts') result = entries.filter((e) => e.kind === 'payout');

    res.json({ entries: result.slice(0, parseInt(limit)), total: entries.length });
  })
);

// GET /api/ledger/summary - aggregate stats
router.get(
  '/summary',
  protect,
  asyncHandler(async (req, res) => {
    const { league } = req.query;
    const leagueFilter = league ? { league } : {};
    const userFilter =
      req.user.role !== 'admin' ? { ...leagueFilter, payer: req.user._id } : leagueFilter;

    const [collected, payoutAgg, paymentCount, payoutCount] = await Promise.all([
      Payment.aggregate([
        { $match: { ...userFilter, status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payout.aggregate([
        { $match: { ...leagueFilter, status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.countDocuments({ ...userFilter, status: 'confirmed' }),
      Payout.countDocuments({ ...leagueFilter, status: 'confirmed' }),
    ]);

    res.json({
      totalCollected: collected[0]?.total || 0,
      totalPaidOut: payoutAgg[0]?.total || 0,
      netBalance: (collected[0]?.total || 0) - (payoutAgg[0]?.total || 0),
      paymentCount,
      payoutCount,
    });
  })
);

export default router;
