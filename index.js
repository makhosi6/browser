const puppeteer = require("puppeteer");
let request = require("request");

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
      wsEndpoint: browser.wsEndpoint(),
      version: await browser.version(),
      userAgent: await browser.userAgent(),
    },
  });
  ///
  await broadcastEndpoint(browser.wsEndpoint());
})();

async function broadcastEndpoint(wsEndpoint) {
  console.log({ WS: wsEndpoint });
  let options = {
    method: "POST",
    url: "http://192.168.0.134:3033/state/records",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: "browser_endpoint",
      wsEndpoint: browser.wsEndpoint(),
      version: await browser.version(),
      userAgent: await browser.userAgent(),
    }),
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });
}

