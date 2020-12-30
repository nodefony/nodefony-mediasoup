/**
 *	@class appController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 */
const ogp = require('ogp-parser');

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
    if (this.context.originUrl.pathname === "/app/login"){
      this.session.destroy();
    }
    return this.render("app::index.html.twig", {
      name: this.kernel.projectName,
      description: this.kernel.package.description
    });
  }

  /**
   *    @Route ("/service/ogp",
   *      name="ogp")
   */
  async ogpAction() {
    this.setJsonContext();
    const url = this.query.url;
    let res = await ogp(url, {
        skipOembed: true
      })
      .then((data) => {
        this.log(JSON.stringify(data, null, "    "));
        return data;
      }).catch(function (error) {
        throw error;
      });
    return this.renderJson(res);
  }


}

module.exports = appController;
