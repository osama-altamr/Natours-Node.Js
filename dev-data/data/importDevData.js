const fs = require('fs');
const Tour = require('./../../models/tourModel');

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection succussesfull !'));

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);
// console.log(tours);
const importData = async () => {
  try {
    await Tour.create(tours).then(() =>
      console.log('IMPORT DATA Success')
    );
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
const deletetData = async () => {
  try {
    await Tour.deleteMany().then(() =>
      console.log('DELETE DATA Success')
    );
  } catch (err) {}

  process.exit(); 
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deletetData();
}
