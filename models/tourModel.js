const mongoose = require('mongoose');
const validator = require('validator');

const User = require('./userModel');
const slugify = require('slugify');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A tour must have less or equal then 40 characters',
      ],
      minlength: [
        10,
        'A tour must have more or equal then 10 characters',
      ],
      // validate:[validator.isAlpha,'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'Difficulty is either :easy ,medium , difficult ',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0 '],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.666666 =>46.6666=>47 => 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        // this only points to currenct doc on NEW Document Create
        // there are a couple of libs on npm for data validation =>most popular=> validator
        validator: (priceDisc) => priceDisc < this.price,
        message:
          'Discount Price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a image cover '],
    },
    images: [String],
    startDatesTest: [
      {
        date: Date,
        participant: { type: Number, default: 0 },
        soldOut: {
          type: Boolean,
          default: false,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: { type: Boolean, default: false },
    startLocation: {
      // geospatial data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array,
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// 2d or 2dsphere
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.index({
  price: 1,
  ratingsAverage: -1,
});

tourSchema.index({
  slug: 1,
});

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// Virtual populate

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// MONGOOSE MIDDLEWARE

// Documnet Middleware ,hook: runs before save() and create()
// insertMany ❌

// tourSchema.pre('save', async function () {
//   const guidesPromises = this.guides.map(
//     async (id) => await User.findById(id)
//   );
//   this.guides = await Promise.all(guidesPromises);
// });

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    lower: true,
    replacement: '-',
  });
  next();
});

// tourSchema.pre('save', function (next) {

//   console.log('Will Save Doc', this.name ='before dB');
//   next();
// });

// //After pre Middleware  completed and after comminning data from DB before sending response

// tourSchema.post('save', function (doc, next) {
//   console.log('Post Middleware', doc.name='post middleware');
//   next();
// });

// QUERY MIDDLEWARE

tourSchema.pre(/^find/, function (next) {
  // tow queries find and populate ❌💣
  this.populate({
    path: 'guides',
    select: '-passwordChangedAt',
  });
  next();
});

// tourSchema.pre(/^find/, function (next) {
//   console.log('Pre method in Query middleware ');
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

// tourSchema.post(/^find/, function (docs, next) {
//   console.log('Post  method in Query middleware ', docs[0]);
//   next();
// });

// // AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({
//     $match: { secretTour: { $ne: true } },
//   });
//   console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
