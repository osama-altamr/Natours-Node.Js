const authController = require('../controllers/authController');
const favoriteController = require('../controllers/favoriteController');

const express = require('express');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .post(
    authController.restrictTo('user'),
    favoriteController.setUserTourIDs,
    favoriteController.checkTourIsFavorite,
    favoriteController.createFavorite
  )
  .get(
    authController.restrictTo('admin', 'user'),
    favoriteController.getAllFavorites
  );

router
  .route('/:id')
  .get(
    authController.restrictTo('admin'),
    favoriteController.getFavorite
  );

module.exports = router;
