const {
  Op,
  Transaction
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
    this.roomsService = this.get("Rooms");
    this.roomEntity = this.orm.getEntity("room");

  }
  sanitizeSequelizeError(error) {
    if (nodefony.Error.isError(error) === "SequelizeError") {
      return new nodefony.Error(error);
    }
    return error;
  }

  createRoom(data, user, transaction){
    return
  }

  list(calendarId, username, start = null, end = null /*, interval = 0*/ ) {
    //console.log(start, end, interval)
    if (!calendarId) {
      throw new nodefony.Error("No calendar id", 404)
    }
    let options = {
      include: [{ // Notice `include` takes an ARRAY
        model: this.calendarEntity,
      }]
    }
    //start = new Date(start.unix() - interval)
    //end = new Date(end.getTime() + interval)
    start = start.toISOString();
    end = end.toISOString();

    options.where = {
      calendarId: calendarId,
      [Op.or]: [{
        // colStart < start 08 00 00 < colEnd
        [Op.and]: [{
          start: {
            iso: {
              [Op.lt]: start
            }
          }
          }, {
          end: {
            iso: {
              [Op.gt]: start
            }
          }
        }]
        }, {
        // colStart < end  08 23 59 < colEnd
        [Op.and]: [{
          start: {
            iso: {
              [Op.lt]: end
            }
          }
            }, {
          end: {
            iso: {
              [Op.gt]: end
            }
          }
        }]
        }, {
        // inside
        start: {
          iso: {
            [Op.between]: [start, end]
          }
        },
        end: {
          iso: {
            [Op.between]: [start, end]
          }
        }
      }, {
        // no end
        start: {
          iso: {
            [Op.between]: [start, end]
          }
        }
      }]
    }
    //console.log(util.inspect(options.where, {
    //  depth: 8
    //}))
    if (username) {
      options.where.creator = username;
      return this.eventsEntity.findAndCountAll(options)
        .then(({
          count,
          rows
        }) => {
          return rows;
        }).catch(e => {
          this.log(e, "ERROR");
          throw this.sanitizeSequelizeError(e);
        });
    }
    return this.eventsEntity.findAndCountAll(options)
      .then(({
        count,
        rows
      }) => {
        return rows;
      }).catch(e => {
        this.log(e, "ERROR");
        throw this.sanitizeSequelizeError(e);
      });
  }

  getEvent(calendarId, eventId, username, start, stop) {
    if (!calendarId) {
      throw new nodefony.Error("No calendar id", 404)
    }
    if (!eventId) {
      throw new nodefony.Error("No Event id", 404)
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
          },{
            model: this.roomEntity,
          }]
        })
        .then((res) => {
          return res;
        }).catch(e => {
          this.log(e, "ERROR");
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
        this.log(e, "ERROR");
        throw this.sanitizeSequelizeError(e);
      });
  }



  async insert(calendarId, username, event) {
    let transaction = null
    let mytransaction = null
    try {
      mytransaction = this.orm.getTransaction("nodefony");

      transaction = await mytransaction( {
        type: this.orm.engine.Transaction.TYPES.IMMEDIATE
      });

      if( event.conferenceData ){
        //event.meeting = event.conferenceData
        event.conferenceData.name  = `event-${nodefony.generateId()}`
        event.conferenceData.description = event.description
      }
      console.log(event)
      return this.eventsEntity.create(event, {
          transaction: transaction,
          include:[{
            model: this.roomEntity,
            as: 'event'
          }]
        })
        .then(async (el) => {
          console.log( el)
          await transaction.commit();
          let myevent = el.get({
            plain: true
          });
          return myevent;
        }).catch( async (e) => {
          this.log(e, 'ERROR')
          if (transaction) {
            await transaction.rollback();
          }
          throw this.sanitizeSequelizeError(e);
        });
    } catch(e) {
      if (transaction) {
        await transaction.rollback();
      }
      this.log(e, "ERROR");
      throw this.sanitizeSequelizeError(e);
    }
  }

  async quickAdd() {
    let transaction = null;
    try {
      transaction = await this.orm.startTransaction("events");
      return this.eventsEntity.create(event, {
          transaction: transaction
        })
        .then((el) => {
          transaction.commit();
          let myevent = el.get({
            plain: true
          });
          return myevent;
        }).catch(e => {
          this.log(e, 'ERROR')
          if (transaction) {
            transaction.rollback();
          }
          throw this.sanitizeSequelizeError(e);
        });
    } catch (e) {
      this.log(e, 'ERROR')
      if (transaction) {
        transaction.rollback();
      }
      throw this.sanitizeSequelizeError(e);
    }
  }

  async delete(calendarId, eventId, username) {
    let transaction = null;
    try {

      return this.eventsEntity.findOne({
          where: {
            creator: username,
            calendarId: calendarId,
            id: eventId
          }
        })
        .then(async (event) => {
          if (!event) {
            throw new nodefony.Error(`Event ${eventId}  for ${username} not found`, 404);
          }
          transaction = await this.orm.startTransaction("events");
          return event.destroy({
              transaction: transaction
            })
            .then((event) => {
              transaction.commit();
              return event;
            }).catch(e => {
              this.log(e, 'ERROR')
              transaction.rollback();
              throw this.sanitizeSequelizeError(e, 500);
            });
        })
        .catch(e => {
          this.log(e, 'ERROR')
          if (transaction) {
            transaction.rollback();
          }
          throw this.sanitizeSequelizeError(e);
        });
    } catch (e) {
      this.log(e, 'ERROR')
      if (transaction) {
        transaction.rollback();
      }
      throw this.sanitizeSequelizeError(e);
    }
  }

  async update(calendarId, eventId, username, event) {
    let transaction = null;
    try {
      if (!event) {
        throw new nodefony.Error(`Event ${eventId}  for ${username} not found`, 404);
      }
      transaction = await this.orm.startTransaction("events");
      return this.eventsEntity.update(event, {
          where: {
            creator: username,
            calendarId: calendarId,
            id: eventId
          }
        }, {
          transaction: transaction
        })
        .then((event) => {
          transaction.commit();
          return event;
        }).catch(e => {
          transaction.rollback();
          throw this.sanitizeSequelizeError(e);
        });
    } catch (e) {
      this.log(e, 'ERROR')
      if (transaction) {
        transaction.rollback();
      }
      throw this.sanitizeSequelizeError(e);
    }

  }


  patch(calendarId, eventId, username, event) {
    return new Promise.resolve(event)
  }


  watch() {
    return new Promise.resolve()
  }

  move() {
    return new Promise.resolve()
  }


  import() {
    return new Promise.resolve()
  }
};
