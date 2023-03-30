const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const morgan = require('morgan');
const express = require('express');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
// 1:MIDDLEWARES
// app.use((req, res, next) => {
//   console.log(req.headers);

//   next();
// });

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

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
