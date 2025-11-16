const mongoose = require('mongoose');

const coinSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  continentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  countryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  frontImageBase64: {
    type: String,
    required: true
  },
  backImageBase64: {
    type: String,
    default: null
  },
  cropShape: {
    type: String,
    enum: ['rect', 'square', 'circle'],
    default: 'rect'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Coin', coinSchema);

