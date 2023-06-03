const puppeteer = require('puppeteer');
// const helpers = require('./store/helpers');
//
(async function() {
    const browser = await puppeteer.launch({
        args:  [
    "--ignore-certificate-errors",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-setuid-sandbox",
    "--window-size=1920,1080",
    "--disable-accelerated-2d-canvas",
    "--disable-gpu",
  ],
userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
       // defaultViewport: null,
       // headless: helpers.bool,
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
