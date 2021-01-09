class Rooms extends nodefony.Service {

  constructor(container) {
    super("Rooms", container);
    if (!this.kernel.ready) {
      this.kernel.once("onReady", () => {
        this.init();
      });
    } else {
      this.init();
    }
  }

  init() {
    this.orm = this.kernel.getORM();
    this.Room = this.orm.getEntity("room");
    this.User = this.orm.getEntity("user");
    this.usersService = this.get("users");
  }

  sanitizeSequelizeError(error) {
    if (nodefony.Error.isError(error) === "SequelizeError") {
      return new nodefony.Error(error);
    }
    return error;
  }

  async findOne(id, query) {
    query = nodefony.extend(true, query, {
      where: {
        name: id
      }
    });
    return await this.Room.findOne(query)
      .then((el) => {
        if (el) {
          let room = el.get({
            plain: true
          });
          return room;
        }
        throw new Error(`room ${id} not found`);
      }).catch(e => {
        throw this.sanitizeSequelizeError(e);
      })
  }

  async find(query = {}, options = {}) {
    if (query.limit || query.offset) {
      return this.Room.findAndCountAll(query)
        .then((result) => {
          let tab = [];
          if (!result) {
            return {
              page: query.page,
              limit: query.limit,
              offset: query.offset,
              total: tab.length,
              rows: tab
            };
          }
          result.rows.map((el) => {
            let room = el.get({
              plain: true
            });
            tab.push(room);
          });
          return {
            page: query.page,
            limit: query.limit,
            offset: query.offset,
            total: result.count,
            rows: tab
          };
        })
        .catch(e => {
          throw this.sanitizeSequelizeError(e);
        });
    }
    return this.Room.findAll(query)
      .then((res) => {
        let tab = [];
        if (!res) {
          return {
            total: tab.length,
            rows: tab
          };
        }
        res.map((el) => {
          let room = el.get({
            plain: true
          });
          tab.push(room);
        });
        return {
          total: tab.length,
          rows: tab
        };
      })
      .catch(e => {
        throw this.sanitizeSequelizeError(e);
      });
  }

  async update(room, value) {
    let transaction = null;
    try {
      transaction = await this.orm.startTransaction("room");
      const {
        name
      } = room;
      return this.Room.update(value, {
          where: {
            name: name
          }
        }, {
          transaction: transaction
        })
        .then((room) => {
          transaction.commit();
          return room;
        }).catch(e => {
          transaction.rollback();
          throw this.sanitizeSequelizeError(e);
        });
    } catch (e) {
      if (transaction) {
        transaction.rollback();
      }
      throw this.sanitizeSequelizeError(e);
    }
  }

  async create(query) {

  }

  async delete(id) {

  }


  // UserRoom n:n
  addUserRoom(username, room) {
    return this.usersService.findOne({
        where: {
          username: username
        }
      })
      .then(async (el) => {
        await el.addRoom(room);
        return this.usersService.findOne({
          include: [{
            model: this.Room
           }],
          where: {
            username: username
          }
        })
      });
  }

  deleteUserRoom(username, roomid) {
    return this.usersService.findOne({
        where: {
          username: username
        },
        include: [{
          model: this.Room
        }]
      })
      .then(async (el) => {
        for (let i = 0; i < el.rooms.length; i++) {
          let room = el.rooms[i];
          if (room.name === roomid) {
            await room.UserRoom.destroy();
          }
        }
        return this.usersService.findOne({
          include: [{
            model: this.Room
         }],
          where: {
            username: username
          }
        })
      });
  }
}

module.exports = Rooms;
