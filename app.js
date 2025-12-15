require("dotenv").config();
const express = require("express");
const { connectDB } = require("./config/db");

const app = express();

app.use(express.json());
connectDB();

app.use("/api/points", require("./routes/points.route"));

const PORT = process.env.PORT || 5000;


app.listen(PORT, '10.106.0.4', () => {
  console.log(`🚀 Server running on http:/10.106.0.4:${PORT}`);
});

app.listen(PORT, '10.106.0.4', () => {
  console.log(`🚀 Server running on http:/10.106.0.4:${PORT}`);
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Server running on http:/127.0.0.1:${PORT}`);
});