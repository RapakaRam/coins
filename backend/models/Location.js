const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["continent", "country"],
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    default: null
  },
  displayOrder: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Location', locationSchema);

