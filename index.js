const puppeteer = require("puppeteer");
//
(async function () {
  const browser = await puppeteer.launch({
    args: [
      "--ignore-certificate-errors",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-setuid-sandbox",
      "--window-size=1920,1080",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
    ],
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
    defaultViewport: null,
  });

  console.log({
    "Browser Info =>": {
      date: new Date(),
      wsEndpoint: await browser.wsEndpoint(),
      version: await browser.version(),
      userAgent: await browser.userAgent(),
    },
  });
  ///
  await broadcastEndpoint({
    id: "browser_endpoint",
    wsEndpoint: browser.wsEndpoint(),
    version: await browser.version(),
    userAgent: await browser.userAgent(),
  });
})();

async function broadcastEndpoint(browserInfo) {
  let data = JSON.stringify(browserInfo);

  ///

  let xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      console.log(this.responseText);
    }
  });

  xhr.open("POST", "http://192.168.0.134:3033/state/records");
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.send(data);
}
