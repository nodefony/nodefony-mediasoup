/**
 *	@class eventsController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/api/events/calendar")
 */
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
      if (this.query.start) {
        start = new Date();
        start.setUTCFullYear(this.query.start.year);
        start.setUTCMonth(this.query.start.month - 1);
        if (this.query.start.hasDay) {
          start.setUTCDate(this.query.start.day)
        } else {
          start.setUTCDate(1)
        }
        if (this.query.start.hasTime) {
          start.setUTCHours(this.query.start.hour, this.query.start.minute, 59)
        } else {
          start.setUTCHours(0, 0, 0)
        }
        //console.log(this.query.start, start)
      }
      if (this.query.end) {
        end = new Date();
        end.setUTCFullYear(this.query.end.year);
        end.setUTCMonth(this.query.end.month - 1);
        if (this.query.end.hasDay) {
          end.setUTCDate(this.query.end.day)
        } else {
          end.setUTCDate(1)
        }
        if (this.query.end.hasTime) {
          end.setUTCHours(this.query.end.hour, this.query.end.minute, 59)
        } else {
          end.setUTCHours(23, 59, 59)
        }
        //console.log(this.query.end, end)
      }
      const oneDay = 24*60*60*1000
      switch(this.query.end.type){
        case "week":
        case "4day":
          start = new Date(start.getTime()-oneDay);
          end = new Date(end.getTime()+oneDay);
        break;
        case "day":
          end = new Date(end.getTime()+oneDay);
        break;
        case "month":
        break;
      }
      //console.log(start, end)
      let res = await this.eventsService.list(calendarId, user.username, start, end)
      //console.log(res)
      return this.api.render(res)
      .catch(e=>{
        throw e;
      })
    } catch (e) {
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
      .catch(e=>{
        throw e;
      })
    } catch (e) {
      throw e;
    }
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
      let res = await this.eventsService.insert(calendarId, user.username, {
        calendarId: calendarId,
        start: this.query.event.start,
        end: this.query.event.end,
        colorId: this.query.event.color,
        summary: this.query.event.name,
        creator: user.username
      })
      return this.api.render(res)
      .catch(e=>{
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
      let res = await this.eventsService.insert(calendarId, user.username, {
        calendarId: calendarId,
        start: this.query.event.start,
        summary: this.query.event.name,
        creator: user.username
      })
      return this.api.render(res)
      .catch(e=>{
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
      .catch(e=>{
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
      let res = await this.eventsService.update(calendarId, id, user.username, {
        event:this.query.event
      })
      return this.api.render(res)
      .catch(e=>{
        throw e;
      })
    } catch (e) {
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
      let res = await this.eventsService.patch(calendarId, id, user.username, {
        event:this.query.event
      })
      return this.api.render(res)
      .catch(e=>{
        throw e;
      })
    } catch (e) {
      throw e;
    }
  }

}

module.exports = eventsController;
