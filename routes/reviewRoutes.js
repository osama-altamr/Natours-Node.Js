const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const express = require('express');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.route('/').get(reviewController.getAllReviews).post(
  authController.restrictTo('user'),
  reviewController.setTourUserIds,
  reviewController.actuallyBooked,
  reviewController.createReview
);

router
  .route('/:id')
  .patch(
    // authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  )
  .get(reviewController.getReview);

// router
//   .route('/:id')
//   .get(  authController.protect , reviewController.getReviewsToSpecificTour);

module.exports = router;
