const httpProxy = require("http-proxy");

async function createProxyServer(WSEndPoint) {
  const host = "0.0.0.0";
  const port = 8086;

  await httpProxy
    .createServer({
      target: WSEndPoint, // where we are connecting
      ws: true,
      localAddress: host, // where to bind the proxy
    })
    .listen(port); // which port the proxy should listen to
  console.log(`ws://${host}:${port}`); // ie: ws://123.123.123.123:8080
}


module.exports = {
    createProxyServer
}
