

class Room extends nodefony.Service{
  constructor(roomid, worker, container){
    super(`Room ${roomid}`, container);
    this.id = roomid;
    this.worker = worker;
  }
  on(){

  }
}

module.exports = Room;
