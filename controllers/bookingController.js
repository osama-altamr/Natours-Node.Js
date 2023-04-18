const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const Booking = require('../models/bookingModel');

const stripe = require('stripe')(
  process.env.STRIPE_SECRET_KEY
);

exports.getCheckoutSession = catchAsync(
  async (req, res, next) => {
    const booking = await Booking.find({
      user: req.user,
      tour: req.params.tourId,
    });
    if (booking) {
      return next(
        new AppError('The tour is already booked', 400)
      );
    }
    //   1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);

    //   2) Create checkout session
    const customer = await stripe.customers.create({
      name: req.user.name,
      email: req.user.email,
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get(
        'host'
      )}/?tour=${req.params.tourId}&user=${
        req.user.id
      }&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get(
        'host'
      )}/tour/${tour.slug}`,
      // customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [
                `https://www.natours.dev/img/tours/${tour.imageCover}`,
              ], //will changed in produciton mode
            },
            unit_amount: tour.price * 100,
          },

          quantity: 1,
        },
      ],
    });

    // this solution is temporary  because it is not really secure
    //after deployed on a server   using stripe webhooks to create a new booking
    if (session.success_url.split('?')[1]) {
      await Booking.create({
        tour: req.params.tourId,
        user: req.user.id,
        price: tour.price,
      });
    }

    //   3) Create session as response
    res.status(200).json({
      status: 'success',
      session,
    });
  }
);

exports.createBookingCheckout = catchAsync(
  async (req, res, next) => {
    // This in only TEMPORARY,because it's UNSECURE :everyone can bookings without paying

    const { tour, user, price } = req.query;

    if (!tour && !user && !price) next();

    //verif that the tour still has places in the selected date
    // const tourTest=await Tour.findById(tour);
    // if(tourTest.startDatesTest[ind].soldOut) return next(new appError("w've run out of places at that date",400));

    await Booking.create({
      tour,
      user,
      price,
    });
    res.redirect(req.originalUrl.split('?')[0]);
  }
);

exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);

exports.addParticipants = catchAsync(
  async (req, res, next) => {
    const tour = await Tour.findById(req.body.tour);
    const ind = req.body.startDatesTest;
    if (tour.startDatesTest[ind].soldOut)
      return next(
        new AppError(
          "w've run out of places at that date",
          400
        )
      );
    tour.startDatesTest[ind].participant + 1;
    if (
      tour.startDatesTest[ind].participant >
      tour.maxGroupSize
    ) {
      tour.startDatesTest[ind].soldOut = true;
    }
    await tour.save();
    next();
  }
);
/* 
[
  {
   date 2020 18 3
  }
  2023 20 4

]
*/
