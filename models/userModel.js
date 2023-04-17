const crypto = require('crypto');

const mongoose = require('mongoose');
const validator = require('validator');

const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address'],

    lowercase: true,
    validate: [
      validator.isEmail,
      'Please provide a valid email address',
    ],
  },
  verified: Boolean,
  photo: {
    type: String,
    default: 'default.jpg',
  },
  passwordChangedAt: Date,
  password: {
    type: String,
    minlength: 8,
    required: [true, 'Please provide a password'],
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // this only works on Create && Save
      validator: function (value) {
        return value === this.password;
      },
      message: 'Passwords are not the same ',
    },
  },
  passowrdResetToken: String,
  passowrdResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew)
    return next();

  this.passwordChangedAt = Date.now() - 1000;

  next();
});
userSchema.pre('save', async function (next) {
  // Only run this function if the password was actually modified
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } }).select('-__v');
  next();
});

// instance method
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassowrd
) {
  return await bcrypt.compare(
    candidatePassword,
    userPassowrd
  );
};

userSchema.methods.changedPasswordAfter = function (
  JWTTimeStamp
) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000
    );
    // token was issued at time 100 <changed password at time 200 => passw changed after the token
    return JWTTimeStamp < changedTimeStamp;
  }

  // false means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); // fdsjk932039293399
  this.passowrdResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passowrdResetExpires = Date.now() + 10 * 60 * 1000;

  console.log({ resetToken }, this.passowrdResetToken);

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
