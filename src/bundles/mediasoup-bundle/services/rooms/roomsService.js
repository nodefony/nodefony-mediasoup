class Rooms extends nodefony.Service {

  constructor(container) {
    super("Rooms", container);
    this.rooms = new Map();
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
    this.entity = this.orm.getEntity("room");
    this.log("Rooms service OK");
  }

  async update(room, value) {
    let transaction = null;
    try {
      transaction = await this.orm.startTransaction("room");
      const {
        name
      } = room;
      return this.entity.update(value, {
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
}

module.exports = Rooms;
