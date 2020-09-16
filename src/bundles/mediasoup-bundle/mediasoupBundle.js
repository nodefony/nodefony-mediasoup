/**
 *	The class is a **`mediasoup` BUNDLE** .
 *	@module nodefony-mediasoup
 *	@main nodefony-mediasoup
 *	@class mediasoupBundle
 *	@constructor
 *	@param {string} name
 *	@param {class} kernel
 *	@param {class} container
 *
 */

class mediasoupBundle extends nodefony.Bundle {

  constructor(name, kernel, container) {
    // Mother Class constructor
    super(name, kernel, container);
    // Load core bundle library
    //this.autoLoader.loadDirectory( path.resolve( this.path, "src" ) );

    /*
     *	If you want kernel wait mediasoup event <<onReady>>
     *
     *      this.waitBundleReady = true ;
     */
  }
}

module.exports = mediasoupBundle;
