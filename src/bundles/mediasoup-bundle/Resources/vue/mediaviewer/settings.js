class ViewerSettings {

  constructor(socketBinding, loader_function) {
    this.socketBinding = socketBinding;
    this.data = {
      mediaUrl: null,
      eventsPerSecond: 30,
      controlPolicy: 'automatic'
    };
    this.loader_function = loader_function;

    this.events = new Map([["onSettings", async (settings, method) => {
      if (settings) {
        const old_url = this.data.mediaUrl;
        Object.assign(this.data, settings);
        if (method == "set" && old_url != settings.mediaUrl) {
          await this.loader_function(settings.mediaUrl);
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

    if (old_settings.mediaUrl != new_settings.mediaUrl) {
      this.loader_function(new_settings.mediaUrl);
    }
  }
}

export default ViewerSettings;
