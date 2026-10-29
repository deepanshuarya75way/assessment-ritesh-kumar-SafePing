const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    radius: {
      type: Number,
      required: true,
      min: 50,
    },
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact',
        required: true,
      },
    ],
    message: {
      type: String,
      required: true,
      trim: true,
    },
    cooldownMinutes: {
      type: Number,
      default: 60,
    },
    paused:{
      type:Boolean,
      default:false,
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model('Location', locationSchema);
