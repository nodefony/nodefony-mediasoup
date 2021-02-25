class ViewerSettings {

  constructor(socketBinding) {
    this.socketBinding = socketBinding;
    this.data = {
      mediaUrl: null,
      eventsPerSecond: 30,
      controlPolicy: 'automatic'
    };
    this.oldMediaUrl = null;

    // Used by loader only (to reload current media to another URL)
    this.onUrlChanged = async () => {};

    this.events = new Map([["onSettings", async (settings, method) => {
      if (settings) {
        const url_changed = this.oldMediaUrl != settings.mediaUrl;
        this.update(settings);
        this.oldMediaUrl = this.data.mediaUrl;
        if (method == "set" && url_changed) {
          await this.onUrlChanged("https://" + settings.mediaUrl);
        }
      }
    }], ["onDisconnected", (event) => {
      this.unlisten();
    }]]);

    this.listen();
  }

  listen() {
    for (const [name, listener] of this.events) {
      this.socketBinding.removeListener(name, listener);
      this.socketBinding.on(name, listener);
    }
  }

  unlisten() {
    for (const [name, listener] of this.events) {
      this.socketBinding.removeListener(name, listener);
    }
  }

  async updateServerSettings(new_settings) {
    await this.socketBinding.sendWait({
      action: "settings",
      method: "set",
      data: new_settings
    });

    this.oldMediaUrl = this.data.mediaUrl;
  }

  update(settings) {
    Object.assign(this.data, settings);
  }

  async queryServerSettings() {
    await this.socketBinding.sendWait({
      action: "settings",
      method: "get"
    });

    return this.data;
  }

}

export default ViewerSettings;
