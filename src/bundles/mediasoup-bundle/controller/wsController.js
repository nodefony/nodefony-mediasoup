/**
 *	@class wsController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/mediasoup")
 */
class wsController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    this.mediasoup = this.get("Mediasoup");
    this.mediasoupStats = this.get("MediasoupStats");
  }

  /**
   *    @Route ("/ws",
   *      name="route-mediasoup-wss-join")
   */
  indexAction(message) {
    switch (this.method) {
      case "WEBSOCKET":
        if (message) {
          this.mediasoup.handle(JSON.parse(message.utf8Data), this.context);
        } else {
          this.mediasoup.handShake(this.query, this.context);
        }
        break;
      default:
        throw new nodefony.Error("Bad request");
    }
  }

  /**
   *    @Route ("/ws/stats",
   *      name="route-mediasoup-wss-stats")
   */
  statsAction(message) {
    switch (this.method) {
      case "WEBSOCKET":
        if (message) {
          this.mediasoupStats.handle(JSON.parse(message.utf8Data), this.context);
        } else {
          this.mediasoupStats.handShake(this.query, this.context);
        }
        break;
      default:
        throw new nodefony.Error("Bad request");
    }
  }

}

module.exports = wsController;
