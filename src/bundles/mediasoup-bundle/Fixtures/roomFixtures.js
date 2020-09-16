const rooms = require("./rooms.js");

class roomFixture extends nodefony.Fixture {

  constructor(container) {
    super("room", container);
    this.entity = this.orm.getEntity("room");
  }

  async initialize(random = 0) {
    switch (this.ormName) {
    case 'sequelize':
      return await this.runSequelize();
    case "mongoose":
      return await this.runMongoose();
    }
  }

  async runMongoose() {
    try {
      let tab = [];
      for await (let room of rooms.default) {
        tab.push(await this.loadMongooseFixtures(room));
      }
      return tab;
    } catch (e) {
      this.logger(e, "ERROR");
    }
  }

  async runSequelize() {
    try {
      let tab = [];
      for await (let room of rooms.default) {
        tab.push(await this.loadSequelizeFixtures(room));
      }
      return tab;
    } catch (e) {
      this.logger(e, "ERROR");
    }
  }

  loadSequelizeFixtures(obj) {
    return this.entity.findOrCreate({
        where: {
          name: obj.name
        },
        defaults: obj
      })
      .then((res) => {
        if (res[1]) {
          this.logger("ADD Room : " + res[0].name, "INFO");
        } else {
          this.logger("Room ALREADY EXIST  : " + res[0].name, "INFO");
        }
        return res[1];
      });
  }


  loadMongooseFixtures(obj) {
    return new Promise(async (resolve, reject) => {
      try {
        let document = await this.entity.findOne({
          name: obj.name
        });
        if (document) {
          this.logger("ALREADY EXIST : " + obj.name, "INFO");
        } else {
          document = await new this.entity(obj).save();
          this.logger("ADD DOCUMENT room : " + obj.name, "INFO");
        }
        return resolve(document);
      } catch (e) {
        return reject(e);
      }
    });
  }
}

module.exports = roomFixture;
