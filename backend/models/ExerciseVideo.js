const mongoose = require('mongoose');

const exerciseVideoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ExerciseVideo', exerciseVideoSchema); 