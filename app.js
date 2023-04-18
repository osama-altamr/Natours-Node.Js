const path = require('path');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const favoriteRouter = require('./routes/favoriteRoutes');

const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const hpp = require('hpp');

const morgan = require('morgan');
const express = require('express');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// GlOBAL MIDDLEWARES

// Serving Static Files

app.use(express.static(path.join(__dirname, 'public')));

//Set SECURITY HTTP headers
app.use(helmet());
// Limit requests  from The same ip 100 request
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, //per 1 hour
  message:
    'Too many requests from this IP ,please try again in an hour!',
});

app.use('/api', limiter);

// DEVELOPMENT
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Body parser ,reading data from the body int req.body
app.use(express.json({ limit: '10kb' }));

// DATA sanitization against NOSQL qurey injection
app.use(mongoSanitize());

// DATA sanitization against NOSQL qurey injection
app.use(xss());

// Prevent Parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingQuantity',
      'ratingAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
app.use(compression());

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/favorites', favoriteRouter);

app.use('/', viewRouter);

// Operational Error
app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Can't find ${req.originalUrl} on this server!`,
      404
    )
  );
});

app.use(globalErrorHandler);

module.exports = app;
