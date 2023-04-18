const { promisify } = require('util');
const crypto = require('crypto');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const speakeasy = require('speakeasy');
const jwt = require('jsonwebtoken');
const { request } = require('http');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        process.env.JWT_COOKIE_EXPIRES_IN *
          24 *
          60 *
          60 *
          1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV == 'production')
    cookieOptions.secure = true;
  user.password = undefined;
  res.cookie('jwt', token, cookieOptions);

  return res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordChangedAt: req.body.passwordChangedAt,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });
  const url = `${req.protocol}://${req.get('host')}/`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) check if email and password exist
  if (!email || !password) {
    return next(
      new AppError('Please provide email and password', 400)
    );
  }

  // 2) check if user exists && password is correct
  const user = await User.findOne({
    email,
  }).select('+password');
  if (
    !user ||
    !(await user.correctPassword(password, user.password))
  ) {
    return next(
      new AppError('Incorrect email or passowrd ', 401)
    );
  }

  // 3) If everything is ok, send token to the client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError(
        'You are not logged in ! Please log in to get access ',
        401
      )
    );
  }

  // Verification token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  console.log('decoded in Protect Function ', decoded);

  //Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist',
        401
      )
    );
  }
  // Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed password! Please log in again .',
        401
      )
    );
  }
  // Grant access to Protected Route
  req.user = currentUser; // this here might be useful at some point in the future
  next();
});

exports.restrictTo = (...roles) => {
  // roles => ['admin', 'lead-guide']
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perform this action',
          403
        )
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(
  async (req, res, next) => {
    //  Get user based on Posted email
    const user = await User.findOne({
      email: req.body.email,
    });
    if (!user) {
      return next(
        new AppError(
          'There is no user with that  email address',
          404
        )
      );
    }

    //  Generate  the random token
    const resetToken = user.createPasswordResetToken();
    await user.save({
      validateBeforeSave: false,
    });

    try {
      // send it to user's email
      const resetURL = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/resetPassword/${resetToken}`;

      await new Email(user, resetURL).sendPasswordReset();

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email',
      });
    } catch (err) {
      user.passowrdResetToken = undefined;
      user.passowrdResetExpires = undefined;
      await user.save({
        validateBeforeSave: false,
      });
      return next(
        new AppError(
          'There was an error sending the email. Try again later.'
        ),
        500
      );
    }
  }
);

exports.resetPassword = catchAsync(
  async (req, res, next) => {
    //  1) Get user based on the token
    const hashToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    const user = await User.findOne({
      passowrdResetToken: hashToken,
      passowrdResetExpires: { $gt: Date.now() },
    });

    // 2)if token has not expired , there is user ,=>set the new password

    if (!user) {
      return next(
        new AppError('Token is invalid or has expired', 400)
      );
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passowrdResetToken = undefined;
    user.passowrdResetExpires = undefined;
    console.log(user.password, user.passwordConfirm);
    await user.save();
    // 3) Update changePassowrdAt

    // 4) log user in ,send new JWT token

    createSendToken(user, 200, res);
  }
);

exports.updatePassowrd = catchAsync(
  async (req, res, next) => {
    // 1) Get user from Collection
    const user = await User.findById(req.params.id).select(
      '+password'
    );

    // 2) Check if Posted Password  is correct
    if (
      !(await user.correctPassword(
        req.body.currentPassword,
        user.password
      ))
    ) {
      return next(
        new AppError('You current password is wrong ', 401)
      );
    }

    // 3) if so ,update passowrd
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // User.findByIdAndUpdate() will NOT WORK because validate not working and pre middleware not working

    // 4) log user in ,Send  JWT token
    createSendToken(user, 200, res);
  }
);
