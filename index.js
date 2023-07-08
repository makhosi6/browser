const puppeteer = require("puppeteer");
const http = require("http");
const url = require("url");
/**
 * @type {puppeteer.Browser}
 */
let browser;

const PORT = 3400;
(async function () {
  browser = await puppeteer.launch({
    args: [
      "--ignore-certificate-errors",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-setuid-sandbox",
      "--window-size=1920,1080",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
    ],
    // headless: false,
    // userDataDir: `${process.cwd()}/usr_data`,
    defaultViewport: null,
    // userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
  });

  console.log({
    "Browser Info =>": {
      date: new Date(),
      wsEndpoint: browser.wsEndpoint(),
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


})();
/**
 * 
 */
async function connectOrRecover() {
  try {
    console.log("HEALTH CHECK", {
      pages: browser.pages.length,
      isConnected: browser.isConnected(),
      contexts: browser.browserContexts()
    });

    /// test connection
    /**
     * @type {puppeteer.Page}
     */
    let page = await browser.newPage();

    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 0.25,
    });
    return await page.goto("https://www.youtube.com");
    // await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36')

  } catch (error) {
    console.log(error);
    return null;
  }
}


const server = http
  .createServer(async function (request, response) {
    /**
    * @type {puppeteer.Page}
    */
    let page;
    try {
      const URL = url.parse(request.url, true);
      let pathName = URL.pathname;
      let query = URL.query?.q;

      console.log(JSON.stringify(url.parse(request.url, true), true));

      let c1 = request.url.includes("static");
      let c2 = pathName === "/";
      let c3 = request.method === "GET";


      if (!(c2 || c1)) {
        response.writeHead(404, { "Content-Type": "application/json" });
        response.end(
          JSON.stringify({
            status: "Not Found",
          })
        );
        return;
      }

      if (c3 && c1) {
        let filePath = path.resolve(
          __dirname,
          request.url.replace("/static/", "")
        );
        console.log({ filePath });
        let fileExists = fs.existsSync(filePath);
        if (fileExists) {
          response.setHeader("Content-Type", "image/png");
          fs.createReadStream(filePath).pipe(response);

          return;
        }
      }


      page = await connectOrRecover();

      console.log({ PAGE: Boolean(page) });

      await page.evaluate(() => {
        let input = document.querySelector('input[name="search_query"]');
        input.value = "";
      });

      await page.type('input[name="search_query"]', `${query} song`);
      await page.click("button#search-icon-legacy");


      // setUSerAgent
      // zoom out, so all elements can fit in the viewport
      // why? so that all elements can hydrate
      await page.mouse.wheel({ deltaY: -100 });

      // Wait for search results to load
      await page.waitForSelector("ytd-video-renderer");

      /**
       * - get video elements
       */
      const videoElements = await page.$$("#contents ytd-video-renderer") || await page.$$("ytd-video-renderer");
      let data = []
      console.log(await page.evaluate('navigator.userAgent'));
      console.log(await page.evaluate((_) => navigator.userAgent));
      /**
       * - get search results
       * - And then extract and print the search results
       */
      Array.from(videoElements).map(async (element) => {
        try {

          const adIndicator = await element.$(".ytd-badge-supported-renderer");

          const isAd = await page.evaluate((el) => {
            let bool =
              el?.innerText == "Ad" ||
              el?.innerText?.toLowerCase().includes("ad");
            return bool;
          }, adIndicator);


          /// Escape if it's an Ad
          if (isAd) return null;

          ///Scroll to viewport
          const boundingBox = await element.boundingBox();
          await page.mouse.move(
            boundingBox.x + boundingBox.width / 2,
            boundingBox.y + boundingBox.height / 2
          );


          //Then extract values
          const titleElement = await element.$("#video-title");
          const title = await page.evaluate((el) => el.innerText, titleElement);

          const descriptionElement = await element.$("#description-text");
          const description = await page.evaluate(
            (el) => el.innerText,
            descriptionElement
          );

          const channelElement = await element.$(".ytd-channel-name a");
          const channelName = await page.evaluate(
            (el) => el.innerText,
            channelElement
          );
          const channelUrl = await page.evaluate((el) => el.src, channelElement);
          const videoLengthElement =
            (await element.$(".ytd-thumbnail-overlay-time-status-renderer")) ||
            (await element.$("ytd-thumbnail-overlay-time-status-renderer"));
          const videoLength = await page.evaluate(
            (el) => el.innerText,
            videoLengthElement
          );

          const videoImageElement = await element.$("yt-image img");
          const videoImage = await page.evaluate(
            (img) => img.src,
            videoImageElement
          );

          data.push({
            title,
            description,
            channelName,
            channelUrl,
            videoLength: null,
            thumbnail: videoImage,
          });

          return {
            title,
            description,
            channelName,
            channelUrl,
            videoLength: null,
            thumbnail: videoImage,
          };
        } catch (error) {

          /// save a snapshot
          let path = `youtube-inner-${Math.floor(Math.random() * 12322)}.png`
          console.log({ path });
          await page.screenshot({ path: path });

          console.log(error);
          return null
        }


      });


      console.log("WE ARE DONE");
      ///
      await delay(700)

      console.log("AFTER FIRST DELAY");
      setTimeout(async () => {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(
          JSON.stringify({ query, data })
        );
      }, 700);
      ////   END  CODE THT GOES INSIDE THE CREATE SERVE CALLBACK
    } catch (error) {
      /// save a snapshot
      let path = `youtube-${Math.floor(Math.random() * 12322)}.png`
      console.log({ path });
      await page.screenshot({ path: path });

      ///
      console.log({ error });
      response.end(
        JSON.stringify({
          status: "Error",
        })
      );

    } finally {
      await page.close()
    }
  })
  .listen(PORT);

console.log(`Server running at http://0.0.0.0:${PORT}/`);

/*
 
                                                            
     //    / /                                              
    //___ / /  ___     //  ___      ___      __      ___    
   / ___   / //___) ) // //   ) ) //___) ) //  ) ) ((   ) ) 
  //    / / //       // //___/ / //       //        \ \     
 //    / / ((____   // //       ((____   //      //   ) )   
 
*/
/**
 *
 * @param {number} time
 * @returns
 */
function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}


/**
 * @description  Dump the current/active browser info
 * @param {object} browserInfo
 */
async function broadcastEndpoint(browserInfo) {
  try {
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
  } catch (error) {
    console.log(error);
  }
}
