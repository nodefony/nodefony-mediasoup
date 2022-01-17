/**
 *	@class icsController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/api/ics/calendar")
 */
class icsController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
    this.icsService = this.get("Ics");
    this.api = new nodefony.api.OpenApi({
      name: "calendar-api-ics",
      version: this.bundle.version,
      description: "Nodefony Calendar Api ics",
      basePath: "/api/ics/calendar"
    }, this.context);
  }

  /**
   *    @Route ("",
   *      name="route-calendar-bundle-ics")
   */
  indexAction() {
    return this.renderJson({});

  }
}

module.exports = icsController;
