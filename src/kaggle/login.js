const puppeteer = require("puppeteer");
let loginUrl = 'https://www.kaggle.com/account/login?phase=emailSignIn';


async function login(page) {
    //go to login page
    await page.goto(loginUrl, { waitUntil: 'networkidle2' });

    //enter email
    await page.type('input[name="email"]', process.env.KAGGLE_EMAIL);
    //enter password
    await page.type('input[name="password"]', process.env.KAGGLE_PASSWORD);
    //click signin button
    // wait for login successful
    await Promise.all([
        page.click("button[type=submit]"),
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);
}

module.exports = { login }