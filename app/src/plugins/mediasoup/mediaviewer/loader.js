class ViewerLoader {

  constructor(settings, controller, socketBinding, media) {
    this.socketBinding = socketBinding;
    this.settings = settings;
    this.media = media;
    this.controller = controller;

    this.settings.onUrlChanged = async (url) => {
      await this.load(url);
    };
  }

  async initialize_(url) {
    this.socketBinding.reset();
    this.controller.reset();
    this.media.reset();

    // Ensure that we do not transmit any sync message during initialization
    // By forcing control disabled
    await this.controller.doAvoidControl(async () => {
      // Use current settings and deduce the current media URL
      // (Be careful, settings have to be up-to-date from server before calling loader.load(url))
      if (this.settings.data.mediaUrl) {
        url = "https://" + this.settings.data.mediaUrl;
      } else {
        this.settings.data.mediaUrl = url.replace("https://", "");
      }

      // Ignoring sync events from socket during this part of initialization, because media is not loaded
      await this.socketBinding.doIgnoreSync(async () => {
        await this.media.waitReady(url);
      });
    });
  }

  async loadCurrentRoomMediaStateFromServer_() {
    // Ensure that we do not transmit any sync message during initialization
    // Because those events are already known by server
    await this.controller.doAvoidControl(async () => {
      if (this.media.onInitFromServer) {
        await this.media.onInitFromServer();
      }
      // Force local sync from remote data
      await this.socketBinding.sendWait({
        action: "sync",
        method: "get",
        data: {
          media_id: this.settings.data.mediaUrl
        }
      });

      // Control policy & current controller
      await this.socketBinding.sendWait({
        action: "control",
        method: "get"
      });
    }, this.media.INIT_SYNC_TIMEOUT);
  }

  async load(url) {
    this.media.fire("onViewerLoading");
    await this.initialize_(url);
    await this.loadCurrentRoomMediaStateFromServer_();
    this.media.fire("onViewerLoaded");
  }

}

export default ViewerLoader;
