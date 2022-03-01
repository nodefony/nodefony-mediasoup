/**
 *  NODEFONY FRAMEWORK
 *
 *       KERNEL CONFIG
 *
 *   Domain listen : Nodefony can listen only one domain ( no vhost )
 *     Example :
 *      domain :  0.0.0.0      // for all interfaces
 *      domain :  [::1]        // for IPV6 only
 *      domain :  192.168.1.1  // IPV4
 *      domain :  mydomain.com // DNS
 *
 *   Domain Alias : string only "<<regexp>>" use domainCheck : true
 *     Example :
 *      domainAlias:[
 *        "^127.0.0.1$",
 *        "^localhost$",
 *        ".*\\.nodefony-mediasoup\\.com",
 *        "^nodefony-mediasoup\\.eu$",
 *        "^.*\\.nodefony-mediasoup\\.eu$"
 *      ]
 */
const path = require("path");
let certificats = {
  options: {
    rejectUnauthorized: true
  }
};
let domain = "127.0.0.1";
let domainAlias = [
  "^localhost$",
  "^mediasoup.nodefony.com$"
];
let domainCheck = false;
let CDN = null;
let statics = true;
let monitoring = true;
let documentation = false;
let mail = true;
let unitTest = false;

if (process.env && process.env.NODE_ENV === "production") {
  domain = "127.0.0.1";
  domainAlias = [
    "^localhost$",
    "^mediasoup.nodefony.com$"
  ];
  domainCheck = true;
  certificats.key = path.resolve("config", "certificates", "server", "privkey.pem");
  certificats.cert = path.resolve("config", "certificates", "server", "fullchain.pem");
  certificats.ca = path.resolve("config", "certificates", "ca", "nodefony-mediasoup-root-ca.crt.pem");
  CDN = null;
  mail = true;
  statics = true;
  documentation = false;
  monitoring = true;
  unitTest = false;
} else {
  certificats.key = path.resolve("config", "certificates", "server", "privkey.pem");
  certificats.cert = path.resolve("config", "certificates", "server", "fullchain.pem");
  certificats.ca = path.resolve("config", "certificates", "ca", "nodefony-mediasoup-root-ca.crt.pem");
}

module.exports = {
  system: {
    domain: domain,
    domainAlias: domainAlias,
    httpPort: 5151,
    httpsPort: 5152,
    domainCheck: domainCheck,
    locale: "en_en",

    /**
     * BUNDLES CORE
     */
    security: true,
    realtime: true,
    monitoring: monitoring,
    mail: mail,
    documentation: documentation,
    unitTest: unitTest,
    redis: false,
    mongo: false,
    elastic: false,

    /**
     * SERVERS
     */
    servers: {
      statics: statics,
      protocol: "2.0", //  2.0 || 1.1
      http: true,
      https: true,
      ws: true,
      wss: true,
      certificats: certificats
    },

    /**
     * DEV SERVER
     */
    devServer: {
      inline: true,
      hot: false,
      hotOnly: false,
      overlay: true,
      logLevel: "info", // none, error, warning or info
      progress: false,
      protocol: "https",
      websocket: true
    },

    /**
     *  BUNDLES LOCAL REGISTRATION
     *    Examples :
     *       bundles:{
     *         "hello-bundle" : "file:src/bundles/hello-bundle",
     *         "hello-bundle" : path.resolve("src", "bundles", "hello-bundle")
     *         "hello-bundle" : path.resolve(__dirname, "..", "src", "bundles", "hello-bundle"),
     *       }
     */
    bundles: {
      "users-bundle": path.resolve("src", "bundles", "users-bundle"),
      "mediasoup-bundle": path.resolve("src", "bundles", "mediasoup-bundle"),
      "calendar-bundle": path.resolve("src", "bundles", "calendar-bundle"),
    },
    /**
     * SYSLOG NODEFONY
     */
    log: {
      active: true
    }
  },

  /**
   *       ASSETS CDN
   *
   *       You set cdn with string
   *       CDN :    "cdn.nodefony-mediasoup.com",
   *       or
   *       CDN:
   *          global: "cdn.nodefony-mediasoup.com",
   *       or
   *       CDN:{
   *         stylesheet:[
   *           "cdn.nodefony-mediasoup.com"
   *         ],
   *         javascript:[
   *           "cdn.nodefony-mediasoup.com"
   *         ],
   *         image:[
   *           "cdn.nodefony-mediasoup.com",
   *           "cdn.nodefony-mediasoup.fr"
   *         ],
   *         font:[
   *           "cdn.nodefony-mediasoup.com"
   *         ]
   *      },
   */
  CDN: CDN,

  /**
   *  ENGINE TEMPLATE
   *
   *       TWIG
   *       https://github.com/justjohn/twig.js
   *
   */
  templating: "twig",

  /**
   * ENGINE ORM
   *       sequelize || mongoose
   *   orm : mongoose
   */
  orm: "sequelize",

  /**
   * NODE.JS PACKAGE MANAGER
   *
   *       npm
   *       yarn
   */
  packageManager: "yarn"

};
