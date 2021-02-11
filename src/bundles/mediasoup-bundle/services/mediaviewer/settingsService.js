module.exports = class MediaViewerSettings extends nodefony.Service {

  constructor(container) {
    super("media_viewer_settings", container);
    if (!kernel.ready) {
      this.kernel.once("onReady", this.init.bind(this));
    } else {
      this.init();
    }
  }

  init() {
    const rooms = this.get("media_viewer_rooms");
    this.settings_rooms = {};
    rooms.on('onRoomClosed', (room_id) => {
      delete this.settings_rooms[room_id];
    });
  }

  setSettings(client_app_data, data) {
    if (!client_app_data || !client_app_data.client_id) { throw new Error("Bad client id"); }
    const room_id = client_app_data.room_id;
    this.settings_rooms[room_id] = this.settings_rooms[room_id] || {};

    Object.assign(this.settings_rooms[room_id], data);

    // TODO check if it is a room admin
    const room_admin = true;
    if (!room_admin) {
      throw new Error(`Current peer (${client_app_data.client_id}) is not a room admin, therefore cannot edit media settings`);
    }
    
    return { broadcast: true, value: data };
  }

  getSettings(client_app_data) {
    if (!client_app_data.room_id) { throw new Error("No room associated with this socket"); }
    return { broadcast: false, value: this.settings_rooms[client_app_data.room_id] };
  }

};
