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
  getRoom(roomId) {
    return this.meetingsService.getRoom(roomId);
  }

  async getRoomInfo(room){
    let ele = {};
    ele.id = room.id;
    ele.status = await room.logStatus();
    ele.closed = ele.status.closed ? "closed" : "active";
    ele.RouterRtpCapabilities = room.getRouterRtpCapabilities();
    return ele;
  }

  getRoomsInfos(room) {
    return new Promise(async (resolve , reject)=>{
      try{
        if (room){
          return resolve( await this.getRoomInfo(room));
        }
        let rows = [];
        let i = this.meetingsService.rooms.size;
        if(i === 0 ){
          return resolve(rows);
        }
        this.meetingsService.rooms.forEach(async (room, key, map)=>{
          let ele = await this.getRoomInfo(room)
          rows.push(ele);
          if(i === 1){
            return resolve(rows);
          }
          i--;
        })

      }catch(e){
        return reject(e);
      }
    })
  }

  /**
   *  API GET resource that returns the mediasoup Router RTP capabilities of the room
   *    @Route ("",
   *      name="route-mediasoup-meetings")
   *    @Method ({"GET"})
   */
  async meetingsAction() {
    let res = await this.getRoomsInfos()
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
    return this.api.render({
      roomid: roomId,
      room: await this.getRoomsInfos(room)
    });
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


}

module.exports = meetingsController;
