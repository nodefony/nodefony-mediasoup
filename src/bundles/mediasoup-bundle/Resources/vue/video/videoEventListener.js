
class VideoEventListener {

  constructor(video, controller, socketBinding, settings, queryResolver) {
    this.video = video;
    this.socketBinding = socketBinding;
    this.queryResolver = queryResolver;
    this.settings = settings;
    this.controller = controller;

    this.events = new Map([
      [ "playing", () => {
        this.syncIfControl("play");
      }],
      [ "pause", () => {
        this.syncIfControl("pause", false);
      }],
      [ "seeking", () => {
        this.syncIfControl("seek", this.video.videoElement.currentTime);
      }],
      ["onDisconnected", (event) => {
        this.unlisten();
      }]
    ]);
    this.listen();
  }

  // Video events
  listen() {
    this.unlisten();
    for (const [name, listener] of this.events) {
      this.video.videoElement.addEventListener(name, listener);
    }
  }

  unlisten() {
    for (const [name, listener] of this.events) {
      this.video.videoElement.removeEventListener(name, listener);
    }
  }

  syncIfControl(action, data, persist = true) {
    return this.controller.syncIfControl(this.settings.data.mediaUrl, action, data, persist);
  }

}

export default VideoEventListener;
