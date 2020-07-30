const Room = require(path.resolve(__dirname, "..", "src", "room.js"))

module.exports = class rooms extends nodefony.Service {

  constructor(container) {
    super("rooms", container);
    this.rooms = new Map();
  }

  create(worker, roomid) {
    return new Promise((resolve, reject)=>{
      try{
        const room = new Room(roomid, worker, this.container);
        this.setRoom(roomid, room);
        return resolve( room );
      }catch(e){
        return reject(e)
      }
    })
  }

  hasRoom(roomId) {
    return this.rooms.has(roomId)
  }

  getRoom(roomId) {
    return this.rooms.get(roomId)
  }

  setRoom(roomid, room) {
    this.rooms.set(roomid, room);
    room.on('close', () => this.rooms.delete(roomid));
  }

};
