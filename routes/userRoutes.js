const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);

router.patch(
  '/updateMe',
  authController.protect,
  userController.updateMe
);
router.delete(
  '/deleteMe',
  authController.protect,
  userController.deleteMe
);

router.post(
  '/forgotPassowrd',
  authController.forgotPassword
);
router.patch(
  '/resetPassword/:token',
  authController.resetPassword
);
router.patch(
  '/updateMyPassword/:id',
  authController.protect,
  authController.updatePassowrd
);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

// router
//   .route('/:id')
//   .get(userController.getUser)
//   .delete(userController.deleteUser);
module.exports = router;
