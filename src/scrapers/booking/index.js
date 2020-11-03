const {
  connect,
  insertHotelLinks,
  insertHotelDetails,
  find
} = require("../../db");
const { getHotelLinksForCity, getPaginationDetails } = require("./homepage");
const { getDetailsFromHotel } = require("./hotelpage");
const { getReviewsForHotel } = require("./reviewpage");
const { sendMessage } = require("../../utils/notifier");
const fs = require("fs");
const path = require("path");

async function start(cluster, collection, city, baseUrl) {
  try {
    let client = await connect();
    /*
    // Step 1. For a given city, find out total pagination
    let lastOffset = await cluster.execute(
      { baseUrl, city },
      getPaginationDetails
    );
    console.log("Max offset is - ", lastOffset);
    // Step 2. For each page, get all hotel links and save in db
    let offset = 0,
      rows = 25;
    while (offset <= lastOffset) {
      //get links
      let links = await cluster.execute(
        { baseUrl, offset, city },
        getHotelLinksForCity
      );
      // save links to db
      console.log(`Total Hotels in ${city} = ${links.length}`);
      await insertHotelLinks(client, collection, city, links, result =>
        console.log(result)
      );
      offset += rows;
    }
    */
    // Step 3. For each link, get hotel details and save in db
    // Step 4. At the end of task, send messenger notification

    let results = await find(client, collection, { city });

    let { hotels } = results;

    const saveHotelDetails = async ({ page, data }) => {
      let details = await getDetailsFromHotel({ page, data });
      if (details) {
        await insertHotelDetails(client, "hotelDetails", details);
      }
    };

    hotels.map(hotel => cluster.queue(hotel, saveHotelDetails));

    //await cluster.idle();
    //send message on messenger
    /*await sendMessage(
      `Job completed for city ${city} and collection ${collection} !!
       Feed me new Job!!`
    );*/
    //await cluster.close();
    console.log("######### THE END ##########");
  } catch (err) {
    console.log(err);
  }
}

module.exports = { start };
