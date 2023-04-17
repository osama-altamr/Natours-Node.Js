const mongoose = require('mongoose');
const dotenv = require('dotenv');


dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception');
  console.log(err.message);
  process.exit(1);
});


const app = require('./app');

const DB = process.env.DATABASE;
console.log(`${DB}`);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection succussesfull !'));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log('App running...on port: ' + port);
});


process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION');
  server.close(() => {
    process.exit(1);
  });
});
