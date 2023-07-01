const puppeteer = require("puppeteer");
const https = require("http");
//
(async function () {
let  executablePath =
  process.platform === "linux" ? "/opt/google/chrome/google-chrome" : null
  console.log({executablePath});
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
  executablePath,
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
  // use node http package÷
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

  const options = {
    method: "PUT",
    hostname: "192.168.0.134",
    port: 3033,
    path: "/state/records/browser_endpoint",
    headers: {
      "Content-Type": "application/json",
    },
    maxRedirects: 20,
  };

  const req = https
    .request(options, (res) => {
      let data = "";

      console.log("Status Code:", res.statusCode);

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log("Body: ", JSON.parse(data));
      });
    })
    .on("error", (err) => {
      console.log("Error: ", err.message);
    });

  req.write(data);
  req.end();
}
