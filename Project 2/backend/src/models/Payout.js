import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema(
  {
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
      required: true,
      index: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      index: true,
    },
    place: {
      type: String,
      enum: ['first', 'second', 'third'],
      required: true,
    },
    // Recipient
    recipientPublicKey: {
      type: String,
      required: true,
    },
    recipientName: String,
    // From which treasury account
    sourcePublicKey: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      // XLM
    },
    // Percentage of the total pool
    percentage: Number,
    // Stellar transaction
    txHash: {
      type: String,
      unique: true,
      sparse: true,
    },
    ledger: Number,
    memo: String,
    blockchainTimestamp: Date,
    status: {
      type: String,
      enum: ['pending', 'processing', 'confirmed', 'failed'],
      default: 'pending',
    },
    failureReason: String,
    signaturesCollected: [
      {
        signerPublicKey: String,
        signedAt: Date,
      },
    ],
    notes: String,
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

payoutSchema.index({ league: 1, place: 1 });

export default mongoose.model('Payout', payoutSchema);
