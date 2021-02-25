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
    this.rooms = this.get("media_viewer_rooms");
    this.settings_rooms = {};
    this.sharing_clients_rooms = {};
    this.media_validators = [];

    this.rooms.on('onRoomClosed', (room_id) => {
      delete this.settings_rooms[room_id];
      delete this.sharing_clients_rooms[room_id];
    });

    this.rooms.on('onDisconnect', (client_app_data) => {
      if (this.sharing_clients_rooms[client_app_data.room_id] == client_app_data.client_id) {
        this.stopSharingMedia(client_app_data);
      }
    });
  }

  async canShareMedia(client_app_data, media) {
    const room_id = client_app_data.room_id;
    let can_share = this.sharing_clients_rooms[room_id] ?
      (this.sharing_clients_rooms[room_id] == client_app_data.client_id) : true;

    // If a media is currently shared, only admin can edit settings / change media, or the current peer sharing
    if (!can_share) {
      const room_admin = await this.rooms.refreshRoomAdmin(client_app_data);
      if (!room_admin) {
        this.log(`Current peer (${client_app_data.client_id}) is not a room admin, therefore cannot edit media settings`, "ERROR");
        return false;
      }
    }

    for (const validator of this.media_validators) {
      if (!validator.isMediaValid(media)) {
        this.log(`Unable to share media '${media.mediaUrl}' because it is not considered as valid from a validator`, "ERROR");
        return false;
      }
    }

    return true;
  }

  async setSettings(client_app_data, data) {
    if (!client_app_data || !client_app_data.client_id) { throw new Error("Bad client id"); }
    const room_id = client_app_data.room_id;

    if (!await this.canShareMedia(client_app_data, data)) {
      return;
    }

    this.settings_rooms[room_id] = this.settings_rooms[room_id] || {};

    const old_control_policy = this.settings_rooms[room_id].controlPolicy;
    Object.assign(this.settings_rooms[room_id], data);
    const new_control_policy = this.settings_rooms[room_id].controlPolicy;
    if (old_control_policy != new_control_policy) {
      this.fire("onPolicyChange", room_id, new_control_policy);
    }

    this.shareMedia(client_app_data, !!data.mediaUrl);

    return { broadcast: null, value: data };
  }

  shareMedia(client_app_data, validMedia) {
    const room_id = client_app_data.room_id;
    const client_id = client_app_data.client_id;
    const sharing_change = !this.sharing_clients_rooms[room_id] || this.sharing_clients_rooms[room_id] != client_id;
    if (validMedia && sharing_change) {
      this.startSharingMedia(client_app_data)
    } else if (this.sharing_clients_rooms[room_id] && !validMedia) {
      this.stopSharingMedia(client_app_data);
    }
  }

  startSharingMedia(client_app_data) {
    const room_id = client_app_data.room_id;
    this.sharing_clients_rooms[room_id] = client_app_data.client_id;
    this.log(`Sharing client in room ${room_id} is now ${client_app_data.client_id}`, "INFO");
    //TODO add type media in  this.settings_rooms
    this.fire("onOpenMedia", room_id, client_app_data.peer.peer_id, this.settings_rooms[room_id]);
  }

  stopSharingMedia(client_app_data) {
    const room_id = client_app_data.room_id;
    this.sharing_clients_rooms[room_id] = null;
    this.log(`No more sharing client in room ${room_id}`, "INFO");
    this.fire("onCloseMedia", room_id, client_app_data.peer.peer_id);
  }

  addMediaValidator(validator) {
    this.media_validators.push(validator);
  }

  getSettings(client_app_data) {
    if (!client_app_data.room_id) { throw new Error("No room associated with this socket"); }
    return { broadcast: false, value: this.settings_rooms[client_app_data.room_id] };
  }

};
