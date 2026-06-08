import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
      required: true,
      index: true,
    },
    round: {
      type: Number,
      required: true,
    },
    matchNumber: Number,
    teamA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    teamB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    scoreA: { type: Number, default: 0 },
    scoreB: { type: Number, default: 0 },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed'],
      default: 'scheduled',
    },
    scheduledFor: Date,
    playedAt: Date,
    notes: String,
  },
  { timestamps: true }
);

matchSchema.index({ league: 1, round: 1 });

export default mongoose.model('Match', matchSchema);
