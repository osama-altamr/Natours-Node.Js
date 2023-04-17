const fs = require('fs');

const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

const reviewRouter = require('./reviewRoutes');
const bookingRouter = require('./bookingRoutes');
const express = require('express');

const router = express.Router();

router.use('/:tourId/bookings', bookingRouter);

router.use(
  '/:tourId/reviews',
  reviewRouter
);

router
  .route('/top-5-cheap')
  .get(
    tourController.aliasTopTours,
    tourController.getAllTours
  );

router
  .route('/tour-stats')
  .get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo(
      'admin',
      'lead-guide',
      'guide'
    ),
    tourController.getMonthlyPlan
  );

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'leade-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'leade-guide'),
    tourController.deleteTour
  );

router
  .route(
    '/tours-within/:distance/center/:latlng/unit/:unit'
  )
  .get(tourController.getToursWithin);

router
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getDistances);

// router
//   .route('/:tourId/re  views')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

module.exports = router;
