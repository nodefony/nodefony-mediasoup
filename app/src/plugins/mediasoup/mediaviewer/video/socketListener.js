class VideoSocketListener {

  constructor(video, controller, socketBinding) {
    this.video = video;
    this.controller = controller;
    this.socketBinding = socketBinding;

    this.socketEvents = new Map([
      ["play", async (media_message) => {
        this.video.videoElement.play();
      }],
      ["pause", async (media_message) => {
        this.video.videoElement.pause();
      }],
      ["seek", async (media_message) => {
        this.video.videoElement.currentTime = media_message.data;
      }],
      ["onDisconnected", (event) => {
        this.unlisten();
      }]
    ]);

    this.listen();
  }

  reset() {
    this.unlisten();
    this.listen();
  }

  listen() {
    for (const [name, listener] of this.socketEvents) {
      this.socketBinding.removeListener(name, listener);
      this.socketBinding.on(name, listener);
    }
  }

  unlisten() {
    for (const [name, listener] of this.socketEvents) {
      this.socketBinding.removeListener(name, listener);
    }
  }

}

export default VideoSocketListener;
