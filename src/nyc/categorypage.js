const mime = require("mime-types")
const puppeteer = require("puppeteer");

async function getDetailsLinkFromPage({ page, data: url }) {
    await page.goto(url, { waitUntil: 'domcontentloaded' })

    //get description
    let divs = await page.$$("div.browse2-result")
    let results = await Promise.all(divs.map(async div => {
        let details = {};
        //get title
        details.title = await div.$eval('a.browse2-result-name-link', node => node.innerText)
        //get description
        details.description = await div.$eval('div.browse2-result-description.collapsible-content', node => node.innerText)
        //get tags
        details.tags = await div.$$eval('div.browse2-result-topics a.browse2-result-topic span', spans => spans.map(span => span.innerText))
        details.tags.push("NYC")
        //links
        details.link = await div.$eval('a.browse2-result-name-link', node => node.getAttribute('href'))

        console.log(details)
        console.log("----------------  -----------------")

        return details
    }))

    console.log(results)
    return results
}

async function getDetailedData({ page, data: details }) {

    await page.goto(details.link, { waitUntil: 'domcontentloaded' })

    if (await page.$("div.metadata-table-wrapper")) {
        // date created if exists
        let created = "#app > div > div.container.landing-page-container > div.metadata-table-wrapper > section > div.section-content > dl > div:nth-child(1) > div > div:nth-child(3) > div > dd"
        if (await page.$(created))
            details.createdOn = await page.$eval(created, div => div.innerText)


        // date updated, if exists
        let updated = 'div.metadata-table-wrapper .metadata-row.middle.metadata-flex.metadata-detail-groups  > div:nth-child(1) dd'
        if (await page.$(updated))
            details.lastUpdatedOn = await page.$eval(updated, div => div.innerText)
    }

    if (await page.$('div[aria-label="Export"]')) {
        //click "Export" button
        await page.click('div[aria-label="Export"]')
        //copy all links + datatype
        if (await page.$("#export-flannel")) {
            //get all links
            details.files = await page.$$eval('#export-flannel > section a', links => links.map(link => {
                let uri = link.getAttribute("href")
                return {
                    url: "https://data.cityofnewyork.us" + uri,
                    fileType: mime.lookup((uri.split('?'))[0])
                }
            }))
        }
    } else if (await page.$('a.download')) {
        details.files = await page.$eval('a.download', link => {
            let uri = link.getAttribute("href")
            return {
                url: "https://data.cityofnewyork.us" + uri,
                fileType: mime.lookup((uri.split('?'))[0])
            }
        })
    }

    //data provider
    if (await page.$('.entry-meta.views .update-content .date'))
        details.author = await page.$eval('.entry-meta.views .update-content .date', node => node.innerText.trim())

    //data owner = NYC OpenData
    details.copyright = "NYC OpenData"

    console.log(details)
    console.log("<<<<<<<<<<<<  >>>>>>>>>>>>>>")

    return details
}

module.exports = { getDetailsLinkFromPage, getDetailedData }