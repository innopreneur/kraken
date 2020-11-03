require("dotenv").config();
const { Cluster } = require("puppeteer-cluster");

//FIXME - scroll and get links in scraper.js

// Create a cluster
async function getCluster() {
  if (!global.cluster) {
    return await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: 2,
      puppeteerOptions: {
        headless: true
      },
      retryLimit: 3,
      sameDomainDelay: 3000,
      skipDuplicateUrls: true,
      timeout: 150000,
      monitor: false,
      workerCreationDelay: 100
    });
  }
  throw new Error("Cluster is busy");
}

//start(getCluster());

module.exports = { getCluster };
