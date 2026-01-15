const app = require("express").Router();
const Room = require("../modules/RoomsModule");
const Admin = require("../modules/AdminModule");

//1. Create a Room
app.post("/create", async (req, res) => {
  try {
    const data = req.body.roomData || req.body;
    const { adminId, roomId, room_type, price, rating, images, description } = data;

    const roomexist = await Room.findOne({ roomId });
    if (roomexist)
      return res.status(409).json({ message: "Room ID already exists" });

    const newRoom = new Room({
      adminId,
      roomId,
      room_type,
      price,
      rating,
      images,
      description,
    });

    await newRoom.save();
    res.status(201).json({ message: "Room added successfully", room: newRoom });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 2. GET ALL ROOMS (Optional helper)
app.get("/all", async (req, res) => {
  const rooms = await Room.find();
  res.status(200).json(rooms);
});

app.get("/details/:roomId", async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: "Room not found" });

    res.status(200).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. EDIT ROOM (Updated to allow image updates)
app.put("/edit/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const updatedRoom = await Room.findOneAndUpdate({ roomId }, req.body, {
      new: true,
    });

    if (!updatedRoom)
      return res.status(404).json({ message: "Room not found" });
    res.status(200).json({ message: "Room updated", room: updatedRoom });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE ROOM
app.delete("/delete/:roomId", async (req, res) => {
  try {
    await Room.findOneAndDelete({ roomId: req.params.roomId });
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
