const mongoose = require('mongoose');

const groceryListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  items: [{
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    },
    unit: {
      type: String,
      default: 'piece'
    },
    category: {
      type: String,
      default: 'other'
    },
    isChecked: {
      type: Boolean,
      default: false
    }
  }],
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GroceryList', groceryListSchema); 