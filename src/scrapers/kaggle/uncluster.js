const puppeteer = require("puppeteer");
const { getLinksFromHomepage } = require('./homepage')
const { getDetails } = require('./detailspage');
const { login } = require("./login");

(async function () {
    const browser = await puppeteer.launch({ headless: true });
    const page = (await browser.pages())[0];
    //login
    await login(page);
    //get links to data pages
    let links = await getLinksFromHomepage(page);
    //go to details page
    await page.goto(links[0], { waitUntil: 'networkidle2' });
    //get details and download
    await getDetails(page);
})();
