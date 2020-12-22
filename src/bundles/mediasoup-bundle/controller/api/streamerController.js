const mediasoup = require('mediasoup');

/**
 *	@class apiController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/mediasoup/api")
 */
class streamerController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    //this.startSession();
    this.roomsService = this.get("Rooms");
    // start session
    this.api = new nodefony.api.Json({
      name: "mediasoup-streamer",
      version: mediasoup.version,
      description: "Mediasoup Streamer Api",
    }, this.context);
    this.streamerService = this.get("Streamer");
  }


  /**
   *    @Route ("/stream/{roomId}",
   *      name="route-worker-stream-mediasoup")
   *    @Method ({"GET"})
   */
  streamAction(roomId) {
    return new Promise(async (resolve, reject)=>{
      try {
        let streamer = "gstreamer";
        if( this.query.streamer){
          streamer = this.query.streamer ;
        }
        let worker = await this.streamerService.startStream(roomId, streamer);
        //console.log(worker);
        worker.on('message', (message) => {
          switch (message.action) {
            case "event":
              if (message.event === "close"){
                return reject(this.api.render(message));
              }
            break;
          }
        });
      } catch (e) {
        this.log(e, "ERROR");
        return reject(e);
      }
    });
  }

  /**
   *    @Route ("/stream/stop/{roomId}",
   *      name="route-stream-stop-mediasoup")
   *    @Method ({"GET"})
   */
  async stopStreamAction(roomId) {
    try {
      let worker = await this.streamerService.stopStream(roomId);
      //console.log(worker);
      return this.api.render({
        roomId,
        workerId: worker.threadId
      });
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
  }
}

module.exports = streamerController;
