const path = require("path");

// The built bundle self-registers by calling window.defineBlock(...) at load time.
// Output name convention: <organization>.<widget>.js
module.exports = {
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "chriscelle.collage-media-builder.js",
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  devServer: {
    static: { directory: path.resolve(__dirname, "dist") },
    port: 9000,
    headers: { "Access-Control-Allow-Origin": "*" },
    hot: false,
    liveReload: true,
  },
};
