/**
 *	@class apiController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/room/api")
 */
class apiRomController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    //this.startSession();
    this.roomsService = this.get("Rooms");
    // start session
    this.orm = this.getORM();
    this.entity = this.orm.getEntity("room");
    this.api = new nodefony.api.Json({
      name: "room",
      version: this.bundle.version,
      description: "Bundle Api",
    }, this.context);
  }
  /**
   *  API GET
   *    @Route ("",
   *      name="route-rooms")
   *    @Method ({"GET"})
   */
  async roomsAction() {
    const room = await this.entity.findAndCountAll();
    return this.api.render(
      room
    );
  }
}

module.exports = apiRomController;
