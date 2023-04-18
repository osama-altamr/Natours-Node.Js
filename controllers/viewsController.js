const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');

const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get All Tours from collection
  const tours = await Tour.find();
  // 2) Build Template
  // 3) Render that template
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data ,for  the requested tour(including reviews and guides )

  const tour = await Tour.findOne({
    slug: req.params.slug,
  }).populate({
    path: 'reviews',
    fields: 'rating review user',
  });

  // Build template
  // Render Template  using the data from
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.getLoginForm = catchAsync(
  async (req, res, next) => {
    res.status(200).render('login', {
      title: 'login  to your account ',
    });
  }
);

exports.getMyTours = catchAsync(async (req, res, next) => {
  // WiTHOUT Virtual Populate

  // 1) Find all bookings
  const bookings = await Booking.find({
    user: req.user.id,
  });
  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
