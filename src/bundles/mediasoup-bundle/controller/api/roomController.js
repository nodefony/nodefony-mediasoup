/**
 *	@class apiController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/mediasoup/api")
 */
class apiRoomController extends nodefony.Controller {

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

  isRoomAdmin(room) {
    let username = this.getUser().username;
    if (room.users) {
      let tab = room.users.filter((admin) => {
        if (admin.username === username) {
          return admin;
        }
      })
      if (tab.length) {
        return true;
      }
    }
    return false;
  }

  async checkAuthorisation(roomid) {
    let granted = this.is_granted("ROLE_ADMIN");
    if (granted) {
      return true;
    }
    if (roomid) {
      const room = await this.getRoom(roomid, {
        include: [{
          model: this.User
        }]
      });
      granted = this.isRoomAdmin(room)
    }
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
          if (room.users && room.users.length) {
            room.users.map((user) => {
              delete user.password;
            });
          }
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
    let cookie = null;
    if (cookie_name) {
      cookie = this.context.createCookie(cookie_name, room.name, {
        secure: true,
        maxAge: "1h",
        httpOnly: true
        //path
      });
      this.log(`add cookies : ${cookie_name}`);
    }
    return cookie
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
        if (room.users && room.users.length) {
          room.users.map((user) => {
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
    const room = await this.getRoom(name, {
      include: [{
        model: this.User
      }]
    });
    if (room) {
      if (room.users && room.users.length) {
        room.users.map((user) => {
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
  async putRoomAction(name) {
    let value = {
      name: this.query.name || null,
      type: this.query.type,
      description: this.query.description,
      secure: this.query.secure,
      access: this.query.access,
      waitingconnect: this.query.waitingconnect,
      sticky_cookie: this.query.sticky_cookie
    };
    await this.checkAuthorisation(name);
    const room = await this.roomsService.findOne(name);
    if (this.query.password) {
      value.password = this.query.password;
    }
    return this.roomsService.update(room, value)
      .then(async (room) => {
        const message = `Update Room ${this.query.name} OK`;
        this.log(message, "INFO");
        const newRoom = await this.getRoom(this.query.name);
        return this.api.render({
          query: this.query,
          room: newRoom
        });
      }).catch(e => {
        this.log(e, "ERROR");
      })
  }

  /**
   *  API POST create room
   *    @Route ("/rooms",
   *      name="route-room-post")
   *    @Method ({"POST"})
   */
  async postRoomAction() {
    await this.checkAuthorisation();
    let username = this.getUser().username;
    return this.roomsService.create(this.query, username)
      .then(async (room) => {
        const message = `Create Room ${this.query.name} : ${room} OK`;
        this.log(message, "INFO");
        const newRoom = await this.getRoom(this.query.name);
        return this.api.render({
          query: this.query,
          room: newRoom
        });
      }).catch(async (e) => {
        this.log(e, "ERROR");
        throw e;
      })
  }

  /**
   *  API DELETE
   *    @Route ("/room/{name}",
   *      name="route-room-delete")
   *    @Method ({"DELETE"})
   */
  async deleteRoomAction(name) {
    await this.checkAuthorisation(name);
    if (name) {
      return this.roomsService.delete(name)
        .then((result) => {
          let message = `Delete Room ${result.name} OK`;
          return this.api.render({
            query: this.query,
            room: null
          });
        }).catch(e => {
          this.logger(e, "ERROR");
          throw e;
        });
    }
    let error = new nodefony.Error(`Room ${name} not found`, this.context);
    this.logger(error, "ERROR");
    throw error;
  }

  /**
   *  API
   *    @Route ("/access/room/{name}",
   *      name="route-rooms-access")
   *    @Method ({"POST"})
   *    @Firewall ({bypass:true})
   */
  async checkRoomAccessAction(name) {
    const room = await this.roomsService.findOne(name);
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
   *    @Route ( "/room/{roomid}/user",name="api-room-user-set")
   */
  async addUserRoomAction(roomid) {
    await this.checkAuthorisation(roomid);
    let result = await this.roomsService.addUserRoom(this.query.username, roomid);
    const room = await this.getRoom(roomid, {
      include: [{
        model: this.User
      }]
    });
    return this.api.render({
      room: room
    })
  }
  /**
   *    @Method ({"DELETE"})
   *    @Route ( "/room/{roomid}/user",name="api-room-user-delete")
   */
  async deleteUserRoomAction(roomid) {
    await this.checkAuthorisation(roomid);
    let result = await this.roomsService.deleteUserRoom(this.query.username, roomid);
    const room = await this.getRoom(roomid, {
      include: [{
        model: this.User
      }]
    });
    return this.api.render({
      room: room
    })
  }
}

module.exports = apiRoomController;
