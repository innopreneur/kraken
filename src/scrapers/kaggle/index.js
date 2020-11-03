const { Cluster } = require("puppeteer-cluster");
const puppeteer = require("puppeteer");
const path = require("path");
const { downloadFile } = require("../utils/downloader");
const { getLinksFromHomepage } = require("./homepage");
const { getDetails } = require("./detailspage");
const { login } = require("./login");

async function start(cluster) {
  //let isLoggedIn = true;

  // Define a task (in this case: screenshot of page)
  await cluster.task(async ({ page, data: url }) => {
    //let unexpected = "Kaggle: Your Home for Data Science";
    /*if (!isLoggedIn) {
            console.log("Not logged in. Logging in....")
            await login(page);
            isLoggedIn = true;
        }

        let title = await downloadData(page, url);

        if (title == unexpected) {
            await login(page);
            await downloadData(page, url);
        }*/

    console.log("----------------------------<=<=<=");
    //let listOfUrls = await cluster.queue(process.env.URL, getLinksFromHomepage)
    let listOfUrls = await getLinksFromHomepage(page, url);
    console.log(listOfUrls);
    await login(page);
    await Promise.all(listOfUrls.map(url => cluster.queue(url, downloadData)));
  });

  await cluster.queue(process.env.URL);
  // Shutdown after everything is done
}

async function isLoggedIn(title) {
  let unexpected = "Kaggle: Your Home for Data Science";

  if (title != unexpected) {
    return true;
  }
  return false;
}

async function downloadData({ page, data: url }) {
  await page.goto(url, { waitUntil: "networkidle2" });
  let title = await page.title();

  if (!isLoggedIn(title)) {
    await login(page);
  }

  // enable request interception
  await page.setRequestInterception(true);

  await getDetails(page);

  //clcik on download button
  /* page.click("a.button__anchor-wrapper");
 
     const xRequest = await new Promise(resolve => {
         page.on('request', interceptedRequest => {
             console.log(interceptedRequest.resourceType())
             console.log("??????????????????")
             interceptedRequest.abort();     //stop intercepting requests
             resolve(interceptedRequest);
         });
     });
 
     const options = {
         encoding: null,
         method: xRequest._method,
         uri: xRequest._url,
         body: xRequest._postData,
         headers: xRequest._headers
     }
 

    const cookies = await page.cookies();
    options.headers.Cookie = cookies.map(ck => ck.name + '=' + ck.value).join(';');

    let destination = path.resolve(__dirname, "..", "..", "data", title.replace(/\s/g, "-"))
    downloadFile(options, destination); */

  return await page.title();
}

module.exports = { start };
