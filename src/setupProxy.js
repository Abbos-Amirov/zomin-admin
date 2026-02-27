const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  const target =
    process.env.REACT_APP_API_URL || "http://localhost:4009";
  app.use(
    "/uploads",
    createProxyMiddleware({
      target,
      changeOrigin: true,
      secure: false,
    })
  );
  app.use(
    "/admin",
    createProxyMiddleware({
      target,
      changeOrigin: true,
      cookieDomainRewrite: "localhost",
      secure: false,
      proxyTimeout: 60000,
      timeout: 60000,
      onError: (err, req, res) => {
        console.error("[Proxy /admin Error]", err.message);
      },
    })
  );
  app.use(
    "/member",
    createProxyMiddleware({
      target,
      changeOrigin: true,
      cookieDomainRewrite: "localhost",
      secure: false,
      proxyTimeout: 120000,
      timeout: 120000,
      onError: (err, req, res) => {
        console.error("[Proxy /member Error]", err.message);
      },
    })
  );
};
