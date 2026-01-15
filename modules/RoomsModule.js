const db = require('mongoose');
const { Schema } = db;

const Room = new Schema({
  adminId: {
    type: Number,
    required: true,
    ref: "Admin",
  },
  roomId: {
    type: Number,
    unique: true,
    required: true,
  },
  room_type: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  images: {
    type: [String],
    default: [],
  },
  description: { type: String },
});

module.exports = db.model('room',Room)