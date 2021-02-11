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

    this.media_viewer = {
      dispatcher: this.get('media_viewer_dispatcher'),
      rooms: this.get('media_viewer_rooms')
    };
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

  /**
   *    @Route ("/ws/mediaviewer",
   *      name="route-mediasoup-wss-mediaviewer")
   */
  async mediaViewerAction(message) {
    if (this.method != "WEBSOCKET") {
      throw new Error("Not a Websocket method");
    }
    try {
      if (message) {
        const message_obj = JSON.parse(message.utf8Data);
        return this.media_viewer.dispatcher.handle(message_obj, this.context.client_app_data);
      }
      return await this.media_viewer.rooms.handshake(this.query.peerid, this.query.roomid, this.context);
    } catch(e) {
      this.log(e, "ERROR");
      throw e;
    }
  }

}

module.exports = wsController;
