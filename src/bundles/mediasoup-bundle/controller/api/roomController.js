/**
 *	@class apiController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/mediasoup/api")
 */
class apiRomController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    //this.startSession();
    //this.meetingsService = this.get("Meetings");
    // start session
    this.orm = this.getORM();
    this.entity = this.orm.getEntity("room");
    this.api = new nodefony.api.Json({
      name: "mediasoup-rooms",
      version: this.bundle.version,
      description: "Mediasoup rooms Api",
    }, this.context);
  }

  async getRoom(id){
    return await this.entity.findOne({
        where: {
          name: id
        }
      });
  }

  // scalability prepare Styky Cookie
  async setStykyCookie(roomid, room){
    if ( ! room){
      room = await this.getRoom(roomId);
    }
    if (!room) {
      throw new Error(`Room not exit with id ${query.roomId} `);
    }
    // create styky cookie
    const cookie_name = room.sticky_cookie ;
    const cookie = this.context.createCookie(cookie_name, room.name, {
      secure :true,
      maxAge:"1h",
      httpOnly:true
      //path
    });
    this.log(`add cookies : ${cookie_name}`);
  }

  /**
   *  API GET
   *    @Route ("/rooms",
   *      name="route-rooms")
   *    @Method ({"GET"})
   */
  async roomsAction() {
    const room = await this.entity.findAndCountAll();
    if( room){
      return this.api.render(
        room
      );
    }
    throw new Error(`Room not exist`);
  }

  /**
   *  API GET
   *    @Route ("/room/{name}",
   *      name="route-room")
   *    @Method ({"GET"})
   */
  async roomAction(name) {
    const room =  await this.getRoom(name || this.query.room.name);
    if( room){
      return this.api.render(
        room
      );
    }
    throw new Error(`Room not exist`);
  }

  /**
   *  API
   *    @Route ("/access/room/{name}",
   *      name="route-rooms-access")
   *    @Method ({"POST"})
   */
  async checkRoomAccessAction(name){
    const room = await this.getRoom(name);
    if(room && room.secure){
      return  this.secureAction(name);
    }
    await this.setStykyCookie(name, room);
    return this.api.render({
        room,
        access:"authorized"
      }
    );
  }

  /**
   *  API GET
   *    @Route ("/secure/room/{name}",
   *      name="route-rooms-secure")
   *    @Method ({"POST"})
   */
  async secureAction(name) {
    try{
      const entity = this.getNodefonyEntity("room");
      const encoder = entity.getEncoder();
      const room = await this.getRoom(name || this.query.room.name);
      const check = await encoder.isPasswordValid(this.query.password, room.password);
      if( check){
        await this.setStykyCookie(name, room);
        return this.api.render({
          room,
          access:"authorized"
        });
      }
      throw new nodefony.Error('Bad password', 401)
    }catch(e){
      this.log(e,"ERROR");
      throw e
    }
  }

}

module.exports = apiRomController;
