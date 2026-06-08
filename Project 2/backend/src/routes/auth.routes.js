import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateKeypair, fundTestnetAccount, StellarSdk } from '../services/stellar.service.js';

const router = express.Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    body('role').optional().isIn(['admin', 'captain', 'player']),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role = 'player' } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // Generate a new Stellar keypair for the user
    const keypair = generateKeypair();
    const stellarPublicKey = keypair.publicKey();
    const stellarSecretKey = keypair.secret();

    // Fund via Friendbot (testnet only)
    try {
      await fundTestnetAccount(stellarPublicKey);
    } catch (err) {
      console.warn('Friendbot funding failed (continuing):', err.message);
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      stellarPublicKey,
      stellarSecretKey,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    // Return the user with their secret key ONCE for demo purposes
    res.status(201).json({
      token,
      user: {
        ...user.toSafeJSON(),
        stellarSecretKey, // shown once so the user can import into Freighter
      },
    });
  })
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').notEmpty(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +stellarSecretKey');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.json({
      token,
      user: {
        ...user.toSafeJSON(),
        stellarSecretKey: user.stellarSecretKey, // demo only
      },
    });
  })
);

// GET /api/auth/me - current user
router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user.toSafeJSON() });
  })
);

// POST /api/auth/refresh-wallet - generate a new testnet keypair
router.post(
  '/refresh-wallet',
  protect,
  asyncHandler(async (req, res) => {
    const kp = generateKeypair();
    try {
      await fundTestnetAccount(kp.publicKey());
    } catch (err) {
      console.warn('Friendbot funding failed:', err.message);
    }
    req.user.stellarPublicKey = kp.publicKey();
    req.user.stellarSecretKey = kp.secret();
    await req.user.save();
    res.json({
      stellarPublicKey: kp.publicKey(),
      stellarSecretKey: kp.secret(),
    });
  })
);

export default router;
