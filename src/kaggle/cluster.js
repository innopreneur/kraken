const { Cluster } = require('puppeteer-cluster');
const { getLinksFromHomepage } = require('./homepage')
const { getDetails } = require('./detailspage');
const { login } = require("./login");


async function runParallel() {
    let isLoggedIn = false;

    // Create a cluster with 2 workers
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: parseInt(process.env.CONCURRENCY),
    });

    // Define a task (in this case: screenshot of page)
    await cluster.task(async ({ page, data: url }) => {
        if (!isLoggedIn) {
            console.log("Not logged in. Logging in....")
            await login(page);
            isLoggedIn = true;
        }

        await page.goto(url);
        await getDetails(page);

    });

    let listOfUrls = await getLinksFromHomepage();
    await Promise.all(listOfUrls.map(url => cluster.queue(url)))

    // Shutdown after everything is done
    await cluster.idle();
    await cluster.close();
}

module.exports = { runParallel }

