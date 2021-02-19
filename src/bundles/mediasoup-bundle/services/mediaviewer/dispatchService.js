module.exports = class MediaViewerDispatcher extends nodefony.Service {

  constructor(container) {
    super("media_viewer_dispatcher", container);
    if (!kernel.ready) {
      this.kernel.once("onReady", this.init.bind(this));
    } else {
      this.init();
    }
  }

  init() {
    this.sync = this.get("media_viewer_synchronizer");
    this.control = this.get("media_viewer_controller");
    this.rooms = this.get("media_viewer_rooms");
    this.settings = this.get("media_viewer_settings");

    this.listenEvents();

    this.actions_dispatcher = {
      control: { do: (client_app_data) => this.control.ask(client_app_data).response  },
      sync: { 
        get: { do: (client_app_data, data) => this.sync.getMedia(client_app_data, data) },
        set: { do: (client_app_data, data) => this.sync.setMedia(client_app_data, data) }
      },
      settings: { 
        get: { do: (client_app_data) => this.settings.getSettings(client_app_data) }, 
        set: { do: async (client_app_data, data) => await this.settings.setSettings(client_app_data, data) }
      }
    };
  }

  listenEvents() {
    this.control.on("onLost", (old_client_app_data) => {
      try {
        this.rooms.sendAll(old_client_app_data, {
          action: "control",
          data: null
        });
      } catch(e) {
        // Client does not exist anymore => not important
        this.log(e, "WARNING");
      }
    });
  }

  buildResponseMessage(msg_id, client_id, data, action, method) {
    return {
      id: msg_id,
      client_id: client_id,
      action: action,
      method: method,
      data: data
    };
  }

  sendBackResponse(client_app_data, message, service_output) {
    const should_broadcast = service_output.broadcast;
    const response = this.buildResponseMessage(message.id, message.client_id, service_output.value, message.action, message.method);
    if (should_broadcast === true) {
      this.rooms.broadcastMessage(client_app_data, response);
    } else if (should_broadcast === false) {
      this.rooms.sendMessage(client_app_data, response);
    } else {
      this.rooms.sendAll(client_app_data, response);
    }
  }

  // Upper level protocol
  async handle(message, client_app_data) {
    let current_action = this.actions_dispatcher[message.action];
    if (!current_action) {
      throw new Error(`Unknown action request '${message.action}'`);
    }

    if (message.method) {
      current_action = current_action[message.method];
    }

    if (!current_action || !current_action.do) {
      throw new Error(`Unknown method request '${message.method}'`);
    }

    const service_output = await current_action.do(client_app_data, message.data);
    if (!service_output) {
      this.log(`Empty '${message.action}' service output`, "DEBUG");
      return;
    }

    if (Array.isArray(service_output)) {
      for (const output of service_output) {
        this.sendBackResponse(client_app_data, {...message, action: output.action}, output);
      }
    } else {
      this.sendBackResponse(client_app_data, message, service_output);
    }
  }

};
