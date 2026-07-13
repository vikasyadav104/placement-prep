const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  leetcodeUsername: {
    type: String,
    default: '',
  },
  codeforcesUsername: {
    type: String,
    default: '',
  },
  codeforcesStats: {
  type: Object,
  default: {},
  },
  leetcodeStats: {
  type: Object,
  default: {},
},
// Add these fields inside your userSchema in User.js
  interviewRating: {
    type: Number,
    default: 1200, // Standard starting rating (like Codeforces)
  },
  interviewHistory: [
    {
      date: { type: Date, default: Date.now },
      score: { type: Number, required: true },
      ratingChange: { type: Number },
      newRating: { type: Number },
    }
  ],

}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;