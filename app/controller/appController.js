/**
 *	@class appController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 */

class appController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
  }

  /**
   *    @Route ("/app/*",
   *      name="App")
   */
  async appAction() {
    console.log("passss", this.context.originUrl.pathname)
    if (this.context.originUrl.pathname === "/app/login"){
      await this.session.destroy();
    }
    return this.render("app::index.html.twig", {
      name: this.kernel.projectName,
      description: this.kernel.package.description
    });
  }

}

module.exports = appController;
