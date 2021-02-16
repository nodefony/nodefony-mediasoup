import nodefonyclient from 'nodefony-client';

import ViewerLoader from '../loader.js';
import ViewerController from '../controller.js'
import ViewerSettings from '../settings.js'

class VideoViewer extends nodefonyclient.Service {

  constructor(videoId, container, socketBinding, EventManager) {
    super("viewer_video", container, null, process.env);
    this.socketBinding = socketBinding;
    this.videoId = videoId;
    this.videoElement = document.getElementById(videoId);
    this.videoSourceElement = this.videoElement.getElementsByTagName('source')[0];
    this.loaded = false;

    this.controller = new ViewerController(this.socketBinding);
    this.settings = new ViewerSettings(this.socketBinding, async (url) => {
      await this.load(url);
    });

    this.loader = new ViewerLoader(this.settings, this.controller, this.socketBinding, this);
    this.eventManager = new EventManager(this, this.controller, this.settings, this.socketBinding, this.queryResolver);

    this.INIT_SYNC_TIMEOUT = this.eventManager.INIT_SYNC_TIMEOUT;
  }
  
  reset() {
    this.loaded = false;
    if (this.eventManager.reset) {
      this.eventManager.reset();
    }
  }

  unlisten() {
    this.eventManager.unlisten();
  }

  async load(url) {
    await this.loader.load(url);
  }

  async waitReady(url) {
    this.videoSourceElement.setAttribute('src', url);
    this.videoElement.load();

    // Wait the contained media to be loaded
    await this.eventManager.waitReady(url);
  }

  postMessage(message, targetOrigin = "*") {
    //TODO
  }

  /*
  //TODO ???

  async postWaitId(message, queryTimeout = 10000) {
    return await this.queryResolver.queryWaitId(message, queryTimeout);
  }

  async postWaitAny(message, queryTimeout = 10000) {
    return await this.queryResolver.queryWaitAny(message, queryTimeout);
  }
  */
}

export default VideoViewer;
