const { downloadFile } = require('../utils/downloader');
const path = require('path');

async function getDetails(page) {
    page.setDefaultNavigationTimeout(1000 * 60 * 3)
    //title
    let title = await page.$eval('h1.dataset-header-v2__title', node => node.innerText);
    //subtitle
    let subTitle = await page.$eval('h2.dataset-header-v2__subtitle', node => node.innerText);
    // dataOwner
    let dataOwner = await page.$eval('a.dataset-header-v2__owner-name', node => node.innerText);
    // description
    let description = await page.$eval('div.markdown-converter__text--rendered', node => node.innerHTML);
    // download url
    let downloadUrl = "https://kaggle.com" + await page.$eval('a.button__anchor-wrapper', node => node.getAttribute('href'));
    // total views
    let totalViewsStr = await page.$eval('ul.horizontal-list > li:nth-child(1)', node => node.innerText);
    let totalViews = totalViewsStr.replace(/\D+/g, "");
    // total downloads
    let downloadsStr = await page.$eval('ul.horizontal-list > li:nth-child(2)', node => node.innerText);
    let downloads = downloadsStr.replace(/\D+/g, "");
    // total votes
    let totalVotes = await page.$eval('span.vote-button__vote-count', node => node.innerText);
    // size 
    // filetype
    // filename
    // filemetadata
    // total files
    // tags
    // usability
    // license
    console.log('=>=>=>--------------------------------')
    console.log(`
    title: ${title},
    descriptio: ${description.substring(0, 30)},
    url: ${downloadUrl},
    subTitle: ${subTitle},
    owner: ${dataOwner},
    views: ${totalViews},
    downloads: ${downloads},
    votes: ${totalVotes}
    `)

    //click download button
    await Promise.all([
        page.click("a.button__anchor-wrapper"),
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);
    //let destination = path.resolve(__dirname, "..", "..", "data", title.replace(/\s/g, "-"))
    //downloadFile(downloadUrl, destination);
}

module.exports = { getDetails }