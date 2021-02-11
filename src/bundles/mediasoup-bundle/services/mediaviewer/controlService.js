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
    this.control_rooms = {};
    this.rooms.on('onRoomClosed', (room_id) => {
      delete this.control_rooms[room_id];
    });
    this.ControlTaker = require(path.resolve(this.bundle.path, "src", "reservationControl", "controlTaker.js"));
    const { AutomaticPolicy } = require(path.resolve(this.bundle.path, "src", "reservationControl", "policy.js"));
    this.defaultPolicy = new AutomaticPolicy();
  }

  ask(client_app_data) {
    const room_id = client_app_data.room_id;
    this.control_rooms[room_id] = this.control_rooms[room_id] || new this.ControlTaker(client_app_data.room_id, this.rooms, this.defaultPolicy, this.log.bind(this), this.onLost.bind(this));
    const {client_id:new_controller_client_id, peer_data:new_controller_peer_data} = this.control_rooms[room_id].askControl(client_app_data.client_id);
    let response = { broadcast: null };
    if (new_controller_peer_data) { 
      response.value = { client_id: new_controller_client_id, peer_data: new_controller_peer_data };
    }

    return {
      response: response,
      authorized : this.control_rooms[room_id].hasControl(client_app_data.client_id)
    };
  }

  onLost(old_client_app_data) {
    this.fire("onLost", old_client_app_data);
  }

};
