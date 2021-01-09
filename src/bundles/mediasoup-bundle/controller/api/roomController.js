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
    // TODO move to service
    this.orm = this.getORM();
    this.entity = this.orm.getEntity("room");
    // service entity
    this.roomsService = this.get("Rooms");
    this.User = this.orm.getEntity("user");
    this.api = new nodefony.api.Json({
      name: "mediasoup-rooms",
      version: this.bundle.version,
      description: "Mediasoup rooms Api",
    }, this.context);
  }

  checkAuthorisation() {
    let granted = this.is_granted("ROLE_ADMIN");
    if (!granted) {
      throw new nodefony.authorizationError("Unauthorized", 401, this.context);
    }
    return true;
  }

  async getRoom(id, query) {
    return await this.roomsService.findOne(id, query)
      .then((room) => {
        if (room) {
          delete room.password;
          delete room.sticky_cookie;
          return room;
        }
        throw new Error(`room ${id} not found`);
      })
  }

  // scalability prepare Styky Cookie
  async setStykyCookie(roomid, room) {
    if (!room) {
      room = await this.getRoom(roomId);
    }
    if (!room) {
      throw new Error(`Room not exit with id ${query.roomId} `);
    }
    // create styky cookie
    const cookie_name = room.sticky_cookie;
    const cookie = this.context.createCookie(cookie_name, room.name, {
      secure: true,
      maxAge: "1h",
      httpOnly: true
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
    const room = await this.roomsService.find({
      include: [{
        model: this.User
      }]
    });
    if (room) {
      room.rows.map((room) => {
        delete room.password;
        if (room.users && room.users.length){
          room.users.map((user)=>{
            delete user.password;
          });
        }
      });
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
   *    @Firewall ({bypass:true})
   */
  async roomAction(name) {
    const room = await this.getRoom(name,{
      include: [{
        model: this.User
      }]
    });
    if (room) {
      if (room.users && room.users.length){
        room.users.map((user)=>{
          delete user.password;
        });
      }
      return this.api.render(
        room
      );
    }
    throw new Error(`Room not exist`);
  }

  /**
   *  API PUT
   *    @Route ("/room/{name}",
   *      name="route-room-put")
   *    @Method ({"PUT"})
   */
   //// TODO: checkAuthorisation
  async putRoomAction(name) {
    const room = await this.roomsService.findOne(name);
    if (!this.query.password) {
      this.query.password_pure = room.password;
    }
    return this.roomsService.update(room, this.query)
      .then(async (room) => {
        const message = `Update Room ${this.query.name} OK`;
        this.log(message, "INFO");
        const newRoom = await this.getRoom(this.query.name);
        return this.api.render({
          query: this.query,
          room: newRoom
        });
      }).catch(e =>{
        this.log(e, "ERROR");
      })
  }

  /**
   *  API
   *    @Route ("/access/room/{name}",
   *      name="route-rooms-access")
   *    @Method ({"POST"})
   *    @Firewall ({bypass:true})
   */
  async checkRoomAccessAction(name) {
    const room = await this.getRoom(name);
    if (room && room.secure) {
      return this.secureAction(name);
    }
    await this.setStykyCookie(name, room);
    return this.api.render({
      room,
      access: "authorized"
    });
  }

  /**
   *  API GET
   *    @Route ("/secure/room/{name}",
   *      name="route-rooms-secure")
   *    @Method ({"POST"})
   */
  async secureAction(name) {
    try {
      const entity = this.getNodefonyEntity("room");
      const encoder = entity.getEncoder();
      const room = await this.roomsService.findOne(name);
      const check = await encoder.isPasswordValid(this.query.password, room.password);
      if (check) {
        await this.setStykyCookie(name, room);
        delete room.password;
        return this.api.render({
          room,
          access: "authorized"
        });
      }
      throw new nodefony.Error('Bad password', 401)
    } catch (e) {
      this.log(e, "ERROR");
      throw e
    }
  }

  /**
   *    @Method ({"PUT"})
   *    @Route ( "/userroom/{username}",name="api-user-room-set")
   */
  async addUserRoomAction(username) {
    this.checkAuthorisation();
    let result = await this.roomsService.addUserRoom(username, this.query.roomid);
    return this.api.render({
      rooms: result.rooms
    })
  }
  /**
   *    @Method ({"DELETE"})
   *    @Route ( "/userroom/{username}",name="api-user-room-delete")
   */
  async deleteUserRoomAction(username) {
    this.checkAuthorisation();
    let result = await this.roomsService.deleteUserRoom(username, this.query.roomid);
    return this.api.render({
      rooms: result.rooms
    })
  }
}

module.exports = apiRomController;
