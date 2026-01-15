require("dotenv").config(); // THIS MUST BE LINE 1
const database = require("./db");
// ... everything else follows
const express = require("express");
const cors = require("cors");
const path = require("path"); // Useful for serving static files

// Initialize Database
database();

const app = express();

// 2. Use dynamic port for Render
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 3. Configure CORS properly
// For production, you'd eventually replace "*" with your frontend URL
app.use(cors({ origin: "*" }));

// Health Check Route (Highly recommended for Render/monitoring)
app.get("/health", (req, res) => {
  res.status(200).send("Server is healthy and running!");
});

// Routes
app.use("/admin", require("./routes/adminRoutes"));
app.use("/room", require("./routes/roomRoutes"));
app.use("/book", require("./routes/bookingRoutes"));
app.use("/user", require("./routes/userRoutes"));

// 4. Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong on the server!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running live on port ${PORT}`);
});
