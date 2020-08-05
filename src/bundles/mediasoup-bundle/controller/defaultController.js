/**
 *	@class defaultController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/mediasoup")
 */
class defaultController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
  }

  /**
   *    @Route ("",
   *      name="route-mediasoup-bundle-mediasoup")
   */
  indexAction() {
    return this.render("mediasoup-bundle::index.html.twig", {
      name: this.bundle.name,
      description: this.bundle.package.description
    });

  }

}

module.exports = defaultController;
