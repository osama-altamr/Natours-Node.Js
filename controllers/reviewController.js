const catchAsync = require('./../utils/catchAsync');
const Review = require('./../models/reviewModel');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const Booking = require('../models/bookingModel');

exports.setTourUserIds = (req, res, next) => {
  // just for allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.actuallyBooked = catchAsync(
  async (req, res, next) => {
    const bookings = await Booking.find({
      tour: req.body.tour,
      user: req.body.user,
    });

    console.log(bookings);
    
    if (bookings.length === 0)
      return next(
        new AppError(
          'You do not have permission to review on  this Tour ,Please book the tour first ',
          403
        )
      );
    next();
  }
);

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
