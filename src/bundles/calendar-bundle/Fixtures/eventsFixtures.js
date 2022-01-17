const events = require("./events.js");

class eventsFixture extends nodefony.Fixture {

  constructor(container) {
    super("events", container);
    this.entity = this.orm.getEntity("events");
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
      for await (let event of events.default) {
        tab.push(await this.loadMongooseFixtures(event));
      }
      return tab;
    } catch (e) {
      this.logger(e, "ERROR");
    }
  }

  async runSequelize() {
    try {
      let tab = [];
      for await (let event of events.default) {
        tab.push(await this.loadSequelizeFixtures(event));
      }
      return tab;
    } catch (e) {
      this.logger(e, "ERROR");
    }
  }

  loadSequelizeFixtures(obj) {
    let opt = {
      where: {
        summary: obj.summary
      },
      defaults: obj
    }
    return this.entity.findOrCreate(opt)
      .then((res) => {
        if (res[1]) {
          this.logger("ADD Events : " + res[0].summary, "INFO");
        } else {
          this.logger("Events ALREADY EXIST  : " + res[0].summary, "INFO");
        }
        return res[1];
      })
  }


  loadMongooseFixtures(obj) {
    return new Promise(async (resolve, reject) => {
      try {
        let document = await this.entity.findOne({
          summary: obj.summary
        });
        if (document) {
          this.logger("ALREADY EXIST : " + obj.summary, "INFO");
        } else {
          document = await new this.entity(obj).save();
          this.logger("ADD Events : " + obj.summary, "INFO");
        }
        return resolve(document);
      } catch (e) {
        return reject(e);
      }
    });
  }
}

module.exports = eventsFixture;
