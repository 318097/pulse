const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = (_, argv = {}) => {
  const mode = argv.mode || "development";
  const isProd = mode === "production";

  return {
    mode,
    entry: {
      app: "./src/index.jsx",
      background: "./src/background.js",
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
      assetModuleFilename: "assets/[name][ext]",
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                ["@babel/preset-react", { runtime: "automatic" }],
              ],
            },
          },
        },
        {
          test: /\.css$/i,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: {
                modules: {
                  auto: /\.module\.css$/i,
                },
              },
            },
            "postcss-loader",
          ],
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/i,
          type: "asset/resource",
        },
      ],
    },
    resolve: {
      extensions: [".js", ".jsx"],
    },
    devtool: isProd ? false : "source-map",
    plugins: [
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(mode),
        "process.env.API_ENV": JSON.stringify(process.env.API_ENV || mode),
      }),
      new CopyPlugin({
        patterns: [
          { from: "index.html", to: "index.html" },
          { from: "manifest.json", to: "manifest.json" },
          { from: "images", to: "images" },
        ],
      }),
    ],
    performance: {
      hints: isProd ? "warning" : false,
    },
  };
};
