/**
 *	@class eventsController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/api/events/calendar")
 */
const oneDay = 24 * 60 * 60 * 1000
const month = oneDay *31
//const {tz} = require("moment-timezone");
const moment = require('moment-timezone');
const tz = moment.tz;


class eventsController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
    this.eventsService = this.get("events");
    this.api = new nodefony.api.OpenApi({
      name: "calendar-api-events",
      version: this.bundle.version,
      description: "Nodefony Events Calendar Api",
      basePath: "/api/events/calendar"
    }, this.context);
    /*this.prependListener("onError",async (e)=>{
      switch(e.code){
        case 404:
          return this.api.renderError(e, 404,"not found")
        break
        default:
          return this.api.renderError(e)
      }
    })*/
  }

  /**
   *    @Method ({"GET"})
   *    @Route ("/{calendarId}/events",
   *      name="route-calendar-bundle-events-list")
   */
  async listAction(calendarId) {
    try {
      let user = this.getUser();
      let start = null;
      let end = null;
      this.query.start = JSON.parse(this.query.start)
      this.query.end = JSON.parse(this.query.end)
      this.query.timezone = JSON.parse(this.query.timezone)
      //console.log( this.query.start, this.query.end)

      if (this.query.start) {
        //start = tz(this.query.start.date, this.query.timezone.zone);
        start = moment(this.query.start.date);
        //start = new Date();
        //start.setUTCFullYear(this.query.start.year);
        //start.setUTCMonth(this.query.start.month - 1);
        //if (this.query.start.hasDay) {
        //  start.setUTCDate(this.query.start.day)
        //} else {
        //  start.setUTCDate(1)
        //}
        if (this.query.start.hasTime) {
          //start.setUTCHours(this.query.start.hour, this.query.start.minute, 59)
          start.set('hour', this.query.start.hour);
          start.set('minute', this.query.start.minute);
          start.set('second', 59);
        } else {
          start.set('hour', 0);
          start.set('minute', 0);
          start.set('second', 0);
          //start.setUTCHours(0, 0, 0)
        }
        //console.log(this.query.start, start)
      }
      if (this.query.end) {
        //end = tz(this.query.end.date, this.query.timezone.zone);
        end = moment(this.query.end.date);
        //end = new Date();
        //end.setUTCFullYear(this.query.end.year);
        //end.setUTCMonth(this.query.end.month - 1);
        /*if (this.query.end.hasDay) {
          end.setUTCDate(this.query.end.day)
        } else {
          end.setUTCDate(1)
        }*/
        if (this.query.end.hasTime) {
          //end.setUTCHours(this.query.end.hour, this.query.end.minute, 59)
          end.set('hour', this.query.end.hour);
          end.set('minute', this.query.end.minute);
          end.set('second', 59);
        } else {
          end.set('hour', 23);
          end.set('minute', 59);
          end.set('second', 59);
          //end.setUTCHours(23, 59, 59)
        }
        //console.log(this.query.end, end)
      }

      /*let interval = 0
      switch (this.query.end.type) {
      case "week":
      case "4day":
      case "day":
        interval = oneDay
        //start = new Date(start.getTime() - oneDay);
        //end = new Date(end.getTime() + oneDay);
        break;
      case "month":
        interval = month
        break;
      }*/
      //console.log(start, end)
      let res = await this.eventsService.list(calendarId, user.username, start, end)
      //console.log(res)
      return this.api.render(res)
        .catch(e => {
          throw e;
        })
    } catch (e) {
      throw e;
    }
  }

  /**
   *    @Method ({"GET"})
   *    @Route ("/{calendarId}/month/events",
   *      name="route-calendar-bundle-events-list-mounth")
   */
  async listMonthAction(calendarId) {
    try {
      let user = this.getUser();
      if (this.query.month) {
        this.query.month = JSON.parse(this.query.month)
        //const date = new Date(this.query.month);
        //const start = new Date(date.getFullYear(), date.getMonth(), 1);
        //const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        //end.setUTCHours(23, 59, 59)

        const start =moment(this.query.month).startOf('month')
        const end = moment(this.query.month).endOf('month')
        end.set('hour', 23);
        end.set('minute', 59);
        end.set('second', 59);
        console.log("month", start, end)

        let res = await this.eventsService.list(calendarId, user.username, start, end)
        return this.api.render(res)
          .catch(e => {
            throw e;
          })
      }
    } catch (e) {
      this.log(e,"ERROR")
      throw e;
    }
  }

  /**
   *    @Method ({"GET"})
   *    @Route ("/{calendarId}/events/{id}",
   *      name="route-calendar-bundle-events-get")
   */
  async eventAction(calendarId, id) {
    try {
      let user = this.getUser();
      let res = await this.eventsService.list(calendarId, user.username)
      return this.api.render(res)
        .catch(e => {
          throw e;
        })
    } catch (e) {
      throw e;
    }
  }

  formatEvent(calendarId, event, user= null){
    let start = moment(event.start)
    let end = moment(event.end)
    let myTZ = "";
    if( event.timeZone){
      myTZ = event.timeZone
    }else{
      if( event.calendar){
        myTZ = event.calendar.timeZone
      }
    }
    event.calendarId = calendarId
    event.start = {
      date: start.format("YYYY-MM-DD"),
      dateTime: event.start,
      timeZone: myTZ,
      iso: tz(start, myTZ).toISOString()
    }
    event.end = {
      date: end.format("YYYY-MM-DD"),
      dateTime: event.end,
      timeZone: myTZ,
      iso: tz(end, myTZ).toISOString()
    }
    if( user){
      event.creator = user.username
    }
    return event
  }

  /**
   *    insert event
   *    @Method ({"POST"})
   *    @Route ("/{calendarId}/events",
   *      name="route-calendar-bundle-events-insert")
   */
  async insertAction(calendarId) {
    try {
      let user = this.getUser();
      let event = this.formatEvent(calendarId, this.query.event, user)
      let res = await this.eventsService.insert(calendarId, user.username, event)
      return this.api.render(res)
        .catch(e => {
          throw e;
        })
    } catch (e) {
      throw e;
    }
  }

  /**
   *    quickAdd event
   *    @Method ({"POST"})
   *    @Route ("/{calendarId}/quickadd/events",
   *      name="route-calendar-bundle-events-quickAdd")
   */
  async quickAddAction(calendarId) {
    try {
      let user = this.getUser();
      let event = this.formatEvent(calendarId, this.query.event, user)
      let res = await this.eventsService.insert(calendarId, user.username, event)
      return this.api.render(res)
        .catch(e => {
          throw e;
        })
    } catch (e) {
      throw e;
    }
  }

  /**
   *    @Method ({"DELETE"})
   *    @Route ("/{calendarId}/events/{id}",
   *      name="route-calendar-bundle-events-delete")
   */
  async deleteAction(calendarId, id) {
    try {
      let user = this.getUser();
      let res = await this.eventsService.delete(calendarId, id, user.username)
      return this.api.render(res)
        .catch(e => {
          throw e;
        })
    } catch (e) {
      throw e;
    }
  }

  /**
   *    @Method ({"PUT"})
   *    @Route ("/{calendarId}/events/{id}",
   *      name="route-calendar-bundle-events-update")
   */
  async updateAction(calendarId, id) {
    try {
      let user = this.getUser();
      let event = this.formatEvent(calendarId, this.query.event)
      console.log(event)
      let res = await this.eventsService.update(calendarId, id, user.username, event)
      return this.api.render(res)
        .catch(e => {
          this.log(e,'ERROR')
          throw e;
        })
    } catch (e) {
      this.log(e,'ERROR')
      throw e;
    }
  }
  /**
   *    @Method ({"PATCH"})
   *    @Route ("/{calendarId}/events/{id}",
   *      name="route-calendar-bundle-events-patch")
   */
  async patchAction(calendarId, id) {
    try {
      let user = this.getUser();
      let event = this.formatEvent(calendarId, this.query.event)
      let res = await this.eventsService.patch(calendarId, id, user.username, event)
      return this.api.render(res)
        .catch(e => {
          throw e;
        })
    } catch (e) {
      throw e;
    }
  }

}

module.exports = eventsController;
