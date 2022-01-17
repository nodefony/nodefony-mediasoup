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
  }

  /**
   *    @Method ({"GET","POST"})
   *    @Route ("/{calendarId}/events",
   *      name="route-calendar-bundle-events-list")
   */
  async listAction(calendarId) {
    try {
      let user = this.getUser();
      let start = null;
      let end = null;
      if (this.query.start) {
        start = new Date();
        start.setUTCFullYear(this.query.start.year);
        start.setUTCMonth(this.query.start.month - 1);
        if( this.query.start.hasDay){
          start.setUTCDate(this.query.start.day)
        }else{
          start.setUTCDate(1)
        }
        if(this.query.start.hasTime){
          start.setUTCHours(this.query.start.hour, this.query.start.minute, 59)
        }else{
          start.setUTCHours(0, 0, 0)
        }
        //console.log(this.query.start, start)
      }
      if (this.query.end) {
        end = new Date();
        end.setUTCFullYear(this.query.end.year);
        end.setUTCMonth(this.query.end.month - 1);
        if( this.query.end.hasDay){
          end.setUTCDate(this.query.end.day)
        }else{
          end.setUTCDate(1)
        }
        if(this.query.end.hasTime){
          end.setUTCHours(this.query.end.hour, this.query.end.minute, 59)
        }else{
          end.setUTCHours(23, 59, 59)
        }
        //console.log(this.query.end, end)
      }
      //console.log(start, end)
      let res = await this.eventsService.list(calendarId, user.username, start, end)
      return this.api.render(res);
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
      return this.api.render(res);
    } catch (e) {
      throw e;
    }
  }
}

module.exports = eventsController;
