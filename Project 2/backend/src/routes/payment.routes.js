import express from 'express';
import { body, validationResult } from 'express-validator';
import Payment from '../models/Payment.js';
import Team from '../models/Team.js';
import League from '../models/League.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  sendPayment,
  verifyTransaction,
  getXlmBalance,
} from '../services/stellar.service.js';

const router = express.Router();

// GET /api/payments - list payments (admin sees all, others see their own)
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { league, team, status, limit = 50 } = req.query;
    const filter = {};
    if (league) filter.league = league;
    if (team) filter.team = team;
    if (status) filter.status = status;

    // Non-admins can only see their own payments
    if (req.user.role !== 'admin') {
      filter.payer = req.user._id;
    }

    const payments = await Payment.find(filter)
      .populate('league', 'name sport')
      .populate('team', 'name logo')
      .populate('payer', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    res.json({ payments });
  })
);

// GET /api/payments/:id - payment details
router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id)
      .populate('league', 'name sport')
      .populate('team', 'name logo')
      .populate('payer', 'name email');
    if (!payment) return res.status(404).json({ error: 'Not found' });
    res.json({ payment });
  })
);

// POST /api/payments - record a new payment
// The captain/player submits the transaction they already sent on the frontend (or backend signs if secret is available)
router.post(
  '/',
  protect,
  [
    body('league').isMongoId(),
    body('amount').isFloat({ min: 0.0000001 }),
    body('txHash').notEmpty(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { league: leagueId, team: teamId, amount, txHash, memo, note } = req.body;
    const league = await League.findById(leagueId);
    if (!league) return res.status(404).json({ error: 'League not found' });

    // Verify the transaction on Stellar
    const verification = await verifyTransaction(txHash);
    if (!verification.found) {
      return res.status(400).json({ error: 'Transaction not found on Stellar network' });
    }
    if (!verification.successful) {
      return res.status(400).json({ error: 'Transaction was not successful' });
    }

    // Check if the payment is to the league's treasury
    if (verification.sourceAccount === league.treasuryPublicKey) {
      return res.status(400).json({ error: 'Payments to the treasury are not valid dues' });
    }

    // Verify the payment went to the treasury
    // (We allow any payment to the treasury as a valid dues payment)
    const existing = await Payment.findOne({ txHash });
    if (existing) {
      return res.status(409).json({ error: 'Transaction already recorded' });
    }

    const team = teamId ? await Team.findById(teamId) : null;
    if (teamId && !team) return res.status(404).json({ error: 'Team not found' });

    const payment = await Payment.create({
      type: teamId ? 'dues' : 'individual',
      league: leagueId,
      team: teamId,
      payer: req.user._id,
      payerPublicKey: verification.sourceAccount,
      payerName: req.user.name,
      recipientPublicKey: league.treasuryPublicKey,
      amount,
      txHash,
      ledger: verification.ledger,
      memo: memo || verification.memo,
      memoType: 'text',
      blockchainTimestamp: verification.createdAt,
      status: 'confirmed',
      feeCharged: parseFloat(verification.feeXLM),
      note,
    });

    // Update team payment status if applicable
    if (team) {
      team.paymentStatus = 'paid';
      team.paidAmount = amount;
      team.paymentTxHash = txHash;
      team.paidAt = new Date();
      await team.save();
    }

    res.status(201).json({ payment });
  })
);

// POST /api/payments/dues - helper: pay team dues from captain's wallet
// In demo mode, the captain's secret key is stored on the user, so the backend can sign
router.post(
  '/dues',
  protect,
  [
    body('teamId').isMongoId(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const team = await Team.findById(req.body.teamId)
      .select('+walletSecretKey')
      .populate('league');
    if (!team) return res.status(404).json({ error: 'Team not found' });

    if (team.captain.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the captain can pay dues' });
    }

    if (team.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Dues already paid' });
    }

    const user = await User.findById(req.user._id).select('+stellarSecretKey');
    if (!user.stellarSecretKey) {
      return res.status(400).json({ error: 'No wallet secret found. Use Freighter or refresh wallet.' });
    }

    const league = team.league;
    const amount = league.registrationFee.toString();
    const memo = `${league.name.slice(0, 16)}:${team.name.slice(0, 8)}`;

    let result;
    try {
      result = await sendPayment({
        sourceSecret: user.stellarSecretKey,
        destination: league.treasuryPublicKey,
        amount,
        memo,
      });
    } catch (err) {
      console.error('Payment failed:', err);
      return res.status(500).json({
        error: 'Stellar payment failed: ' + (err.response?.data?.extras?.result_codes || err.message),
      });
    }

    const verification = await verifyTransaction(result.hash);

    const payment = await Payment.create({
      type: 'dues',
      league: league._id,
      team: team._id,
      payer: req.user._id,
      payerPublicKey: user.stellarPublicKey,
      payerName: req.user.name,
      recipientPublicKey: league.treasuryPublicKey,
      amount: parseFloat(amount),
      txHash: result.hash,
      ledger: result.ledger,
      memo,
      blockchainTimestamp: verification.createdAt,
      status: 'confirmed',
      feeCharged: parseFloat(verification.feeXLM),
      note: `Team ${team.name} registration in ${league.name}`,
    });

    team.paymentStatus = 'paid';
    team.paidAmount = parseFloat(amount);
    team.paymentTxHash = result.hash;
    team.paidAt = new Date();
    await team.save();

    res.status(201).json({ payment, txHash: result.hash });
  })
);

// GET /api/payments/verify/:hash - verify a transaction on Stellar
router.get(
  '/verify/:hash',
  asyncHandler(async (req, res) => {
    const verification = await verifyTransaction(req.params.hash);
    res.json({ verification });
  })
);

export default router;
