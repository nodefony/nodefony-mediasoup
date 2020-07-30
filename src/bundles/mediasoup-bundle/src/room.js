

class Room extends nodefony.Service{
  constructor(roomid, worker, router, audioLevelObserver, bot, container){
    super(`Room ${roomid}`, container);
    this.id = roomid;
    this.worker = worker;
    this.router = router;
    this.bot = bot ;
    this.audioLevelObserver = audioLevelObserver;
  }

}

module.exports = Room;
