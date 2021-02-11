import PdfIframeEventListener from './iframeListener.js';
import PdfSocketListener from './socketListener.js';

class PdfIframeManager {

  constructor(iframe, controller, settings, socketBinding) {
    this.iframe = iframe;
    this.controller = controller;
    this.settings = settings;
    this.socketBinding = socketBinding;

    this.iframeEventListener = new PdfIframeEventListener(this.iframe, this.controller, this.socketBinding, this.settings, this.iframe.queryResolver);
    this.socketListener = new PdfSocketListener(this.iframe, this.controller, this.socketBinding);
  }

  reset() {
    this.unlisten();
    this.listen();
  }

  async waitReady() {
    // Wait the media load, which is inside the iframe
    //await this.iframeEventListener.waitIframeMediaLoad();
  }

  listen() {
    this.iframeEventListener.listen();
    this.socketListener.listen();
  }

  unlisten() {
    this.iframeEventListener.unlisten();
    this.socketListener.unlisten();
  }

}

export default PdfIframeManager;
