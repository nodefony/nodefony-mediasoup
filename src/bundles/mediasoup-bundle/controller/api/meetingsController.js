const mediasoup = require('mediasoup');
const {
  networkInterfaces
} = require('os');

/**
 *	@class meetingsController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/mediasoup/api/meetings")
 */
class meetingsController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    //this.startSession();
    this.meetingsService = this.get("Meetings");
    // start session
    this.api = new nodefony.api.Json({
      name: "mediasoup-meetings",
      version: mediasoup.version,
      description: "Mediasoup Mettings Api",
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
   *  API GET resource that returns the mediasoup Router RTP capabilities of the room
   *    @Route ("",
   *      name="route-mediasoup-meetings")
   *    @Method ({"GET"})
   */
  async meetingsAction() {
    const res = await this.meetingsService.getRoomsInfos()
    return this.api.render({
      size:res.length,
      rows: res
    });
  }

  /**
   *  API GET resource that returns the mediasoup Router RTP capabilities of the room
   *    @Route ("/{roomId}",
   *      name="route-mediasoup-metting")
   *    @Method ({"GET"})
   */
  async meetingAction(roomId) {
    const room = this.getRoom(roomId);
    if( room){
      return this.api.render({
        roomid: roomId,
        room: await this.meetingsService.getRoomsInfos(room),
        peers:await this.meetingsService.getPeersInfo(room)
      });
    }
    throw new Error(`Room ${roomId} not found`)

  }

  /**
   *
   *    @Route ("/{roomId}",
   *      name="route-mediasoup-meetings-delete")
   *    @Method ({"DELETE"})
   */
  async meetingDeleteAction(roomId) {
    const room = this.getRoom(roomId);
    if (room) {
      this.meetingsService.closeRoom(roomId);
    }
    return this.api.render({
      room: roomId,
      status: "deleted"
    });
  }

  /**
   *
   *    @Route ("/{roomId}/{peerid}/authorise",
   *      name="route-mediasoup-meetings-peer-authorise")
   *    @Method ({"PUT"})
   */
  async authoriseAction(roomId, peerid) {
    const room = this.getRoom(roomId);
    if (!room) {
      return this.api.renderError(new Error(`Room ${roomId} not found`), 404);
    }
    const peer = room.getPeer(peerid);
    if (! peer){
      return this.api.renderError(new Error(`Room ${peerid} not found`), 404);
    }
    let status = room.authorisePeer(peer);
    return this.api.render({
      room: roomId,
      peer: peerid,
      status: status,
      authorised:true
    });
  }

  /**
   *
   *    @Route ("/{roomId}/{peerid}/unauthorise",
   *      name="route-mediasoup-meetings-peer-unauthorise")
   *    @Method ({"PUT"})
   */
  async unauthoriseAction(roomId, peerid) {
    const room = this.getRoom(roomId);
    if (!room) {
      return this.api.renderError(new Error(`Room ${roomId} not found`), 404);
    }
    const peer = room.getPeer(peerid);
    if (! peer){
      return this.api.renderError(new Error(`Room ${peerid} not found`), 404);
    }
    const status = room.unauthorisePeer(peer);
    return this.api.render({
      room: roomId,
      peer: peerid,
      status: status,
      authorised:false
    });
  }

}

module.exports = meetingsController;
