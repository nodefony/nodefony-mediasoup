/**
 *	The class is a **`calendar` BUNDLE** .
 *	@module nodefony-mediasoup
 *	@main nodefony-mediasoup
 *	@class calendarBundle
 *	@constructor
 *	@param {string} name
 *	@param {class} kernel
 *	@param {class} container
 *
 */

class calendarBundle extends nodefony.Bundle {

  constructor(name, kernel, container) {
    // Mother Class constructor
    super(name, kernel, container);

    // Load core bundle library
    //this.autoLoader.loadDirectory( path.resolve( this.path, "src" ) );

    /*
     *	If you want kernel wait calendar event <<onReady>>
     *
     *      this.waitBundleReady = true ;
     */
  }
}

module.exports = calendarBundle;
