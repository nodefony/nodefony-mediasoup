const {
  Op
} = nodefony.Sequelize;
module.exports = class events extends nodefony.Service {

  constructor(container, calendar) {
    super("events", container);
    this.calendarService = calendar;
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
    this.eventsEntity = this.orm.getEntity("events");

  }
  sanitizeSequelizeError(error) {
    if (nodefony.Error.isError(error) === "SequelizeError") {
      return new nodefony.Error(error);
    }
    return error;
  }

  list(calendarId, username, start, end) {
    if (!calendarId) {
      throw new nodefony.Error("No calendar id")
    }
    let options = {
      where:{
        calendarId: calendarId
      },
      include: [{ // Notice `include` takes an ARRAY
        model: this.calendarEntity,
      }]
    }
    if( start){
      options.where.start ={
          [Op.gte]: start,
      }
    }
    if(end){
      options.where.end ={
          [Op.lte]: end,
      }
    }
    if (username) {
      options.where.creator = username;
      //console.log(options)
      return this.eventsEntity.findAndCountAll(options)
        .then((res) => {
          return res.rows;
        }).catch(e => {
          throw this.sanitizeSequelizeError(e);
        });
    }
    return this.eventsEntity.findAndCountAll(options)
      .then((res) => {
        return res.rows;
      }).catch(e => {
        throw this.sanitizeSequelizeError(e);
      });
  }


  getEvent(calendarId, eventId, username, start, stop) {
    if (!calendarId) {
      throw new nodefony.Error("No calendar id")
    }
    if (!eventId) {
      throw new nodefony.Error("No Event id")
    }
    if (username) {
      return this.eventsEntity.findOne({
          where: {
            creator: username,
            calendarId: calendarId,
            id: eventId
          },
          include: [{ // Notice `include` takes an ARRAY
            model: this.calendarEntity,
          }]
        })
        .then((res) => {
          return res;
        }).catch(e => {
          throw this.sanitizeSequelizeError(e);
        });
    }
    return this.eventsEntity.findOne({
        where: {
          calendarId: calendarId,
          id: eventId
        },
        include: [{ // Notice `include` takes an ARRAY
          model: this.calendarEntity,
        }]
      })
      .then((res) => {
        return res;
      }).catch(e => {
        throw this.sanitizeSequelizeError(e);
      });
  }



  quickAdd() {

  }


  watch() {

  }

  update() {

  }


  patch() {

  }


  move() {

  }

  insert() {

  }

  import() {

  }
};
