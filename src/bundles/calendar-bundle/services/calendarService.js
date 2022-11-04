module.exports = class calendar extends nodefony.Service {

  constructor(container, cron) {
    super("calendar", container);
    this.cronService = cron;
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
    this.calendarEntity = this.orm.getEntity("calendar");
    this.User = this.orm.getEntity("user");
  }

  sanitizeSequelizeError(error) {
    if (nodefony.Error.isError(error) === "SequelizeError") {
      return new nodefony.Error(error);
    }
    return error;
  }

  list(username = null) {
    if (username) {
      return this.calendarEntity.findAndCountAll({
          where: {
            creator: username
          },
          include: [{// Notice `include` takes an ARRAY
            model: this.User,
          }]
        })
        .then((res) => {
          return res.rows;
        }).catch(e => {
          throw this.sanitizeSequelizeError(e);
        });
    }
    return this.calendarEntity.findAndCountAll({
      include: [{// Notice `include` takes an ARRAY
        model: this.User,
      }]
    })
      .then((res) => {
        return res.rows;
      }).catch(e => {
        throw this.sanitizeSequelizeError(e);
      });
  }

  /*
    HTTP GET FOR REST
  */
  getCalendar(calendarId, username ,query = {}) {
    if( ! calendarId){
      throw this.sanitizeSequelizeError(new nodefony.Error("calendar no id"));
    }
    if (username) {
      return this.calendarEntity.findOne({
          where: {
            id: calendarId,
            creator: username
          },
          include: [{// Notice `include` takes an ARRAY
            model: this.User,
          }]
        })
        .then((res) => {
          return res;
        }).catch(e => {
          this.log(e, "ERROR")
          throw this.sanitizeSequelizeError(e);
        });
    }
    return this.calendarEntity.findOne({
        where: {
          id: calendarId
        },
        include: [{// Notice `include` takes an ARRAY
          model: this.User,
        }]
      })
      .then((res) => {
        return res;
      }).catch(e => {
        throw this.sanitizeSequelizeError(e);
      });

  }

  getPrimaryCalendar(username){
    if (username) {
      return this.calendarEntity.findOne({
          where: {
            primary:true,
            creator: username
          },
          include: [{// Notice `include` takes an ARRAY
            model: this.User,
          }]
        })
        .then((res) => {
          return res;
        }).catch(e => {
          this.log(e, "ERROR")
          throw this.sanitizeSequelizeError(e);
        });
    }
    return this.calendarEntity.findOne({
        where: {
          primary:true
        },
        include: [{// Notice `include` takes an ARRAY
          model: this.User,
        }]
      })
      .then((res) => {
        return res;
      }).catch(e => {
        throw this.sanitizeSequelizeError(e);
      });
  }

  /*
    HTTP POST
  */
  insertCalendar() {

  }


  /*
    HTTP PUT
  */
  updateCalendar(calendarId) {

  }

  /*
    HTTP PATCH
  */
  patchCalendar(calendarId) {

  }

  /*
    HTTP POST
  */
  clearCalendar(calendarId) {

  }

  /*
    HTTP DELETE
    secodary calendar delete
  */
  deleteCalendar(calendarId) {

  }


};
