const mongoose = require('mongoose');

const exerciseVideoSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: { type: String, required: true },
  tag: { type: String, required: true },
  details: { type: String, required: true },
  link: { type: String, required: true },
  steps: [{ type: String, required: true }],
  calories: { type: Number, required: true },
  duration: { type: String, required: true },
  difficulty: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ExerciseVideo', exerciseVideoSchema); 