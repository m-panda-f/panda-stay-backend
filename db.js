const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    const connString = process.env.MONGO_URI;

    if (!connString) {
      console.error("ERROR: MONGO_URI is not defined in .env file");
      process.exit(1); // Stop the server if there's no DB string
    }

    await mongoose.connect(connString);
    console.log("Database connected successfully to MongoDB Atlas");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;
