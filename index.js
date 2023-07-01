const puppeteer = require("puppeteer");
const http = require("http");
//
let page;
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
  // use node http package
  await broadcastEndpoint({
    id: "browser_endpoint",
    wsEndpoint: browser.wsEndpoint(),
    version: await browser.version(),
    userAgent: await browser.userAgent(),
  });

  /// test connection
  page = await browser.newPage();
  await page.goto("https://www.youtube.com");
  let path = `youtube-${new Date().getTime}.png`
  console.log({path});
  await page.screenshot({ path: path });
})();

async function broadcastEndpoint(browserInfo) {
  try {
  } catch (error) {}
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

  const req = http
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

http
  .createServer(function (request, response) {
    try {
      ////

      ///
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          data: "Hello World!",
        })
      );
    } catch (error) {
      console.log({ error });
      response.end(
        JSON.stringify({
          status: "Error",
        })
      );
    }
  })
  .listen(8081);

console.log("Server running at http://0.0.0.0:8081/");
