const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://testapi.foodworldshoponline.com/",
      changeOrigin: true,
      pathRewrite: { "^/api": "/api" },
    })
  );
};

// const express = require("express");
// const { createProxyMiddleware } = require("http-proxy-middleware");

// const app = express();

// app.use(
//   "/api",
//   createProxyMiddleware({
//     target: "http://testapi.foodworldshoponline.com/",
//     changeOrigin: true,
//     pathRewrite: { "^/api": "/api" },
//   })
// );

// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Proxy server running on http://localhost:${PORT}`);
// });