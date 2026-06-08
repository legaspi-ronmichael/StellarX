import express from 'express';
import { body, validationResult } from 'express-validator';
import Team from '../models/Team.js';
import League from '../models/League.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateKeypair, fundTestnetAccount } from '../services/stellar.service.js';

const router = express.Router();

// GET /api/teams?league=:id - list teams (filterable)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { league, captain, paid } = req.query;
    const filter = {};
    if (league) filter.league = league;
    if (captain) filter.captain = captain;
    if (paid === 'true') filter.paymentStatus = 'paid';
    if (paid === 'false') filter.paymentStatus = { $ne: 'paid' };

    const teams = await Team.find(filter)
      .populate('captain', 'name email stellarPublicKey')
      .populate('league', 'name sport registrationFee status')
      .sort({ createdAt: 1 });
    res.json({ teams });
  })
);

// GET /api/teams/:id - team details
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const team = await Team.findById(req.params.id)
      .populate('captain', 'name email stellarPublicKey')
      .populate('players.user', 'name email')
      .populate('league', 'name sport registrationFee status');
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json({ team });
  })
);

// POST /api/teams - register a new team
router.post(
  '/',
  protect,
  [
    body('name').trim().notEmpty(),
    body('league').isMongoId(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, league: leagueId, logo } = req.body;
    const league = await League.findById(leagueId);
    if (!league) return res.status(404).json({ error: 'League not found' });

    if (league.status !== 'registration_open') {
      return res.status(400).json({ error: 'Registration is not open' });
    }

    const teamsCount = await Team.countDocuments({ league: leagueId });
    if (teamsCount >= league.maxTeams) {
      return res.status(400).json({ error: 'League is full' });
    }

    // Generate wallet for the team
    const teamKeypair = generateKeypair();
    let funded = false;
    try {
      await fundTestnetAccount(teamKeypair.publicKey());
      funded = true;
    } catch (err) {
      console.warn('Team wallet funding failed:', err.message);
    }

    const team = await Team.create({
      name,
      league: leagueId,
      captain: req.user._id,
      walletPublicKey: teamKeypair.publicKey(),
      walletSecretKey: teamKeypair.secret(),
      logo,
      players: [
        {
          user: req.user._id,
          name: req.user.name,
          joinedAt: new Date(),
        },
      ],
    });

    res.status(201).json({
      team,
      teamSecretKey: teamKeypair.secret(), // demo only
      funded,
    });
  })
);

// POST /api/teams/join - join a team via invite code
router.post(
  '/join',
  protect,
  [body('inviteCode').trim().notEmpty()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const team = await Team.findOne({ inviteCode: req.body.inviteCode });
    if (!team) return res.status(404).json({ error: 'Invalid invite code' });

    const alreadyOnTeam = team.players.some(
      (p) => p.user && p.user.toString() === req.user._id.toString()
    );
    if (alreadyOnTeam) {
      return res.status(409).json({ error: 'Already on this team' });
    }

    team.players.push({
      user: req.user._id,
      name: req.user.name,
      joinedAt: new Date(),
    });
    await team.save();
    res.json({ team });
  })
);

// DELETE /api/teams/:id - delete a team
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Not found' });
    if (team.captain.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await team.deleteOne();
    res.json({ ok: true });
  })
);

export default router;
