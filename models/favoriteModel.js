const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'favorite must belong to a user'],
    },
    favorites: [
      {
        tour: {
          type: mongoose.Schema.ObjectId,
          ref: 'Tour',
          required: [
            true,
            'favorite must belong to a tour',
          ],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

favoriteSchema.pre(/^find/, function (next) {
  // tow queries find and populate ❌💣
  this.populate(
    'favorites.tour',
    '-guides name ratingsAverage  price '
  );
  next();
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
