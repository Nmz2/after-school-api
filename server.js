require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
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
let ordersCollection;

app.get("/lessons", async (req, res) => {
  try {
    const lessons = await lessonsCollection.find({}).toArray();
    res.json(lessons);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Could not read lessons" });
  }
});

// Save a new order.
// The body looks like: { name, phone, lessons: [ { lessonID, spaces } ] }
app.post("/orders", async (req, res) => {
  try {
    const { name, phone, lessons } = req.body;
    if (!name || !phone || !Array.isArray(lessons) || lessons.length === 0) {
      return res.status(400).json({ error: "Name, phone and lessons are needed" });
    }

    const order = {
      name: name,
      phone: phone,
      lessons: lessons,
      totalSpaces: lessons.reduce((sum, l) => sum + l.spaces, 0)
    };

    const result = await ordersCollection.insertOne(order);
    res.status(201).json({ message: "Order saved", orderId: result.insertedId });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Could not save order" });
  }
});

// Update any field of one lesson, e.g. { "spaces": 3 } or { "price": 90 }.
// $set puts in the new value, so spaces can be set to any number.
app.put("/lessons/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Not a valid lesson id" });
    }

    const changes = req.body;
    delete changes._id;                 // the id itself must not change
    if (Object.keys(changes).length === 0) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    const result = await lessonsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: changes }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    res.json({ message: "Lesson updated" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Could not update lesson" });
  }
});

async function start() {
  await client.connect();
  lessonsCollection = client.db("afterschool").collection("lessons");
  ordersCollection = client.db("afterschool").collection("orders");
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log("Server running on port " + port));
}

start();