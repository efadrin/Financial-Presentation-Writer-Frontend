/* eslint-disable */
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { getHttpsServerOptions } = require("office-addin-dev-certs");
const Dotenv = require("dotenv-webpack");

module.exports = async (env, options) => {
  const httpsOptions = await getHttpsServerOptions();
  const dev = options.mode === "development";

  return [
    {
      devtool: dev ? "source-map" : false,
      entry: {
        polyfill: ["core-js/stable", "regenerator-runtime/runtime"],
        main: ["./src/entry/index.tsx"],
      },
      output: {
        path: path.resolve(__dirname, "dist"),
        clean: true,
        filename: "[name].[contenthash].js",
        chunkFilename: "[name].[contenthash].js",
      },
      performance: {
        hints: dev ? false : "warning",
        maxEntrypointSize: 400000,
        maxAssetSize: 400000,
      },
      resolve: {
        extensions: [".ts", ".tsx", ".js", ".html", ".css"],
        alias: {
          "@": path.resolve(__dirname, "src"),
          "@entry": path.resolve(__dirname, "src/entry"),
          "@components": path.resolve(__dirname, "src/components"),
          "@services": path.resolve(__dirname, "src/services"),
          "@public": path.resolve(__dirname, "src/public"),
          "@utils": path.resolve(__dirname, "src/utils"),
          "@assets": path.resolve(__dirname, "src/assets"),
          "@features": path.resolve(__dirname, "src/features"),
          "@hooks": path.resolve(__dirname, "src/hooks"),
          "@common": path.resolve(__dirname, "src/components/common"),
        },
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader",
              options: {
                presets: [
                  "@babel/preset-env",
                  "@babel/preset-react",
                  "@babel/preset-typescript",
                ],
              },
            },
          },
          {
            test: /\.html$/,
            exclude: /node_modules/,
            use: "html-loader",
          },
          {
            test: /\.css$/,
            use: [MiniCssExtractPlugin.loader, "css-loader"],
          },
          {
            test: /\.(png|jpg|jpeg|gif|ico|lottie)$/,
            type: "asset/resource",
            generator: {
              filename: "assets/[name][ext][query]",
            },
          },
          {
            test: /\.svg$/,
            type: "asset/resource",
            generator: {
              filename: "assets/[name][ext][query]",
            },
          },
          {
            test: /\.json$/,
            use: "json-loader",
            type: "javascript/auto",
          },
        ],
      },
      plugins: [
        new Dotenv(),
        new MiniCssExtractPlugin({
          filename: "[name].[contenthash].css",
          chunkFilename: "[name].[contenthash].css",
        }),
        new HtmlWebpackPlugin({
          filename: "index.html",
          template: "./src/public/index.html",
          chunks: ["polyfill", "main"],
        }),
        new CopyWebpackPlugin({
          patterns: [
            {
              from: "assets/*",
              to: "assets/[name][ext][query]",
            },
            {
              from: dev ? "manifest_local.xml" : "manifest.xml",
              to: "manifest.xml",
              transform(content) {
                if (dev) {
                  const timestamp = Date.now();
                  return content
                    .toString()
                    .replace(
                      /https:\/\/localhost:3010/g,
                      `https://localhost:3010?v=${timestamp}`,
                    );
                }
                return content;
              },
            },
            {
              from: "web.config",
              to: "web.config",
            },
          ],
        }),
      ],
      optimization: {
        moduleIds: "deterministic",
        usedExports: true,
        concatenateModules: true,
        sideEffects: true,
        minimizer: [
          new TerserPlugin({
            parallel: true,
            terserOptions: {
              compress: {
                drop_console: !dev,
                drop_debugger: true,
                passes: 2,
              },
              mangle: true,
              output: {
                comments: false,
              },
            },
            extractComments: false,
          }),
          new CssMinimizerPlugin({
            parallel: true,
          }),
        ],
        splitChunks: {
          chunks: "all",
          maxInitialRequests: 25,
          minSize: 20000,
          cacheGroups: {
            reactCore: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: "vendor-react-core",
              priority: 50,
              reuseExistingChunk: true,
              enforce: true,
            },
            reactRouter: {
              test: /[\\/]node_modules[\\/](react-router|react-router-dom)[\\/]/,
              name: "vendor-react-router",
              priority: 45,
              reuseExistingChunk: true,
            },
            fluentuiComponents: {
              test: /[\\/]node_modules[\\/]@fluentui[\\/]react-components[\\/]/,
              name: "vendor-fluentui-components",
              priority: 35,
              reuseExistingChunk: true,
            },
            fluentuiIcons: {
              test: /[\\/]node_modules[\\/]@fluentui[\\/]react-icons[\\/]/,
              name: "vendor-fluentui-icons",
              priority: 31,
              reuseExistingChunk: true,
            },
            fluentuiOther: {
              test: /[\\/]node_modules[\\/]@fluentui[\\/]/,
              name: "vendor-fluentui-other",
              priority: 30,
              reuseExistingChunk: true,
            },
            redux: {
              test: /[\\/]node_modules[\\/](@reduxjs|react-redux|redux-persist)[\\/]/,
              name: "vendor-redux",
              priority: 25,
              reuseExistingChunk: true,
            },
            msal: {
              test: /[\\/]node_modules[\\/]@azure[\\/]/,
              name: "vendor-msal",
              priority: 22,
              reuseExistingChunk: true,
            },
            i18n: {
              test: /[\\/]node_modules[\\/](i18next|react-i18next)[\\/]/,
              name: "vendor-i18n",
              priority: 18,
              reuseExistingChunk: true,
            },
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
        runtimeChunk: "single",
      },
      devServer: {
        static: {
          directory: path.join(__dirname, "dist"),
          publicPath: "/",
        },
        historyApiFallback: true,
        compress: true,
        port: 3010,
        server: {
          type: "https",
          options: httpsOptions,
        },
      },
    },
  ];
};
