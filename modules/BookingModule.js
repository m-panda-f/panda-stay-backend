const db = require('mongoose');
const { Schema } = db;

const Booking = new Schema({
  roomId: {
    type: Number,
    ref: "room",
    required: true,
  },
  bookingId: {
    type: String,
    require: true,
    unique: true,
  },
  userId: {
    type: Number,
    required: true,
    ref: "user",
  },
  guest_name: {
    type: String,
    require: true,
  },
  from_date: {
    type: Date,
    require: true,
  },
  to_date: {
    type: Date,
    required: true,
  },
  stayDays: { type: Number },
  pricePerNight: { type: Number }, 
  totalPrice: { type: Number }, 
  bookedAt: { type: Date, default: Date.now },
});

module.exports = db.model('booking', Booking);