
module.exports = class MediaViewerController extends nodefony.Service {

  constructor(container) {
    super("media_viewer_controller", container);
    if (!kernel.ready) {
      this.kernel.once("onReady", this.init.bind(this));
    } else {
      this.init();
    }
  }

  init() {
    this.rooms = this.get("media_viewer_rooms");
    const settings = this.get("media_viewer_settings");
    settings.on("onPolicyChange", this.updatePolicyFromSettings.bind(this));

    this.control_rooms = {};
    this.rooms.on('onRoomClosed', (room_id) => {
      delete this.control_rooms[room_id];
    });
    this.ControlTaker = require(path.resolve(this.bundle.path, "src", "reservationControl", "controlTaker.js"));
    const { AutomaticPolicy, AdminAutomaticPolicy } = require(path.resolve(this.bundle.path, "src", "reservationControl", "policy.js"));
    this.AdminAutomaticPolicy = AdminAutomaticPolicy;
    this.AutomaticPolicy = AutomaticPolicy;
    this.defaultPolicy = new this.AutomaticPolicy();
  }

  ask(client_app_data) {
    const room_id = client_app_data.room_id;
    this.control_rooms[room_id] = this.control_rooms[room_id] || this.buildPolicy(room_id, this.defaultPolicy);
    const { client_data: new_controller_client_data } = this.control_rooms[room_id].askControl(client_app_data);
    
    return {
      response: {
        broadcast: null,
        preMessage: (message_data, client_app_data) => {
          return {
            ...message_data,
            allowed: this.allowed(client_app_data)
          };
        },
        value: new_controller_client_data
      },
      authorized : this.control_rooms[room_id].hasControl(client_app_data)
    };
  }

  getCurrent(client_app_data) {
    const room_id = client_app_data.room_id;
    const controller_data = this.control_rooms[room_id] ? this.control_rooms[room_id].currentController() : null;
    return {
      broadcast: false,
      value: {
        ...controller_data,
        allowed: this.allowed(client_app_data)
      }
    };
  }

  allowed(client_app_data) {
    if (!client_app_data || !client_app_data.room_id || !this.control_rooms[client_app_data.room_id]) {
      return true;
    }
    return this.control_rooms[client_app_data.room_id].allowedControl(client_app_data);
  }

  updatePolicyFromSettings(room_id, settings_policy) {
    if (!settings_policy) {
      settings_policy = '';
    }

    switch (settings_policy) {
      case 'automatic':
        this.defaultPolicy = new this.AutomaticPolicy();
        break;
      case 'admin_only_automatic':
        this.defaultPolicy = new this.AdminAutomaticPolicy();
        break;
      default:
        break;
    }
    this.buildPolicy(room_id, this.defaultPolicy);  
  }

  buildPolicy(room_id, policy) {
    if (this.control_rooms[room_id]) {
      this.control_rooms[room_id].clearTimer();
    }
    const result = this.control_rooms[room_id] = new this.ControlTaker(policy, this.log.bind(this), this.onLost.bind(this));
    this.fire("onLost", {room_id : room_id});
    return result;
  }

  onLost(old_client_app_data) {
    this.fire("onLost", old_client_app_data);
  }

};
