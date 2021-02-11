import nodefonyclient from 'nodefony-client';
import IframeQuery from './iframeQuery.js';

import ViewerLoader from '../loader.js';
import ViewerController from '../controller.js'
import ViewerSettings from '../settings.js'

class IframeViewer extends nodefonyclient.Service {

  constructor(iframeId, container, socketBinding, EventManager) {
    super("viewer_iframe", container, null, process.env);
    this.socketBinding = socketBinding;
    this.iframeId = iframeId;
    this.iframeElement = document.getElementById(iframeId);
    this.loaded = false;

    this.queryResolver = new IframeQuery(container, this);

    this.controller = new ViewerController(this.socketBinding);
    this.settings = new ViewerSettings(this.socketBinding, async (url) => {
      await this.load(url);
    });

    this.loader = new ViewerLoader(this.settings, this.controller, this.socketBinding, this);
    this.eventManager = new EventManager(this, this.controller, this.settings, this.socketBinding);

    this.INIT_SYNC_TIMEOUT = this.eventManager.INIT_SYNC_TIMEOUT;
  }

  async waitIframeElementLoad(url) {
    return await new Promise((resolve, reject) => {
      const postInit = () => {
        this.loaded = true;
        return resolve();
      };

      this.iframeElement = document.getElementById(this.iframeId);
      this.iframeElement.setAttribute('src', url);
      this.iframeElement.setAttribute('iframe-src', url);

      if (!this.loaded) {
        this.iframeElement.onload = postInit;
      } else {
        return postInit();
      }
    });
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

  async beforeLoad() {
    this.fire("onViewerLoading", this.iframeElement);
  }

  async afterLoad() {
    this.fire("onViewerLoaded", this.iframeElement);
  }

  async load(url) {
    await this.loader.load(url);
  }

  async waitReady(url) {
    // Wait the native iframe "onload" event triggered when an iframe url is loaded
    await this.waitIframeElementLoad(url);

    // Wait the contained media to be loaded
    await this.eventManager.waitReady(url);
  }

  postMessage(message, targetOrigin = "*") {
    return this.iframeElement.contentWindow.postMessage(message, targetOrigin);
  }

  async postWaitId(message, queryTimeout = 10000) {
    return await this.queryResolver.queryWaitId(message, queryTimeout);
  }

  async postWaitAny(message, queryTimeout = 10000) {
    return await this.queryResolver.queryWaitAny(message, queryTimeout);
  }
}

export default IframeViewer;
