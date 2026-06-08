import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
      required: true,
      index: true,
    },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    players: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        jerseyNumber: Number,
        position: String,
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    // The team's receiving Stellar wallet (for prize payouts)
    walletPublicKey: {
      type: String,
      required: true,
    },
    walletSecretKey: {
      type: String,
      select: false,
    },
    inviteCode: {
      type: String,
      unique: true,
      index: true,
    },
    logo: String,
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'pending', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    paymentTxHash: String,
    paidAt: Date,
    bracketPosition: Number,
    seed: Number,
  },
  { timestamps: true }
);

teamSchema.pre('save', function (next) {
  if (!this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

export default mongoose.model('Team', teamSchema);
