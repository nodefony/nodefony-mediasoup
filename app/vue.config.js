// vue.config.js
const path = require('path');
const package = require(path.resolve("package.json"));
const packageVue = require(path.resolve("node_modules","vue","package.json"));
const outputDir = path.resolve("Resources", "public");
const indexPath = path.resolve("Resources", "views", 'index.html.twig');
const publicPath = "/app";
const template = path.resolve('public', 'index.html');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const title = package.name;
const packageVuetify = require(path.resolve("node_modules", "vuetify", "package.json"));

process.env.VUE_APP_VERSION = package.version;
process.env.VUE_APP_VUE_VERSION = packageVue.version;
process.env.VUE_APP_VUETIFY_VERSION = packageVuetify.version;
process.env.VUE_APP_DEBUG = process.env.NODE_DEBUG;
process.env.VUE_APP_NODE_ENV = process.env.NODE_ENV;
process.env.VUE_APP_DOMAIN = kernel.domain;
process.env.VUE_APP_HTTP_PORT = kernel.httpPort;
process.env.VUE_APP_HTTPS_PORT = kernel.httpsPort;


module.exports = {
  lintOnSave: false,
  publicPath: publicPath,
  outputDir: outputDir,
  indexPath: indexPath,
  assetsDir: "assets",

  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = title;
        args[0].template = template;
        return args;
      });
  },

  configureWebpack: {
    devtool: process.env.NODE_ENV === "development" ? "source-map" : "",
    output:{
      hotUpdateChunkFilename: 'hot/hot-update.js',
      hotUpdateMainFilename: 'hot/hot-update.json'
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [`${outputDir}/hot/*.hot-update.*`],
        dry: false,
        verbose: false,
        initialClean: false,
        cleanStaleWebpackAssets:true,
        protectWebpackAssets:true,
        cleanAfterEveryBuildPatterns:[],
        dangerouslyAllowCleanPatternsOutsideProject: true
      })
    ]
  },

  transpileDependencies: [
    "vuetify"
  ],

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  }
};
