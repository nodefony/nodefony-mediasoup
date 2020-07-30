const Room = require(path.resolve(__dirname, "..", "src", "room.js"))

module.exports = class rooms extends nodefony.Service {

  constructor(container) {
    super("rooms", container);
    this.rooms = new Map();
    if (! this.kernel.ready){
      this.kernel.once("onReady", ()=>{
        this.mediasoupService = this.get("Mediasoup");
        this.mediaRouterOptions = this.mediasoupService.config.routerOptions ;
        this.botService = this.get("Bot");
      });
    }else{
      this.mediasoupService = this.get("Mediasoup");
      this.mediaRouterOptions = this.mediasoupService.config.routerOptions ;
      this.botService = this.get("Bot");
    }
  }

  create(worker, roomid) {
    return new Promise(async (resolve, reject)=>{
      try{

        // Create a mediasoup Router.
		    const mediasoupRouter = await worker.createRouter(this.mediaRouterOptions.mediacodecs);
        this.log(mediasoupRouter)

    		// Create a mediasoup AudioLevelObserver.
	      const audioLevelObserver = await mediasoupRouter.createAudioLevelObserver(
  			{
  				maxEntries : 1,
  				threshold  : -80,
  				interval   : 800
  			});
        const bot = await this.botService.create(mediasoupRouter) ;
        const room = new Room(roomid, worker, mediasoupRouter, audioLevelObserver, bot, this.container);
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
