require("dotenv").config();
const { MongoClient } = require("mongodb");

async function test() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const count = await client.db("afterschool").collection("lessons").countDocuments();
  console.log("Lessons in the database:", count);
  await client.close();
}

test();