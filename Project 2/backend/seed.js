// Seed script for demo data
// Run: npm run seed

import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import {
  initStellar,
  fundTestnetAccount,
  generateKeypair,
  createMultiSigTreasury,
  sendPayment,
  verifyTransaction,
} from './src/services/stellar.service.js';
import User from './src/models/User.js';
import League from './src/models/League.js';
import Team from './src/models/Team.js';
import Payment from './src/models/Payment.js';
import Payout from './src/models/Payout.js';
import Match from './src/models/Match.js';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log('🌱 Starting seed...');

  await connectDB();
  console.log('✅ DB connected');

  await initStellar();
  console.log('✅ Stellar initialized');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    League.deleteMany({}),
    Team.deleteMany({}),
    Payment.deleteMany({}),
    Payout.deleteMany({}),
    Match.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // 1. Create demo users
  console.log('\n👥 Creating demo users...');

  const userSpecs = [
    { name: 'Admin Santos', email: 'admin@league.test', password: 'demo1234', role: 'admin' },
    { name: 'Captain Reyes', email: 'captain1@league.test', password: 'demo1234', role: 'captain' },
    { name: 'Captain Cruz', email: 'captain2@league.test', password: 'demo1234', role: 'captain' },
    { name: 'Captain Garcia', email: 'captain3@league.test', password: 'demo1234', role: 'captain' },
    { name: 'Player Mendoza', email: 'player1@league.test', password: 'demo1234', role: 'player' },
    { name: 'Player Aquino', email: 'player2@league.test', password: 'demo1234', role: 'player' },
    { name: 'Player Bautista', email: 'player3@league.test', password: 'demo1234', role: 'player' },
    { name: 'Player Dela Cruz', email: 'player4@league.test', password: 'demo1234', role: 'player' },
  ];

  const users = [];
  for (const spec of userSpecs) {
    const kp = generateKeypair();
    try {
      await fundTestnetAccount(kp.publicKey());
    } catch (err) {
      console.warn(`  ⚠️  Friendbot failed for ${spec.email}`);
    }
    await sleep(300);
    const user = await User.create({
      ...spec,
      stellarPublicKey: kp.publicKey(),
      stellarSecretKey: kp.secret(),
    });
    users.push(user);
    console.log(`  ✓ ${spec.name} (${spec.role}) → ${kp.publicKey().slice(0, 8)}...`);
  }

  // 2. Create treasury signers
  console.log('\n🔐 Creating treasury signers...');
  const signer1 = generateKeypair();
  const signer2 = generateKeypair();
  const signer3 = generateKeypair();

  for (const s of [signer1, signer2, signer3]) {
    try {
      await fundTestnetAccount(s.publicKey());
    } catch {}
    await sleep(300);
  }

  console.log('  Signer 1:', signer1.publicKey());
  console.log('  Signer 2:', signer2.publicKey());
  console.log('  Signer 3:', signer3.publicKey());

  // Save signer secrets to .env
  const fs = await import('fs');
  const envPath = './.env';
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf-8');
    if (!envContent.includes('TREASURY_SIGNER_1_SECRET')) {
      envContent += `\nTREASURY_SIGNER_1_SECRET=${signer1.secret()}\n`;
      envContent += `TREASURY_SIGNER_2_SECRET=${signer2.secret()}\n`;
      envContent += `TREASURY_SIGNER_3_SECRET=${signer3.secret()}\n`;
      fs.writeFileSync(envPath, envContent);
      console.log('  ✅ Saved signer secrets to .env');
    } else {
      console.log('  ℹ️  .env already has treasury signer secrets');
    }
  }

  // 3. Create the multi-sig treasury
  console.log('\n🏛️  Creating multi-sig treasury...');
  const treasury = await createMultiSigTreasury([
    signer1.secret(),
    signer2.secret(),
    signer3.secret(),
  ]);
  console.log('  Treasury public key:', treasury.publicKey);

  // 4. Create basketball league
  console.log('\n🏀 Creating basketball league...');
  const admin = users[0];
  const basketballLeague = await League.create({
    name: 'Manila Community Basketball League 2026',
    sport: 'basketball',
    description:
      'Annual community basketball tournament bringing together teams from all over Metro Manila. Transparent prize pool, fair play, and good vibes.',
    season: '2026-Q2',
    location: 'Rizal Memorial Sports Complex, Manila',
    registrationFee: 50,
    maxTeams: 8,
    minPlayersPerTeam: 5,
    maxPlayersPerTeam: 10,
    prizeDistribution: { first: 60, second: 30, third: 10 },
    treasuryPublicKey: treasury.publicKey,
    treasurySecretKey: treasury.secretKey,
    treasurySigners: treasury.signers,
    status: 'registration_open',
    registrationOpensAt: new Date(),
    registrationClosesAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    startsAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    createdBy: admin._id,
    bannerColor: 'from-orange-500 to-red-600',
  });
  console.log('  ✓', basketballLeague.name);

  // 5. Create volleyball league
  console.log('\n🏐 Creating volleyball league...');
  const volleyballLeague = await League.create({
    name: 'Quezon City Volleyball Open 2026',
    sport: 'volleyball',
    description:
      'Open volleyball league for community teams. 6-player format, single-elimination playoffs.',
    season: '2026-Q2',
    location: 'QC Sports Center',
    registrationFee: 30,
    maxTeams: 6,
    minPlayersPerTeam: 6,
    maxPlayersPerTeam: 10,
    prizeDistribution: { first: 60, second: 30, third: 10 },
    treasuryPublicKey: treasury.publicKey,
    treasurySecretKey: treasury.secretKey,
    treasurySigners: treasury.signers,
    status: 'registration_open',
    registrationOpensAt: new Date(),
    registrationClosesAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    startsAt: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    createdBy: admin._id,
    bannerColor: 'from-blue-500 to-cyan-600',
  });
  console.log('  ✓', volleyballLeague.name);

  // 6. Register teams
  console.log('\n👕 Registering teams...');
  const teamSpecs = [
    { name: 'Manila Eagles', captain: users[1], league: basketballLeague, fee: 50 },
    { name: 'Pasig Bulldogs', captain: users[2], league: basketballLeague, fee: 50 },
    { name: 'QC Tigers', captain: users[3], league: basketballLeague, fee: 50 },
    { name: 'QC Spikers', captain: users[2], league: volleyballLeague, fee: 30 },
    { name: 'Manila Aces', captain: users[3], league: volleyballLeague, fee: 30 },
  ];

  const teams = [];
  for (const spec of teamSpecs) {
    const teamKp = generateKeypair();
    try {
      await fundTestnetAccount(teamKp.publicKey());
    } catch {}
    await sleep(500);

    const team = await Team.create({
      name: spec.name,
      league: spec.league._id,
      captain: spec.captain._id,
      walletPublicKey: teamKp.publicKey(),
      walletSecretKey: teamKp.secret(),
      players: [
        { user: spec.captain._id, name: spec.captain.name, joinedAt: new Date() },
      ],
    });
    teams.push({ team, fee: spec.fee, captain: spec.captain, league: spec.league });
    console.log(`  ✓ ${spec.name} (${spec.league.sport})`);
  }

  // 7. Make real Stellar payments
  console.log('\n💸 Sending real testnet payments to treasury...');

  for (const t of teams) {
    const captainUser = await User.findById(t.captain._id).select('+stellarSecretKey');
    if (!captainUser.stellarSecretKey) {
      console.log(`  ⚠️  No secret for ${t.team.name}`);
      continue;
    }

    const memo = `${t.league.name.slice(0, 14)}:${t.team.name.slice(0, 8)}`;
    try {
      const result = await sendPayment({
        sourceSecret: captainUser.stellarSecretKey,
        destination: t.league.treasuryPublicKey,
        amount: t.fee.toString(),
        memo,
      });
      console.log(`  ✓ ${t.team.name} paid ${t.fee} XLM (tx: ${result.hash.slice(0, 8)}...)`);

      const verification = await verifyTransaction(result.hash);

      const payment = await Payment.create({
        type: 'dues',
        league: t.league._id,
        team: t.team._id,
        payer: t.captain._id,
        payerPublicKey: captainUser.stellarPublicKey,
        payerName: captainUser.name,
        recipientPublicKey: t.league.treasuryPublicKey,
        amount: t.fee,
        txHash: result.hash,
        ledger: result.ledger,
        memo,
        blockchainTimestamp: verification.createdAt,
        status: 'confirmed',
        feeCharged: parseFloat(verification.feeXLM),
        note: `${t.team.name} registration in ${t.league.name}`,
      });

      t.team.paymentStatus = 'paid';
      t.team.paidAmount = t.fee;
      t.team.paymentTxHash = result.hash;
      t.team.paidAt = new Date();
      await t.team.save();

      await sleep(1000);
    } catch (err) {
      console.log(`  ✗ ${t.team.name} payment failed:`, err.message);
    }
  }

  // 8. Summary
  console.log('\n' + '='.repeat(60));
  console.log('🎉 SEED COMPLETE!');
  console.log('='.repeat(60));
  console.log('\n📋 Demo Accounts (all password: demo1234):');
  userSpecs.forEach((u) => console.log(`  • ${u.email} (${u.role})`));
  console.log('\n🏀 Basketball League:', basketballLeague.name);
  console.log('   Treasury:', basketballLeague.treasuryPublicKey);
  console.log('   Teams:', await Team.countDocuments({ league: basketballLeague._id }));
  console.log('\n🏐 Volleyball League:', volleyballLeague.name);
  console.log('   Teams:', await Team.countDocuments({ league: volleyballLeague._id }));
  console.log('\n💰 Total collected:',
    (await Payment.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, t: { $sum: '$amount' } } },
    ]))[0]?.t || 0, 'XLM');

  console.log('\n💡 Treasury signer secrets have been saved to backend/.env');
  console.log('   You can now start the server with: npm run dev\n');

  await mongoose.connection.close();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('❌ Seed failed:', err);
  await mongoose.connection.close();
  process.exit(1);
});
