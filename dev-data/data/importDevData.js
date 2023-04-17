const fs = require('fs');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');
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

// first tours-simple.json
// second tours
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
);
// console.log(tours);
const importData = async () => {
  try {
    await Tour.create(tours).then(() =>
      console.log('IMPORT DATA Success')
    );
    await Review.create(reviews).then(() =>
      console.log('IMPORT DATA Success')
    );
    await User.create(users, {
      validateBeforeSave: false,
    }).then(() => console.log('IMPORT DATA Success'));

  } catch (err) {
    console.log(err);
  }
  process.exit();
};
const deletetData = async () => {
  try {
    await Tour.deleteMany().then(() =>
      console.log('DELETE DATA Success')
    );    await Review.deleteMany().then(() =>
      console.log('DELETE DATA Success')
    );    await User.deleteMany().then(() =>
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

//  node ./dev-data/data/importDevData.js --import
