
async function getCategoriesFromDataTab({ page, data: url }) {
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded' })

        let categoriesLinks = await page.$$eval("#sectionid-data-03 > div > div > div > ul > li > a", nodes => nodes.map(node => node.getAttribute("href")))
        //console.log(categoriesLinks)
        return categoriesLinks;

    } catch (err) {
        console.log(err);
    }
}


module.exports = { getCategoriesFromDataTab }


