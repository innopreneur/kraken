const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

// Connection URL

let password = encodeURIComponent(process.env.DB_PASSWORD);
const url = `mongodb://${process.env.DB_USER}:${password}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
console.log("URL - ", url);

// Use connect method to connect to the server
async function connect() {
  try {
    let client = await MongoClient.connect(url, { useUnifiedTopology: true });
    console.log("Connected successfully to server");
    return client;
  } catch (err) {
    console.error(err);
  }
}

async function insertHotelLinks(client, collection, city, links, callback) {
  // Get the documents collection
  let db = client.db(process.env.DB_NAME);
  const _collection = db.collection(collection);
  // Insert some documents
  try {
    await _collection.update(
      { city },
      { $push: { hotels: { $each: links } } },
      function(err, result) {
        console.log("Inserted into database");
        console.log(result);
        callback(result);
      }
    );
  } catch (err) {
    console.error(err);
  }
}

async function insertHotelDetails(client, collection, data) {
  // Get the documents collection
  let db = client.db(process.env.DB_NAME);
  const _collection = db.collection(collection);
  // Insert some documents
  try {
    let result = await _collection.insertOne(data);
    console.log("Inserted - ", result.insertedId);
    console.log("----------------------");
    return result;
  } catch (err) {
    console.error(err);
  }
}

async function find(client, collection, query) {
  // Get the documents collection
  let db = client.db(process.env.DB_NAME);
  const _collection = db.collection(collection);
  let result = await _collection.findOne(query);
  console.log(result);
  return result;
}

module.exports = { connect, insertHotelLinks, insertHotelDetails, find };
