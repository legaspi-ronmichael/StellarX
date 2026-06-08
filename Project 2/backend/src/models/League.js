import mongoose from 'mongoose';

const leagueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sport: {
      type: String,
      enum: ['basketball', 'volleyball'],
      required: true,
    },
    description: String,
    season: {
      type: String,
      default: () => `${new Date().getFullYear()}-Q${Math.floor(new Date().getMonth() / 3) + 1}`,
    },
    location: String,
    registrationFee: {
      type: Number,
      required: true,
      min: 0,
      // XLM amount per team
    },
    maxTeams: {
      type: Number,
      default: 16,
    },
    minPlayersPerTeam: {
      type: Number,
      default: 5,
    },
    maxPlayersPerTeam: {
      type: Number,
      default: 12,
    },
    prizeDistribution: {
      // Percentage breakdown of the prize pool
      first: { type: Number, default: 60 },
      second: { type: Number, default: 30 },
      third: { type: Number, default: 10 },
    },
    // The Stellar multi-sig treasury account that holds the prize pool
    treasuryPublicKey: {
      type: String,
      required: true,
    },
    treasurySecretKey: {
      type: String,
      select: false,
    },
    // The 3 signers on the multi-sig treasury
    treasurySigners: [
      {
        publicKey: String,
        weight: Number,
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'registration_open', 'in_progress', 'completed', 'cancelled'],
      default: 'draft',
    },
    registrationOpensAt: Date,
    registrationClosesAt: Date,
    startsAt: Date,
    endsAt: Date,
    winners: {
      first: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
      second: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
      third: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    },
    payoutsCompleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bannerColor: {
      type: String,
      default: 'from-indigo-500 to-purple-600',
    },
  },
  { timestamps: true }
);

leagueSchema.virtual('teamsCount', {
  ref: 'Team',
  localField: '_id',
  foreignField: 'league',
  count: true,
});

leagueSchema.virtual('teams', {
  ref: 'Team',
  localField: '_id',
  foreignField: 'league',
});

leagueSchema.set('toJSON', { virtuals: true });
leagueSchema.set('toObject', { virtuals: true });

export default mongoose.model('League', leagueSchema);
