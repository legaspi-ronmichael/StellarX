import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['dues', 'individual', 'topup'],
      default: 'dues',
    },
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
      index: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      index: true,
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    payerPublicKey: {
      type: String,
      required: true,
    },
    payerName: String,
    // Recipient (treasury)
    recipientPublicKey: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      // XLM
    },
    // Stellar transaction details
    txHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ledger: Number,
    memo: String,
    memoType: {
      type: String,
      default: 'text',
    },
    // On-chain timestamp from Stellar
    blockchainTimestamp: Date,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending',
    },
    feeCharged: Number, // in XLM (stroops/10000000)
    note: String,
  },
  { timestamps: true }
);

paymentSchema.index({ league: 1, createdAt: -1 });
paymentSchema.index({ payerPublicKey: 1, createdAt: -1 });

export default mongoose.model('Payment', paymentSchema);
