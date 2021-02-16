import VideoEventListener from './videoEventListener.js';
import VideoSocketListener from './socketListener.js';

class VideoManager {

  constructor(video, controller, settings, socketBinding) {
    this.video = video;
    this.controller = controller;
    this.settings = settings;
    this.socketBinding = socketBinding;

    this.videoEventListener = new VideoEventListener(this.video, this.controller, this.socketBinding, this.settings, this.video.queryResolver);
    this.socketListener = new VideoSocketListener(this.video, this.controller, this.socketBinding);

    this.INIT_SYNC_TIMEOUT = 500;
  }

  reset() {
    this.unlisten();
    this.listen();
  }

  async waitReady() {
    // Wait the media load
    // await this.videoEventListener.waitMediaLoad();
  }

  listen() {
    this.videoEventListener.listen();
    this.socketListener.listen();
  }

  unlisten() {
    this.videoEventListener.unlisten();
    this.socketListener.unlisten();
  }

}

export default VideoManager;
