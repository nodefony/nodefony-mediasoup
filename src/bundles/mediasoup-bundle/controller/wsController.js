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
    //this.meetingsService = this.get("Meetings");
  }

  /**
   *    @Route ("/ws",
   *      name="route-mediasoup-realtime")
   */
  indexAction(message) {
    switch (this.method) {
      case "WEBSOCKET":
        if (message) {
          let info = `websocket message type :  ${message.type}`;
          this.log(info, "DEBUG");
          this.mediasoup.handle(JSON.parse(message.utf8Data), this.context);
        } else {
          this.mediasoup.handShake(this.query, this.context);
        }
        break;
      default:
        throw new nodefony.Error("Bad request");
    }
  }
}

module.exports = wsController;
