const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const fileRoutes = require("./routes/fileRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/files", fileRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
});

module.exports = app;
