class ViewerSettings {

  constructor(socketBinding, loader_function) {
    this.socketBinding = socketBinding;
    this.data = {
      mediaUrl: null,
      eventsPerSecond: 30,
      controlPolicy: 'automatic'
    };
    this.oldMediaUrl = null;
    this.loader_function = loader_function;

    this.events = new Map([["onSettings", async (settings, method) => {
      if (settings) {
        const url_changed = this.oldMediaUrl != settings.mediaUrl;
        Object.assign(this.data, settings);
        this.oldMediaUrl = this.data.mediaUrl;
        if (method == "set" && url_changed) {
          await this.loader_function("https://" + settings.mediaUrl);
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

  refreshBroadcastSettings(new_settings, old_settings) {
    this.socketBinding.send({
      action: "settings",
      method: "set",
      data: this.data
    });

    this.oldMediaUrl = old_settings.mediaUrl;
  }
}

export default ViewerSettings;
