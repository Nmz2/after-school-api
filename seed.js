// Run this once with: node seed.js
// It empties the lessons collection and puts the 10 lessons in again.
require("dotenv").config();
const { MongoClient } = require("mongodb");

const lessons = [
  { subject: "Math", location: "London", price: 100, spaces: 5, tutor: "Mr Patel", description: "Numbers, algebra and problem solving.", image: "maths.png", alt: "Maths symbols" },
  { subject: "Art", location: "London", price: 80, spaces: 5, tutor: "Ms Rossi", description: "Draw, paint and share your ideas.", image: "art.png", alt: "Paint palette" },
  { subject: "Computer Science", location: "Mauritius", price: 120, spaces: 5, tutor: "Mr Dubois", description: "Learn to solve problems with code.", image: "cs.png", alt: "Laptop with code" },
  { subject: "Music", location: "Dubai", price: 90, spaces: 5, tutor: "Ms Haddad", description: "Train your ear. Play and read music.", image: "music.png", alt: "Guitar and notes" },
  { subject: "English", location: "Mauritius", price: 70, spaces: 5, tutor: "Ms Laurent", description: "Read well. Write clearly. Speak with confidence.", image: "english.png", alt: "Stack of books" },
  { subject: "Physics", location: "Dubai", price: 110, spaces: 5, tutor: "Dr Khan", description: "See how forces, light and energy work.", image: "physics.png", alt: "Planet orbit diagram" },
  { subject: "Biology", location: "Mauritius", price: 110, spaces: 5, tutor: "Ms Naidoo", description: "Learn about cells, the body and living things.", image: "biology.png", alt: "Cell under a microscope" },
  { subject: "French", location: "Mauritius", price: 85, spaces: 5, tutor: "Mme Lefevre", description: "Speak, read and write in French.", image: "french.svg", alt: "French flag and a speech bubble saying Bonjour" },
  { subject: "Cybersecurity", location: "London", price: 130, spaces: 5, tutor: "Mr Osei", description: "Learn how to keep data and devices safe.", image: "cybersecurity.svg", alt: "Shield with a padlock" },
  { subject: "Chess", location: "Dubai", price: 60, spaces: 5, tutor: "Mr Petrov", description: "Plan ahead. Think before you move.", image: "chess.svg", alt: "Chess pawn and rook on a board" }
];

async function seed() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const collection = client.db("afterschool").collection("lessons");

  await collection.deleteMany({});            // remove the old lessons
  const result = await collection.insertMany(lessons);
  console.log("Lessons added:", result.insertedCount);

  await client.close();
}

seed();
