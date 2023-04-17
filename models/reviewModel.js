const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      require: true,
      min: [0, 'Minimum rating is 0'],
      max: [5, 'Maximum rating is 5'],
      default: 0,
    },
    review: {
      type: String,
      required: [true, 'Please add your review'],
      maxlength: 300,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must have an author'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function (
  tourId
) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});
reviewSchema.pre(/^findOneAnd/, async function (next) {
  //  console.log(await this);
  this.rev = await this.findOne().clone();

  if (!this.rev) {
    return next(new appError('cant find this review', 404));
  }

  //this.constructor.calcAverageRatings(this.tour);
  next();
});

reviewSchema.post(
  /findOne/,
  async function (doc, next) {

    if (!doc) next();
    if (
      doc &&
      doc.constructor &&
      typeof doc.constructor.calcAverageRatings ===
        'function'
    ) {
      console.log(doc,"Dooocs")
      console.log('PPPPPPPOOOOOSTTTTTTTTTT')
      await doc.constructor.calcAverageRatings(
        doc.tour
      );
    }
    next();
  }
);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;