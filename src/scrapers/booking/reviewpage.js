let selectors = {
  reviews: "ul.review_list > li",
  reviewerName: "div.bui-avatar-block__text > span:nth-child(1)",
  reviewerCountry: "div.bui-avatar-block__text > span:nth-child(2)",
  score: "div.bui-review-score__badge",
  reviewedOn: "div.c-review-block__row > span.c-review-block__date",
  reviewTitle: "div > div:nth-child(3) > h3",
  reviewDescription: "div > div:nth-child(4) > div > div > p > span"
};

async function getReviewsForHotel({ page, data: url }) {
  try {
    await page.setDefaultTimeout(120000);
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.setViewport({ width: 1440, height: 900 });
    await page.setRequestInterception(true);

    page.on("request", req => {
      if (
        req.resourceType() == "stylesheet" ||
        req.resourceType() == "font" ||
        req.resourceType() == "image"
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    let details = {};
    //set url
    details.reviewUrl = url;
    details.reviews = [];
    //get details from each review
    await page.waitForSelector(selectors.reviews);
    let reviewList = await page.$$(selectors.reviews);
    let reviews = await Promise.all(reviewList.map(getDetailsForEachReview));
    details.reviews = reviews.slice();
    console.log(details);
    return details;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function getDetailsForEachReview(page) {
  let details = {};

  //get reviewer name
  details.reviewerName = await page.$eval(selectors.reviewerName, node =>
    node.innerText.trim()
  );

  //get reviewer country
  details.reviewerCountry = await page.$eval(selectors.reviewerCountry, node =>
    node.innerText.trim()
  );

  //get review score
  details.score = parseFloat(
    await page.$eval(selectors.score, node => node.innerText)
  );

  // get reviewedOn date
  details.reviewedOn = await page.$eval(selectors.reviewedOn, node =>
    node.innerText.split(":")[1].trim()
  );

  // get review title
  details.reviewTitle = await page.$eval(selectors.reviewTitle, node =>
    node.innerText.trim()
  );

  // get review description
  details.reviewDescription = await page.$eval(
    selectors.reviewDescription,
    node => node.innerText.trim()
  );

  console.log(details);
  return details;
}

async function startReviews(cluster, url) {
  let data = await cluster.execute(url, getReviewsForHotel);
  await cluster.idle();
  await cluster.close();
}
module.exports = { getReviewsForHotel, startReviews };
