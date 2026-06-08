import express from 'express';
import { body, validationResult } from 'express-validator';
import League from '../models/League.js';
import Team from '../models/Team.js';
import Payment from '../models/Payment.js';
import Payout from '../models/Payout.js';
import { protect, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createMultiSigTreasury, getXlmBalance, generateKeypair } from '../services/stellar.service.js';

const router = express.Router();

// GET /api/leagues - list all leagues
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status, sport } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (sport) filter.sport = sport;

    const leagues = await League.find(filter)
      .populate('createdBy', 'name email')
      .populate('winners.first winners.second winners.third', 'name logo')
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });

    const leagueIds = leagues.map((l) => l._id);
    const counts = await Team.aggregate([
      { $match: { league: { $in: leagueIds } } },
      { $group: { _id: '$league', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
    leagues.forEach((l) => (l.teamsCount = countMap[l._id.toString()] || 0));

    res.json({ leagues });
  })
);

// GET /api/leagues/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const league = await League.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('winners.first winners.second winners.third', 'name logo');
    if (!league) return res.status(404).json({ error: 'League not found' });

    const teams = await Team.find({ league: league._id })
      .populate('captain', 'name email stellarPublicKey')
      .sort({ createdAt: 1 });

    const payments = await Payment.find({ league: league._id, status: 'confirmed' })
      .sort({ createdAt: -1 })
      .limit(20);

    const totalCollected = payments.reduce((s, p) => s + p.amount, 0);

    res.json({
      league: league.toObject(),
      teams,
      payments,
      stats: {
        teamsRegistered: teams.length,
        teamsPaid: teams.filter((t) => t.paymentStatus === 'paid').length,
        totalCollected,
        prizePool: totalCollected,
        treasuryBalance: await getXlmBalance(league.treasuryPublicKey).catch(() => '0'),
      },
    });
  })
);

// POST /api/leagues - create
router.post(
  '/',
  protect,
  requireRole('admin'),
  [
    body('name').trim().notEmpty(),
    body('sport').isIn(['basketball', 'volleyball']),
    body('registrationFee').isFloat({ min: 0 }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let signer1 = process.env.TREASURY_SIGNER_1_SECRET;
    let signer2 = process.env.TREASURY_SIGNER_2_SECRET;
    let signer3 = process.env.TREASURY_SIGNER_3_SECRET;

    if (!signer1 || !signer2 || !signer3) {
      const k1 = generateKeypair();
      const k2 = generateKeypair();
      const k3 = generateKeypair();
      signer1 = k1.secret();
      signer2 = k2.secret();
      signer3 = k3.secret();
      console.warn('⚠️  TREASURY_SIGNER_*_SECRET not set. Using ephemeral signers.');
    }

    let treasury;
    try {
      treasury = await createMultiSigTreasury([signer1, signer2, signer3]);
    } catch (err) {
      console.error('Treasury creation failed:', err);
      return res.status(500).json({ error: 'Failed to create treasury: ' + err.message });
    }

    const league = await League.create({
      ...req.body,
      treasuryPublicKey: treasury.publicKey,
      treasurySecretKey: treasury.secretKey,
      treasurySigners: treasury.signers,
      createdBy: req.user._id,
      status: req.body.status || 'registration_open',
    });

    res.status(201).json({ league });
  })
);

// PATCH /api/leagues/:id
router.patch(
  '/:id',
  protect,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const league = await League.findById(req.params.id);
    if (!league) return res.status(404).json({ error: 'Not found' });
    if (league.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not your league' });
    }
    Object.assign(league, req.body);
    await league.save();
    res.json({ league });
  })
);

// POST /api/leagues/:id/declare-winners
router.post(
  '/:id/declare-winners',
  protect,
  requireRole('admin'),
  [
    body('first').isString(),
    body('second').optional().isString(),
    body('third').optional().isString(),
  ],
  asyncHandler(async (req, res) => {
    const league = await League.findById(req.params.id);
    if (!league) return res.status(404).json({ error: 'Not found' });

    const payments = await Payment.find({ league: league._id, status: 'confirmed' });
    const totalPool = payments.reduce((s, p) => s + p.amount, 0);

    if (totalPool <= 0) {
      return res.status(400).json({ error: 'No funds in prize pool' });
    }

    league.winners = {
      first: req.body.first,
      second: req.body.second,
      third: req.body.third,
    };
    league.payoutsCompleted = false;
    await league.save();

    const payouts = [];
    const places = [
      { key: 'first', teamId: req.body.first, pct: league.prizeDistribution.first },
      { key: 'second', teamId: req.body.second, pct: league.prizeDistribution.second },
      { key: 'third', teamId: req.body.third, pct: league.prizeDistribution.third },
    ];

    for (const p of places) {
      if (!p.teamId) continue;
      const team = await Team.findById(p.teamId);
      if (!team) continue;
      const amount = ((totalPool * p.pct) / 100).toFixed(7);
      const payout = await Payout.create({
        league: league._id,
        team: team._id,
        place: p.key,
        recipientPublicKey: team.walletPublicKey,
        recipientName: team.name,
        sourcePublicKey: league.treasuryPublicKey,
        amount: parseFloat(amount),
        percentage: p.pct,
        initiatedBy: req.user._id,
        status: 'pending',
        memo: `${league.name} - ${p.key} place prize`,
      });
      payouts.push(payout);
    }

    league.status = 'completed';
    await league.save();

    res.json({ league, payouts, prizePool: totalPool });
  })
);

// DELETE /api/leagues/:id
router.delete(
  '/:id',
  protect,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const league = await League.findById(req.params.id);
    if (!league) return res.status(404).json({ error: 'Not found' });
    if (league.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not your league' });
    }
    await league.deleteOne();
    res.json({ ok: true });
  })
);

export default router;
