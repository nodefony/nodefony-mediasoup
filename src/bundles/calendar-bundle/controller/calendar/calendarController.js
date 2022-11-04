/**
 *	@class calendarController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/api/calendar")
 */
class calendarController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
    this.calendarService = this.get("calendar");
    this.api = new nodefony.api.OpenApi({
      name: "calendar-api",
      version: this.bundle.version,
      description: "Nodefony Calendar Api",
      basePath: "/api/calendar"
    }, this.context);
  }

  /**
   *    @Method ({"GET"})
   *    @Route ("",
   *      name="route-calendar-bundle-calendar-primary")
   */
  async primaryAction() {
    let user = this.getUser()
    let res = await this.calendarService.getPrimaryCalendar(user.username)
    return this.api.render(res);
  }

  /**
   *    @Method ({"GET"})
   *    @Route ("/list",
   *      name="route-calendar-bundle-calendar-list")
   */
  async listAction() {
    let user = this.getUser()
    let res = await this.calendarService.list(user.username)
    return this.api.render(res);
  }

  /**
   *    @Method ({"GET"})
   *    @Route ("/calendar/{id}",
   *      name="route-calendar-bundle-calendar-get")
   */
  async getAction(id) {
    let user = this.getUser();
    let res = await this.calendarService.getCalendar(id, user.username)
    return this.api.render(res);
  }

}

module.exports = calendarController;
