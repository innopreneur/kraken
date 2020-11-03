const hotelLinkSelector =
  "#hotellist_inner > div > div.sr_item_content.sr_item_content_slider_wrapper > div.sr_property_block_main_row > div.sr_item_main_block > div.sr-hotel__title-wrap > h3 > a";
const lastPaginationSelector =
  "#search_results_table > div.bui-pagination.results-paging > nav > ul > li.bui-pagination__pages > ul > li:nth-child(10) > a > div.bui-u-inline";

/**
 * retrieves links of hotels for a give city
 */
async function getHotelLinksForCity({ page, data }) {
  try {
    let { baseUrl, offset, city } = data;
    await page.goto(
      `${baseUrl}/searchresults.en-gb.html?ss=${city}&rows=25&offset=${offset}`,
      {
        waitUntil: "domcontentloaded"
      }
    );

    //get hotels links
    let links = await page.$$eval(hotelLinkSelector, nodes =>
      nodes.map(node => node.getAttribute("href"))
    );

    let hotelLinks = await Promise.all(
      links.map(link => `${baseUrl}${link.match(/\/(.*?)\.html/i)[0]}`)
    );

    console.log(hotelLinks);

    //add to database
    return hotelLinks;
  } catch (err) {
    console.log(err);
  }
}

/**
 * get pagination details and offset of last page
 */
async function getPaginationDetails({ page, data }) {
  let { baseUrl, city } = data;
  await page.goto(`${baseUrl}/searchresults.en-gb.html?ss=${city}`, {
    waitUntil: "domcontentloaded"
  });

  //get final page offset in pagination
  await page.waitForSelector(lastPaginationSelector);
  let pageNo = await page.$eval(lastPaginationSelector, node => node.innerText);

  return parseInt(pageNo) * 25 - 25;
}

module.exports = { getHotelLinksForCity, getPaginationDetails };
