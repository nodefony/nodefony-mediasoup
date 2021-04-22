const mediasoup = require('mediasoup');
/**
 *	@class statsController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/mediasoup/api/stats")
 */
class statsController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    //this.startSession();
    this.meetingsService = this.get("Meetings");
    this.mediasoupService = this.get("Mediasoup");
    // start session
    this.api = new nodefony.api.Json({
      name: "mediasoup-stats",
      version: mediasoup.version,
      description: "Mediasoup Statistics Api",
    }, this.context);
  }
  checkAuthorisation(username, room) {
    let granted = this.is_granted("ROLE_ADMIN");
    if (!granted) {
      throw new nodefony.authorizationError("Unauthorized", 401, this.context);
    }
  }

  getRoom(roomId) {
    return this.meetingsService.getRoom(roomId);
  }


  /**
   *  API GET  mediasoup Worker
   *    @Route ("/rooms/{id}",
   *      name="route-mediasoup-stats-rooms")
   *    @Method ({"GET"})
   */
  async roomsAction(id) {
    if (id) {
      let room = this.getRoom(id);
      if (room) {
        const status = await room.logStatus() ;
        const stats = await room.logStats() ;
        return this.api.render({
          status,
          stats
        });
      }
    }
    throw new Error(`Room id ${id} not found`)
  }


  /**
   *  API GET  mediasoup Worker
   *    @Route ("/workers/{workerPid}",
   *      name="route-mediasoup-stats-worker")
   *    @Method ({"GET"})
   */
  async workerAction(workerPid) {
    if (workerPid) {
      let worker = this.mediasoupService.getWorker(workerPid);
      if (worker) {
        return this.api.render({
          usage: await worker.getResourceUsage()
        });
      }
    }
    throw new Error(`Worker pid ${workerPid} not found`)
  }

  /**
   *  API GET  mediasoup Worker
   *    @Route ("/rooms/{roomid}/routers/{id}",
   *      name="route-mediasoup-stats-router")
   *    @Method ({"GET"})
   */
  async routerAction(id) {
    let router = null;
    if (id) {
      router = this.mediasoupService.getRouter(id, this.query.workerId);
    } else {
      throw new Error(`Router id : ${id} not found`)
    }
    if (router) {
      return this.api.render({
        rtpCapabilities: router.rtpCapabilities
      });
    }
    throw new Error(`Worker pid ${workerPid} not found`)
  }


}
module.exports = statsController;
