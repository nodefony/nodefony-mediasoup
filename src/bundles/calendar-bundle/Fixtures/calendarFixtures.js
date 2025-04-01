const calendars = require("./calendar.js");

class calendarFixture extends nodefony.Fixture {

  constructor(container) {
    super("calendar", container);
    this.entity = this.orm.getEntity("calendar");
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
      for await (let calendar of calendars.default) {
        tab.push(await this.loadMongooseFixtures(calendar));
      }
      return tab;
    } catch (e) {
      this.logger(e, "ERROR");
    }
  }

  async runSequelize() {
    try {
      let tab = [];
      for await (let calendar of calendars.default) {
        tab.push(await this.loadSequelizeFixtures(calendar));
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
          this.logger("ADD Calendar : " + res[0].summary, "INFO");
        } else {
          this.logger("Calendar ALREADY EXIST  : " + res[0].summary, "INFO");
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
          this.logger("ADD Calendar : " + obj.summary, "INFO");
        }
        return resolve(document);
      } catch (e) {
        return reject(e);
      }
    });
  }
}

module.exports = calendarFixture;
