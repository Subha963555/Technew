const mongoose = require('mongoose');

const connectToMongoDB = () => {
  return mongoose.connect('mongodb://localhost:27017/users').then(
    console.log("mongodb conneced...")
  )
};

module.exports = { connectToMongoDB };
