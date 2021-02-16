
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
        this.syncIfControl("pause");
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

  syncIfControl(action, data) {
    if (!this.controller.canTakeControl()) {
      return;
    }
    this.socketBinding.send({
      action: "sync",
      method: "set",
      data: {
        action: action,
        media_id: this.settings.data.mediaUrl,
        data: data
      }
    });
  }

}

export default VideoEventListener;
