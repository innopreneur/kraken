const cheerio = require("cheerio");

function loadHtml(body) {
  const $ = cheerio.load(body);
  return $;
}

function extractInnerText($, selector) {
  console.log($);
  return $.find(selector).text();
}

function extractSiblingsInnerText($, selector) {
  const sibText = [];
  //extract first element text
  sibText[0] = extractInnerText($, selector);
  //extract next elements text
  let siblings = $.siblings(selector);
  siblings.each(function(i, elem) {
    sibText[i + 1] = $(this).text();
  });
  return sibText;
}

module.exports = { extractInnerText, extractSiblingsInnerText, loadHtml };
