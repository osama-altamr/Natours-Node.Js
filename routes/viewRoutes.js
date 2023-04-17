const express = require('express');

const viewController = require('./../controllers/viewsController');
const bookingController = require('./../controllers/bookingController');

const router = express.Router();

router.get(
  '/',
  bookingController.createBookingCheckout,
  viewController.getOverview
);
router.get('/tour/:slug', viewController.getTour);
router.get('/login', viewController.getLoginForm);
router.get('my-tours', viewController.getMyTours)

module.exports = router;
