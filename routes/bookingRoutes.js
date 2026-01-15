const app = require("express").Router();
const Admin = require("../modules/AdminModule");
const Room = require("../modules/RoomsModule");
const Booking = require("../modules/BookingModule");


// 1. SEARCH AVAILABLE ROOMS
// backend/routes/room.js

app.post("/avail", async (req, res) => {
  try {
    const data = req.body.payload || req.body;
    const { from_date, to_date, room_type } = data;

    if (!from_date || !to_date) {
      return res
        .status(400)
        .json({ message: "Check-in and Check-out dates are required." });
    }

    const start = new Date(from_date);
    const end = new Date(to_date);
    const overlapBookings = await Booking.find({
      $and: [{ from_date: { $lt: end } }, { to_date: { $gt: start } }],
    }).select("roomId");

    const bookedRoomIds = overlapBookings.map((b) => b.roomId);
    let filter = {
      roomId: { $nin: bookedRoomIds },
    };
    if (room_type && room_type !== "All") {
      filter.room_type = { $regex: new RegExp(`^${room_type}$`, "i") };
    }

    const availableRooms = await Room.find(filter);
    if(!availableRooms) return res.status(200).json({message:"No room Available"})
    console.log(
      `Found ${availableRooms.length} rooms matching: ${room_type || "Any"}`
    );

    res.status(200).json(availableRooms);
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ error: "Server error during availability search" });
  }
});


// 2. CREATE A NEW BOOKING
app.post("/book/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const data = req.body.payload || req.body;
    const { bookingId, userId, guest_name, from_date, to_date } = data;

   
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ message: "Room not found" });

   
    const start = new Date(from_date);
    const end = new Date(to_date);
    const timeDiff = end.getTime() - start.getTime();
    const dayCount = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (dayCount <= 0) {
      return res
        .status(400)
        .json({ message: "Check-out date must be after Check-in date." });
    }

   
    const isAlreadyBooked = await Booking.findOne({
      roomId: roomId,
      $and: [{ from_date: { $lt: end } }, { to_date: { $gt: start } }],
    });

    if (isAlreadyBooked) {
      return res
        .status(400)
        .json({ message: "Room is already reserved for these dates." });
    }

    
    const totalAmount = dayCount * room.price;

    
    const newBooking = new Booking({
      roomId,
      bookingId,
      userId,
      guest_name,
      from_date: start,
      to_date: end,
      stayDays: dayCount,
      pricePerNight: room.price, 
      totalPrice: totalAmount,
    });

    await newBooking.save();
    res.status(201).json({
      message: "Booking Successful",
      bookingDetails: newBooking,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 3. GET BOOKING HISTORY FOR A USER
app.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;


    const bookings = await Booking.find({ userId })
      .sort({ from_date: -1 })
      .lean();

    
    const historyWithRoomInfo = await Promise.all(
      bookings.map(async (booking) => {
        const roomData = await Room.findOne({ roomId: booking.roomId }).select(
          "images room_type"
        );
        return {
          ...booking,
          room_type: roomData?.room_type || "N/A",
          room_images: roomData?.images || [],
        };
      })
    );

    res.status(200).json(historyWithRoomInfo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 4. DELETE/CANCEL A BOOKING

app.delete("/delete/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const deletedBooking = await Booking.findOneAndDelete({ bookingId });

    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking ID not found." });
    }

    res.status(200).json({ message: "Booking cancelled and record deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;