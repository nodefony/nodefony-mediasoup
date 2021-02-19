module.exports = class MediaViewerSynchronizer extends nodefony.Service {

  constructor(container) {
    super("media_viewer_synchronizer", container);
    if (!kernel.ready) {
      this.kernel.once("onReady", this.init.bind(this));
    } else {
      this.init();
    }
  }

  init() {
    this.control = this.get("media_viewer_controller");
    const rooms = this.get("media_viewer_rooms");
    this.data_rooms = {};
    rooms.on('onRoomClosed', (room_id) => {
      delete this.data_rooms[room_id];
    });
  }

  setMedia(client_app_data, data) {
    const control = this.control.ask(client_app_data);
    if (!control.authorized) {
      this.log(`${client_app_data.client_id} has currently no control, therefore the ${data.action} sync action is dropped`, `WARNING`);
      return;
    }

    let responses = [];
    if (control.response.value) {
      responses.push({ action: "control", ...control.response });
    }

    if (data.persist) {
      // Update room media state storage
      const room_id = client_app_data.room_id;
      this.data_rooms[room_id] = this.data_rooms[room_id] || {};
      this.data_rooms[room_id][data.media_id] = this.data_rooms[room_id][data.media_id]|| {};
      this.data_rooms[room_id][data.media_id][data.action] = this.data_rooms[room_id][data.media_id][data.action] || {};
      Object.assign(this.data_rooms[room_id][data.media_id][data.action], data);
    }

    // Take control and duplicate media data to other peers
    responses.push({ action: "sync", broadcast: true, value: data });        
    
    return responses;
  }

  valueOrEmpty(room_id, media_id) {
    if (!this.data_rooms[room_id] || !this.data_rooms[room_id][media_id]) {
      return {};
    }
    return this.data_rooms[room_id][media_id];
  }

  getMedia(client_app_data, data) {
    if (!client_app_data.room_id) { throw new Error("No room associated with this socket"); }
    // Assign stored data to one peer
    return { broadcast: false, value: this.valueOrEmpty(client_app_data.room_id, data.media_id) };
  }

};
