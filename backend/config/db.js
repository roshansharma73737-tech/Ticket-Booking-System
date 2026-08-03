const mongoose = require("mongoose");

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.error("Database Connection Failed");
        console.error(error.message);

        process.exit(1);
    }
}

module.exports = connectDB;