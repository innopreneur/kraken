const { getCategoriesFromDataTab } = require("./homepage");
const { getDetailedData, getDetailsLinkFromPage } = require("./categorypage");

async function start(cluster) {
  //get agencies links
  try {
    let catUrls = await cluster.execute(
      process.env.URL,
      getCategoriesFromDataTab
    );
    console.log(catUrls);
    let summaries = await Promise.all(
      catUrls.map(url => cluster.execute(url, getDetailsLinkFromPage))
    );
    let details = await Promise.all(
      summaries.map(summary => cluster.execute(summary, getDetailedData))
    );
    console.log("######### THE END ##########");
  } catch (err) {
    console.log(err);
  }
}

module.exports = { start };
