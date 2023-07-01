const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.connect({
    browserWSEndpoint:  'ws://0.0.0.0:8080',
  });
  const page = await browser.newPage();
  await page.goto("http://google.com");
  await page.screenshot({ path: "google.png" });
  await browser.close();
})();
