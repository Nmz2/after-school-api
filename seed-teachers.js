// Run once with: node seed-teachers.js
// Creates the teachers collection and links each teacher to their lessons.
require("dotenv").config();
const { MongoClient } = require("mongodb");

const teachers = [
  { title: "Mr",  firstName: "Raj",    lastName: "Patel",   subjects: ["Math", "Physics"] },
  { title: "Ms",  firstName: "Sofia",  lastName: "Rossi",   subjects: ["Art", "Music"] },
  { title: "Mr",  firstName: "Luc",    lastName: "Dubois",  subjects: ["Computer Science", "Cybersecurity"] },
  { title: "Ms",  firstName: "Claire", lastName: "Laurent", subjects: ["English", "French"] },
  { title: "Ms",  firstName: "Priya",  lastName: "Naidoo",  subjects: ["Biology"] },
  { title: "Mr",  firstName: "Ivan",   lastName: "Petrov",  subjects: ["Chess"] }
];

async function seedTeachers() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db("afterschool");

  // 1. Read the lessons that are already in the database
  const lessons = await db.collection("lessons").find({}).toArray();

  // 2. For each teacher, find the _id of every lesson they teach
  const docs = teachers.map(t => {
    const taught = lessons.filter(l => t.subjects.includes(l.subject));
    return {
      title: t.title,
      firstName: t.firstName,
      lastName: t.lastName,
      lessonIDs: taught.map(l => l._id)
    };
  });

  // 3. Make the tutor name on each lesson match its teacher
  for (const t of teachers) {
    await db.collection("lessons").updateMany(
      { subject: { $in: t.subjects } },
      { $set: { tutor: t.title + " " + t.lastName } }
    );
  }

  // 4. Replace the teachers collection
  await db.collection("teachers").deleteMany({});
  const result = await db.collection("teachers").insertMany(docs);
  console.log("Teachers added:", result.insertedCount);

  await client.close();
}

seedTeachers();