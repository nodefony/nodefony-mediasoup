// vue.config.js
const path = require('path');
const Package = require(path.resolve("package.json"));
const packageVue = require(path.resolve("node_modules", "vue", "package.json"));
const outputDir = path.resolve("Resources", "public");
const indexPath = path.resolve("Resources", "views", 'index.html.twig');
const publicPath = "/app";
const template = path.resolve('public', 'index.html');
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');
const title = Package.name;

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


const packageVuetify = require(path.resolve("node_modules", "vuetify", "package.json"));
process.env.VUE_APP_VERSION = Package.version;
process.env.VUE_APP_VUE_VERSION = packageVue.version;
process.env.VUE_APP_VUETIFY_VERSION = packageVuetify.version;
process.env.VUE_APP_DEBUG = process.env.NODE_DEBUG;
process.env.VUE_APP_NODE_ENV = process.env.NODE_ENV;
try {
  process.env.VUE_APP_DOMAIN = kernel.domain;
  process.env.VUE_APP_HTTP_PORT = kernel.httpPort;
  process.env.VUE_APP_HTTPS_PORT = kernel.httpsPort;
} catch (e) {}


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
    config.module
      .rule("i18n")
      .resourceQuery(/blockType=i18n/)
      .type('javascript/auto')
      .use("i18n")
      .loader("@kazupon/vue-i18n-loader")
      .end();
  },

  configureWebpack: {
    devtool: process.env.NODE_ENV === "development" ? "source-map" : "",
    output: {
      hotUpdateChunkFilename: 'hot/hot-update.js',
      hotUpdateMainFilename: 'hot/hot-update.json'
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [`${outputDir}/hot/*.hot-update.*`],
        dry: false,
        verbose: false,
        initialClean: false,
        cleanStaleWebpackAssets: true,
        protectWebpackAssets: true,
        cleanAfterEveryBuildPatterns: [],
        dangerouslyAllowCleanPatternsOutsideProject: true
      }),
      //new BundleAnalyzerPlugin()
    ]
  },

  transpileDependencies: [
    //"vuetify"
  ],

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  },

  pwa: {
   name: 'nodefony-mediasoup',
   themeColor: '#4DBA87',
   msTileColor: '#000000',
   appleMobileWebAppCapable: 'yes',
   appleMobileWebAppStatusBarStyle: 'black',
   // configure the workbox plugin
   workboxPluginMode: 'InjectManifest',
   workboxOptions: {
     // swSrc is required in InjectManifest mode.
     swSrc: 'src/pwa/registerServiceWorker.js',
     // ...other Workbox options...
   }
 }
};
