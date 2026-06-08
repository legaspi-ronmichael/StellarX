import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'captain', 'player'],
      default: 'player',
    },
    stellarPublicKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // NOTE: Secret keys are stored ONLY for demo. In production,
    // users would use their own wallet (Freighter) and we never store secrets.
    stellarSecretKey: {
      type: String,
      select: false,
    },
    avatar: String,
    phone: String,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.stellarSecretKey;
  return obj;
};

export default mongoose.model('User', userSchema);
