/**
 *  NODEFONY APP CONFIG
 *
 *   @here You can OVERRIDE all Bundles Configurations
 */
const path = require("path");
const dirConfig = path.resolve(__dirname, "nodefony");

module.exports = {
  locale: "en_en",
  type: "vue",
  App: {
    projectYear: 2020,
    locale: "en_en",
    authorName: "Christophe CAMENSULI",
    authorMail: "ccamensuli@gmail.com",
  },
  lang: {
    en_en: "english",
    fr_fr: "français"
  },
  /**
   *    WATCHERS
   *
   *  watchers Listen to changes, deletion, renaming of files and directories
   *  of different components
   *
   *  For watch all components
   *      watch:                    true
   *  or
   *      watch : {
   *        controllers:             true,
   *        config:                 true,        // only routing and services
   *        views:                  true,
   *        translations:           true,
   *        webpack:                true
   *      }
   *
   */
  watch: {
    controllers: true,
    config: true,
    translations: true,
    views: true,
    webpack: true
  },
  /**
   * DEV SERVER
   */
  devServer: {
    hot: true
  },

  /*
   *   OVERRIDE BUNDLES CONFIG
   */
  "http-bundle": require(path.resolve(dirConfig, "http-bundle.js")),
  "monitoring-bundle": require(path.resolve(dirConfig, "monitoring-bundle.js")),
  "security-bundle": require(path.resolve(dirConfig, "security-bundle.js")),
  "framework-bundle": require(path.resolve(dirConfig, "framework-bundle.js")),
  "sequelize-bundle": require(path.resolve(dirConfig, "sequelize-bundle.js")),
  "mail-bundle": require(path.resolve(dirConfig, "mail-bundle.js")),
  "realtime-bundle": require(path.resolve(dirConfig, "realtime-bundle.js"))
  //"mongoose-bundle": require(path.resolve(dirConfig, "mongoose-bundle.js")),
  //"redis-bundle": require(path.resolve(dirConfig, "redis-bundle.js")),
  //"elastic-bundle": require(path.resolve(dirConfig, "elastic-bundle.js")),
};
