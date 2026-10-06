const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an item title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
  },
  image: {
    type: String,
    required: [true, 'Please provide an image'],
  },
  location: {
    type: String,
    default: 'Not specified',
    trim: true,
  },
  contact: {
    type: String,
    default: 'Not specified',
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Item', itemSchema);
