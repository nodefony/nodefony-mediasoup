const mediasoup = require('mediasoup');

/**
 *	@class apiController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/mediasoup/api")
 */
class recorderController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    //this.startSession();
    //this.meetingsService = this.get("Meetings");
    // start session
    this.api = new nodefony.api.Json({
      name: "mediasoup-record",
      version: mediasoup.version,
      description: "Mediasoup record Api",
    }, this.context);
    this.recordService = this.get("recorder");
  }


  /**
   *    @Route ("/record/{roomId}/{peerid}",
   *      name="route-worker-mediasoup")
   *    @Method ({"GET"})
   */
  recordAction(roomId, peerid) {
    return new Promise(async (resolve, reject) => {
      try {
        let recorder = "gstreamer";
        if (this.query.recorder) {
          recorder = this.query.recorder;
        }
        const location = path.resolve(this.bundle.path, "recorded");
        let worker = await this.recordService.startRecord(roomId, peerid, location, recorder);
        //console.log(worker);
        worker.on('message', (message) => {
          switch (message.action) {
          case "event":
            if (message.event === "close") {
              return reject(this.api.render(message));
            }
            break;
          }
        });
        /*setTimeout(async () => {
          let res = await this.recordService.stopRecord(worker.threadId);
          return resolve( this.api.render({
            roomId,
            peerid,
            workerId: worker.threadId
          }));
        }, 20 * 1000);*/
      } catch (e) {
        this.log(e, "ERROR");
        return reject(e);
      }
    });
  }

  /**
   *    @Route ("/record/stop/{roomId}/{peerid}",
   *      name="route-record-stop-mediasoup")
   *    @Method ({"GET"})
   */
  async stopRecordAction(roomId, peerid) {
    try {
      let worker = await this.recordService.stopRecord(roomId, peerid);
      //console.log(worker);
      return this.api.render({
        roomId,
        peerid,
        workerId: worker.threadId
      });
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
  }
}

module.exports = recorderController;
