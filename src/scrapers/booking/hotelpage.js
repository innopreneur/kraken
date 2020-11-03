const mime = require("mime-types");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const {
  loadHtml,
  extractInnerText,
  extractSiblingsInnerText
} = require("../../utils/pathfinder");

let selectors = {
  hotelName: "#hp_hotel_name",
  hotelAddress: "#showMap2 > span.hp_address_subtitle",
  hotelCoordinates: "#hotel_address",
  hotelStars: "span.bui-rating",
  noOfPhotos:
    "#hotel_main_content > div.gallery-side-reviews-wrapper > div.clearfix.bh-photo-grid.fix-score-hover-opacity > div.bh-photo-grid-thumbs-wrapper > div > div:nth-child(5) > a > span > span > span",
  score:
    "div.hp_review_score_entry > a > div.bui-review-score > div.bui-review-score__badge",
  totalReviews:
    "div.hp_review_score_entry > a > div.bui-review-score > div.bui-review-score__content > div.bui-review-score__text",
  bestFeatures:
    "#hotel_main_content > div.hp_hotel_description_hightlights_wrapper > div.property_hightlights_wrapper > div.property-highlights.ph-icon-fill-color > div.ph-section",
  facilities:
    "div.hotel_description_wrapper_exp > div.hp_desc_important_facilities > div.important_facility",
  listingDate: "p.qna_property-welcoming-guests",
  acceptedCards:
    "#hotelPoliciesInc > div.description.hp_bp_payment_method > p.payment_methods_overall > img",
  checkIn: "#checkin_policy > p:nth-child(2) >span",
  checkOut: "#checkout_policy > p:nth-child(2) >span",
  location:
    "#blockdisplay1 > div:nth-child(2) > div.property_page_surroundings_block > div.hp_location_block__content_container > div",
  rooms: "table.roomstable > tbody > tr"
};

async function getDetailsFromHotel({ page, data: url }) {
  try {
    await page.setDefaultTimeout(15000);
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.setViewport({ width: 1440, height: 900 });
    await page.setRequestInterception(true);

    page.on("request", req => {
      if (
        req.resourceType() == "stylesheet" ||
        req.resourceType() == "font" ||
        req.resourceType() == "image" ||
        req.resourceType() == "script"
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    let details = {};

    //set url
    details.url = url;

    //get name
    if (await waitOrTimeout(page, selectors.hotelName)) {
      details.name = await page.$eval(
        selectors.hotelName,
        node => node.innerText
      );
      console.log("Name - ", details.name);
    }

    //get address
    if (await waitOrTimeout(page, selectors.hotelAddress)) {
      details.address = await page.$eval(
        selectors.hotelAddress,
        node => node.innerText
      );
      console.log("Address - ", details.address);
    }

    //get stars
    if (await waitOrTimeout(page, selectors.hotelStars)) {
      details.stars = await page.$eval(selectors.hotelStars, node =>
        node.getAttribute("aria-label")
      );
      console.log("Stars - ", details.stars);
    }

    //get coordinates
    if (await waitOrTimeout(page, selectors.hotelCoordinates)) {
      details.coordinates = await page.$eval(selectors.hotelCoordinates, node =>
        node.getAttribute("data-atlas-latlng")
      );
      console.log("Coordinates - ", details.coordinates);
    }

    //get photos count
    if (await waitOrTimeout(page, selectors.noOfPhotos)) {
      let photosText = await page.$eval(
        selectors.noOfPhotos,
        node => node.innerText
      );
      console.log("Photos text - " + photosText);
      details.noOfPhotos = parseInt(photosText.match(/\d/g));
      console.log("Photos Count - ", details.noOfPhotos);
    }

    //get score
    if (await waitOrTimeout(page, selectors.score)) {
      let scoreText = await page.$eval(selectors.score, node => node.innerText);
      details.score = parseFloat(scoreText);
      console.log("Score - ", details.score);
    }

    // get reviews count
    if (await waitOrTimeout(page, selectors.totalReviews)) {
      let reviewStr = await page.$eval(
        selectors.totalReviews,
        node => node.innerText
      );
      details.totalReviews = parseInt(reviewStr.match(/\d/g).join(""));
      console.log("Total Reviews - ", details.totalReviews);
    }

    // get best features
    if (await waitOrTimeout(page, selectors.bestFeatures)) {
      details.bestFeatures = await evaluateChildrenText(
        page,
        selectors.bestFeatures
      );

      console.log("Best Features - ", details.bestFeatures);
    }

    // get facilities
    if (await waitOrTimeout(page, selectors.facilities)) {
      /*details.facilities = await page.$$eval(selectors.facilities, node =>
        node.map(option => option.innerText.trim())
      );*/
      details.facilities = await evaluateChildrenText(
        page,
        selectors.facilities
      );
      console.log("Facilities - ", details.facilities);
    }

    // get listing date
    if (await waitOrTimeout(page, selectors.listingDate)) {
      let listingDate = await page.$eval(
        selectors.listingDate,
        node =>
          node.innerText.match(
            /Welcoming Booking.com guests since (.*?)\.*$/i
          )[1]
      );
      details.listingDate = new Date(listingDate).toISOString().split("T")[0];
    }

    // get cards accepted
    if (await waitOrTimeout(page, selectors.acceptedCards)) {
      details.acceptedCards = await page.$$eval(selectors.acceptedCards, node =>
        node.map(option => option.getAttribute("title"))
      );
    }

    //get check-in time
    if (await waitOrTimeout(page, selectors.checkIn)) {
      details.checkIn = await page.$eval(selectors.checkIn, node =>
        node.getAttribute("data-from").replace(":", "")
      );
    }

    //get check-out time
    if (await waitOrTimeout(page, selectors.checkOut)) {
      details.checkOut = await page.$eval(selectors.checkOut, node =>
        node.getAttribute("data-until").replace(":", "")
      );
    }

    //get location details
    if (await waitOrTimeout(page, selectors.location)) {
      details.location = {};
      let locations = await page.$$(selectors.location);
      await Promise.all(
        locations.map(async loc => {
          let title = await loc.$eval("div.bui-title", node => node.innerText);
          console.log(title);
          //get details
          let locDetails = await loc.$$eval("ul > li", node =>
            node.map(item => {
              let arr = item.innerText.split("\n");
              return { place: arr[0], distance: arr[1] };
            })
          );
          details.location[title.trim()] = locDetails;
        })
      );
    }

    //get rooms details
    if (await waitOrTimeout(page, selectors.rooms)) {
      details.rooms = [];
      let allRooms = await page.$$(selectors.rooms);
      //filter out even numbered rooms
      let rooms = allRooms.filter((r, i) => i % 2 === 0);
      let roomsArr = await Promise.all(
        rooms.map(async (room, i) => {
          let capacity = await room.$eval(
            "td.occ_no_dates span.bui-u-sr-only",
            node => node.innerText.trim()
          );

          let type = await room.$eval("td.roomType a", node =>
            node.innerText.trim()
          );

          return { type, capacity };
        })
      );

      details.rooms = roomsArr.slice();
    }

    console.log(details);
    return details;
  } catch (err) {
    console.log(err);
    return null;
  }
}

function getHotelDetails(html) {
  //load html into
  let $ = loadHtml(html);

  let photosText = extractInnerText($, selectors.noOfPhotos);
  console.log(photosText);

  let facilities = extractSiblingsInnerText($, selectors.facilities);
  console.log(facilities);
  console.log("===================");
}

async function getHTMLcontent({ page, data: url }) {
  try {
    await page.setDefaultTimeout(120000);
    await page.goto(url, { waitUntil: "networkidle0" });
    let html = await page.$eval("body", e => e.outerHTML);
    console.log(url);
    getHotelDetails(html);
    return html;
  } catch (err) {
    console.log(err);
  }
}

async function waitOrTimeout(page, selector) {
  try {
    await page.waitForSelector(selector);
    return true;
  } catch (e) {
    if (e instanceof puppeteer.errors.TimeoutError) {
      console.error(e.message);
      return false;
    }
  }
}

async function evaluateChildrenSelectors(
  page,
  parentSelector,
  childSelector,
  property = "",
  propertyValue = ""
) {
  return await page.$$eval(parentSelector, nodes =>
    nodes.map(
      async node =>
        await node.$eval(childSelector, node => {
          if (property == "attribute") {
            return node.getAttribute(propertyValue).trim();
          } else {
            return node.innerText.trim();
          }
        })
    )
  );
}

async function evaluateChildrenText(page, parentSelector) {
  return await page.$$eval(parentSelector, nodes =>
    nodes.map(node => node.innerText.trim())
  );
}
module.exports = { getDetailsFromHotel, getHTMLcontent, getHotelDetails };
