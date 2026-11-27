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

app.get("/", (req, res) => {
  res.send("After School API is running. Try /lessons");
});

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

// Challenge: how many spaces of one lesson have been bought
app.get("/enrolment/:lessonid", async (req, res) => {
  try {
    const lessonId = req.params.lessonid;
    if (!ObjectId.isValid(lessonId)) {
      return res.status(400).json({ error: "Not a valid lesson id" });
    }

    // Find every order that has this lesson in its lessons array
    const orders = await ordersCollection
      .find({ "lessons.lessonID": lessonId })
      .toArray();

    // Add up the spaces bought for this lesson
    let enrolment = 0;
    orders.forEach(order => {
      order.lessons.forEach(item => {
        if (item.lessonID === lessonId) {
          enrolment += item.spaces;
        }
      });
    });

    res.json({ lessonId: lessonId, enrolment: enrolment });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Could not count enrolment" });
  }
});

// Challenge: search lessons on the server
// Example: /search?q=lon
app.get("/search", async (req, res) => {
  try {
    const term = (req.query.q || "").toLowerCase().trim();
    const lessons = await lessonsCollection.find({}).toArray();

    if (term === "") {
      return res.json(lessons);   // empty search: return everything
    }

    const results = lessons.filter(l =>
      l.subject.toLowerCase().includes(term) ||
      l.location.toLowerCase().includes(term) ||
      String(l.price).includes(term) ||
      String(l.spaces).includes(term)
    );
    res.json(results);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Could not search lessons" });
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