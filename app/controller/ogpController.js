/**
 *	@class ogpController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 */
const ogp = require('ogp-parser');

class ogpController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
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

module.exports = ogpController;
