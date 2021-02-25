module.exports = class MediaViewerRooms extends nodefony.Service {

  constructor(container) {
    super("media_viewer_rooms", container);
    this.rooms = {};
    if (!this.kernel.ready) {
      this.kernel.once("onReady", () => {
        this.init();
      });
    } else {
      this.init();
    }
  }

  init() {
    this.users = this.get("users");
    this.mediasoupRooms = this.get("Rooms");
  }

  async findPeerData(peerid) {
    return this.users.findOne(peerid)
      .then((response) => {
        const {
          username,
          name,
          surname
        } = response;
        return {
          username,
          name,
          surname
        };
      })
      .catch((e) => {
        this.log(e, "WARNING");
        return null;
      });
  }

  async handshake(peer_id, room_id, context) {
    let id = this.declareClient(room_id, context);
    let message = `Connect client ${id} in room ${room_id}`;

    if (context.client_app_data) {
      throw new Error('WebSocket application data is already provided for this client');
    }

    const peer_data = await this.findPeerData(peer_id);
    if (!peer_id) {
      throw new Error(`Invalid peer id ${peer_id}`);
    }

    // Setup the client associated data in the websocket context
    context.client_app_data = {
      room_id: room_id,
      client_id: id,
      admin: false,
      peer: {
        ...peer_data,
        peer_id: peer_id
      }
    };

    await this.refreshRoomAdmin(context.client_app_data);

    this.log(`CONNECTED : ${message}`, 'INFO');

    this.send_(context, {
      client_id: id,
      action: "connection",
      data: {
        type: "self_join"
      }
    });

    this.broadcastMessage(context.client_app_data, {
      client_id: id,
      action: "connection",
      data: {
        type: "join"
      }
    });

    context.on("onClose", (code, reason /*, connection*/ ) => {
      let message = `Client : ${id} close  code : ${code} reason : ${reason}`;
      this.logger(message, 'DEBUG');
      this.removeClient(context.client_app_data);
    });

  }

  async refreshRoomAdmin(client_data) {
    const room_id = client_data.room_id;
    const peer_data = client_data.peer;
    const mediasoupRoom = await this.mediasoupRooms.getUserRoom(room_id);
    let result = false;
    if (mediasoupRoom.users) {
      this.log(`room admins : ${mediasoupRoom.users.length}`, "INFO");
      let tab = mediasoupRoom.users.filter((admin) => {
        this.log(`room username = ${admin.username}, peer username = ${peer_data.username}`, "INFO");
        if (admin.username == peer_data.username) {
          this.log("Match", "INFO");
          return admin;
        }
      });
      this.log(`Final admin : ${tab.length}`, "INFO");
      result = tab.length > 0;
    } else {
      this.log("No room admins", "WARN");
    }
    client_data.admin = result;
    return result;
  }

  doEachClient(room_id, action) {
    for (const client_id in this.rooms[room_id]) {
      action(this.rooms[room_id][client_id].client_app_data);
    }
  }

  getPeerData(room_id, client_id) {
    if (!client_id) {
      return null;
    }
    const client = this.rooms[room_id][client_id];
    return client ? client.client_app_data.peer : null;
  }

  declareClient(room_id, context) {
    const id = nodefony.generateId();
    this.rooms[room_id] = this.rooms[room_id] || {};
    this.rooms[room_id][id] = context;
    return id;
  }

  removeClient(client_app_data) {
    const room_id = client_app_data.room_id;
    const id = client_app_data.client_id;
    this.sendAll(client_app_data, {
      client_id: id,
      action: "connection",
      data: {
        type: "left"
      }
    });
    this.log(`Disconnect client ${id} from room ${room_id}`, "INFO");
    delete this.rooms[room_id][id];
    this.fire('onDisconnect', client_app_data);
    if (Object.keys(this.rooms[room_id]).length == 0) {
      this.log(`Room ${room_id} closed because there is not any client anymore`, "INFO");
      delete this.rooms[room_id];
      this.fire('onRoomClosed', room_id);
    }
  }

  sendMessage(client_app_data, message, preMessage = null) {
    const context = this.rooms[client_app_data.room_id][client_app_data.client_id];
    if (preMessage) {
      const final_message = preMessage(message, context.client_app_data);
      this.send_(context, JSON.stringify(final_message));
    } else {
      this.send_(context, JSON.stringify(message));
    }
  }

  send_(context, message) {
    if (!message) {
      this.log("Send no message", "WARNING");
      return;
    }

    if (!context) {
      throw new Error("Send bad context");
    }

    if (typeof message === "string") {
      return context.send(message);
    }

    return context.send(JSON.stringify(message));
  }

  sendAll(client_app_data, message, preMessage = null, room_id = null) {
    return this.broadcastMessagePredicate(client_app_data, message, () => { return true; }, preMessage, room_id);
  }

  broadcastMessage(client_app_data, message, preMessage = null) {
    // Do not broadcast to self
    return this.broadcastMessagePredicate(client_app_data, message, (client_id, from) => {
      return client_id != client_app_data.client_id;
    }, preMessage);
  }

  broadcastMessagePredicate(client_app_data, message, predicate, preMessage = null, provided_room_id = null) {
    if (!message) {
      throw new Error("Cannot broadcast null message");
    }

    const room_id = provided_room_id ? provided_room_id : client_app_data.room_id;
    if (!room_id || !this.rooms[room_id]) {
      throw new Error(`Unable to find a valid room for client ${client_app_data.client_id}`);
    }

    for (const client_id in this.rooms[room_id]) {
      try {
        if (predicate(client_id, client_app_data.client_id)) {
          this.log(`Brodcast to : ${client_id} from : ${client_app_data.client_id}`, "DEBUG");
          const context = this.rooms[room_id][client_id];
          if (preMessage) {
            const final_message = preMessage(message, context.client_app_data);
            this.send_(context, JSON.stringify(final_message));
          } else {
            this.send_(context, JSON.stringify(message));
          }
        } else {
          this.log(`Brodcast dropped : ${client_app_data.client_id}`, "DEBUG");
        }
      } catch (e) {
        this.logger(e, "ERROR");
      }
    }
  }
};
