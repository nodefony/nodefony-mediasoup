const mediasoup = require('mediasoup');
/**
 *	@class serversController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/mediasoup/api")
 */
class serversController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    this.api = new nodefony.api.Json({
      name: "mediasoup-servers",
      version: mediasoup.version,
      description: "Mediasoup servers Api",
    }, this.context);


  }
  /**
   *  API GET resource that returns the mediasoup Router RTP capabilities of the room
   *  @Route ("/servers",
   *      name="route-mediasoup-servers")
   */
  getServerAction() {
    return this.api.render({
      domain: {
        name: this.kernel.domain,
        alias: this.kernel.domainAlias,
        proxy: this.context.proxy,
        ports: {
          http: this.kernel.httpPort,
          https: this.kernel.httpsPort
        }
      },
      interfaces: {
        devides: this.kernel.getNetworkInterfaces(),
        externals: this.kernel.getLocalExternalIP()
      },
      mediasoup: this.bundle.settings.mediasoup
    });
  }


}

module.exports = serversController;
