class MediasoupStats extends nodefony.Service {

  constructor(container) {
    super("MediasoupStats", container);
    this.orm = this.kernel.getORM();
    if (!kernel.ready) {
      this.kernel.once("onReady", () => {
        this.meetingsService = this.get("Meetings");
        this.roomsService = this.get("Rooms");
        this.peersService = this.get("Peers");
        this.entity = this.orm.getEntity("room");
      });
      this.kernel.once("onTerminate", () => {

      });
    } else {
      this.meetingsService = this.get("Meetings");
      this.roomsService = this.get("Rooms");
      this.peersService = this.get("Peers");
      this.entity = this.orm.getEntity("room");
    }
    this.intervalMap = new Map();
  }

  handShake(query, context) {
    let roomsMap = this.meetingsService.getRooms();

  }

  handle(message, context) {
    switch (message.method) {
    case "startRoomStats":
      let tosend = this.getRoomStats(message, context)
      context.send(JSON.stringify(tosend));
      context.once("onClose", () => {
        this.log(`Close Clear interval startRoomStats ${tosend.interval}`)
        let interval = this.intervalMap.get(tosend.interval);
        if (interval) {
          clearInterval(interval);
        }
      })
    case "stopRoomStats":
      if (message.interval) {
        clearInterval(message.interval);
      }
      return context.send(JSON.stringify({
        method: message.method,
        roomid: message.roomid,
        code: 200
      }));
      break;
    }
  }

  getRoomStats(message, context) {
    let room = this.meetingsService.getRoom(message.roomid);
    if (!room) {
      return {
        method: message.method,
        roomid: message.roomid,
        interval: null,
        message: "room not found",
        code: 500
      }
    }
    const interval = setInterval(async () => {
      this.log(`mediasoup Worker resource usage [pid:${room.worker.pid}]:`, "DEBUG");

      return context.send(JSON.stringify({
        method: "roomStats",
        //room: roomStat,
        period:1 * 1000,
        roomid: message.roomid,
        room: await this.meetingsService.getRoomsInfos(room),
        peers: await this.meetingsService.getPeersInfo(room)
      }));
    }, 1 * 1000);
    let idInterval = nodefony.generateId();
    this.intervalMap.set(idInterval, interval);
    return {
      method: message.method,
      roomid: message.roomid,
      interval: idInterval,
      code: 200
    }
  }

};

module.exports = MediasoupStats;
