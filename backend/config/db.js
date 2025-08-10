require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

async function connectToDatabase(url, dbName, collectionName) {
  const client = new MongoClient(url);
  await client.connect();
  console.log("Connected successfully to MongoDB server");
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  return { db, collection };
}

module.exports = {
  connectToDatabase,

  ObjectId,
};
