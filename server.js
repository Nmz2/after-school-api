require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const path = require("path");
const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(new Date().toISOString() + " " + req.method + " " + req.url);
    next();
});

// If the image exists in the images folder, send it
app.use("/images", express.static(path.join(__dirname, "images")));

// If it didn't exist, this runs and sends an error
app.use("/images", function (req, res) {
  res.status(404).json({ error: "Image not found: " + req.url });
});

const client = new MongoClient(process.env.MONGO_URI);
let lessonsCollection;

app.get("/lessons", async (req, res) => {
  try {
    const lessons = await lessonsCollection.find({}).toArray();
    res.json(lessons);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Could not read lessons" });
  }
});

async function start() {
  await client.connect();
  lessonsCollection = client.db("afterschool").collection("lessons");
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log("Server running on port " + port));
}

start();