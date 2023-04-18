const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const bookingRouter = require('./bookingRoutes');
const favoriteRouter = require('./favoriteRoutes');
const express = require('express');

const router = express.Router();

router.use('/:userId/bookings', bookingRouter);
router.use('/:userId/favorites', favoriteRouter);

router.post('/login', authController.login);

router.post('/signup', authController.signup);

router.post(
  '/forgotPassowrd',
  authController.forgotPassword
);
router.patch(
  '/resetPassword/:token',
  authController.resetPassword
);

// just passoword
router.patch(
  '/updateMyPassword/:id',
  authController.protect,
  authController.updatePassowrd
);
// Protect all routes after this middleware
router.use(authController.protect);

// name or email
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

router.delete('/deleteMe', userController.deleteMe);

router.get(
  '/me',
  userController.getMe,
  userController.getUser
);
//just admins will be able to
router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
