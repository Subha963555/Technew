const mongoose = require('mongoose');

const formDataSchema = new mongoose.Schema({
  nam: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  dob: { type: Date, required: true },
  image: { type: String },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }]
});

const FormData = mongoose.model('FormData', formDataSchema);

module.exports = FormData;
