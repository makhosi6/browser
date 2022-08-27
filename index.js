const puppeteer = require('puppeteer');
const helpers = require('./store/helpers');
//
(async function() {
    const browser = await puppeteer.launch({
        args: helpers.argsArr,
        defaultViewport: null,
        headless: helpers.bool,
        // executablePath: helpers.exPath
    });
 
    console.log({
        "Browser Info =>": {
            wsEndpoint: browser.wsEndpoint(),
            version: await browser.version(),
            userAgent: await browser.userAgent(),
          
        }
    })
    // module.exports = browser.wsEndpoint();
})();