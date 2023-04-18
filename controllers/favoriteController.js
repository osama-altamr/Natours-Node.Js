const factory = require('./handlerFactory');
const Favorite = require('../models/favoriteModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.setUserTourIDs = (req, res, next) => {
  if (!req.body.user) req.body.user = req.params.userId;
  if (!req.body.tour) req.body.tour = req.params.tourId;
  console.log(req.params);
  next();
};
exports.checkTourIsFavorite = async (req, res, next) => {
  const fav = await Favorite.find({
    'favorites.tour': req.body.tour,
  });
  if (fav)
    return next(
      new AppError(
        " you've already favorited this tour",
        400
      )
    );
  next();
};

exports.getAllFavorites = factory.getAll(Favorite);
exports.createFavorite = factory.createOne(Favorite);
exports.getFavorite = factory.getOne(Favorite);
