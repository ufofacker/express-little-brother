const path = require("path");
function _resolve(dir) {
  return path.join(__dirname, dir);
}
module.exports = {
  publicPath: "./",
  lintOnSave: false,
  outputDir: "dist",
  assetsDir: "static",
  productionSourceMap: false,
  devServer: {
    port: 8090,
    open: true,
    overlay: {
      warnings: true,
      errors: true,
    },
  },
  configureWebpack: {
    devtool:
      process.env.NODE_ENV === "development"
        ? "source-map"
        : "cheap-source-map",
    resolve: {
      alias: {
        "@": _resolve("src"),
      },
    },
  },
};
