const puppeteer = require("puppeteer");


async function getLinksFromHomepage() {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = (await browser.pages())[0];
        await page.goto(process.env.URL, { waitUntil: 'networkidle2' });
        let totalCount = await getTotalResultsCount(page);
        console.log(totalCount);
        await scrollToEnd(page);
        let links = await getAllLinks(page);
        console.log(links)
        //go through each link and get details
        await browser.close();
        return links;
    } catch (err) {
        console.log(err);
    }
}


async function getTotalResultsCount(page) {
    let resultStr = await page.$eval('input.MuiInputBase-input.MuiOutlinedInput-input.input.MuiInputBase-inputAdornedStart.MuiOutlinedInput-inputAdornedStart.MuiInputBase-inputAdornedEnd.MuiOutlinedInput-inputAdornedEnd', node => node.getAttribute('placeholder'));
    return resultStr.replace(/\D+/g, "");
}

async function getAllLinks(page) {
    console.log("getting links")
    let selector = '/html/body/main/div/div[2]/div/div/div/div[2]/div/div[1]/div/ul/li';
    //get all li elements
    const listHandles = await page.$x(selector)
    console.log(listHandles.length)
    //remove last li element
    listHandles.splice(listHandles.length - 1, 1);
    //retrieve urls from li element
    let links = await Promise.all(listHandles.map(async (handle, i) => {
        let link = await handle.$eval('a', node => node.getAttribute('href'))
        return `https://kaggle.com` + link;
    }))
    return links;

}

async function scrollToEnd(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(async () => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 400);
        });
    });
}

module.exports = { getLinksFromHomepage }