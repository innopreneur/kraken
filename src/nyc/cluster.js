const { Cluster } = require('puppeteer-cluster');
const puppeteer = require("puppeteer");
const path = require('path');
const { getCategoriesFromDataTab } = require('./homepage')
const { getDetailedData, getDetailsLinkFromPage } = require('./categorypage');

async function runParallel() {

    // Create a cluster
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: parseInt(process.env.CONCURRENCY),
        puppeteerOptions: { headless: true }
    });

    try {
        let catUrls = await cluster.execute(process.env.URL, getCategoriesFromDataTab);
        console.log(catUrls)
        let summaries = await Promise.all(catUrls.map(url => cluster.execute(url, getDetailsLinkFromPage)))
        let details = await Promise.all(summaries.map(summary => cluster.execute(summary, getDetailedData)))
        console.log("######### THE END ##########")
    } catch (err) {
        console.log(err)
    }
    // Shutdown after everything is done
    await cluster.idle();
    await cluster.close();
}




module.exports = { runParallel }

