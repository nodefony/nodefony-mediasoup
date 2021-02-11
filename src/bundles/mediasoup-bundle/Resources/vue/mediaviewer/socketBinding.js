import nodefonyclient from 'nodefony-client';
import Controls from './control.js'

class SocketBinding extends nodefonyclient.Service {
  constructor(media_viewer) {
    super("media_viewer_sockettoevent", media_viewer.container, null, process.env);
    this.client_id = null;
    this.socket = null;
    this.reset();

    media_viewer.on("onSocketOpen", (socket) => {
      this.attach(socket);
    });

    media_viewer.on("onSocketClose", (socket) => {
      this.detach();
    });
  }

  async doIgnoreSync(func) {
    this.disable_sync++;
    let except = null;
    this.log(`Disabling sync ${this.disable_sync}`, "DEBUG");
    try {
      await func();
    } catch (e) {
      except = e;
    }
    this.disable_sync--;
    this.log(`Enabling sync ${this.disable_sync}`, "DEBUG");
    if (except) {
      throw except;
    }
  }

  attach(socket) {
    this.socket = socket;
  }

  detach() {
    this.fire("onControlChange", null, Controls.NONE);
    const old_socket = this.socket;
    this.socket = null;
    return old_socket;
  }

  detached() {
    return !this.socket;
  }

  handleConnection(client_id, type) {
    if (typeof type === "string") {
      switch (type) {
      case "join":
        this.log(`${client_id} : connected`,"DEBUG");
        this.fire("onPeerConnected", [client_id], 1);
        break;
      case "self_join":
        this.log(`Client : ${client_id} : connected`,"DEBUG");
        this.client_id = client_id;
        this.fire("onConnected", this.client_id);
        break;
      case "left":
        if (client_id == this.client_id) {
          this.log(`You have been deconnected`,"DEBUG");
          this.on("onDisconnected");
          this.detach();
          return;
        }
        this.log(`${client_id} has been deconnected`,"DEBUG");
        break;
      default:
        this.log(`${type} is not a valid connection info`,"ERROR");
        break;
      }
    } else if (Array.isArray(type)) {
      this.fire("onPeerConnected", type, type.length);
    }
  }

  handleControl(control_value) {
    const controller_id = control_value ? control_value.client_id : null;
    const peer_data = control_value ? control_value.peer_data : undefined;
    let control = Controls.NONE;
    if (controller_id) {
      control = this.client_id == controller_id ? Controls.OWN : Controls.OTHER;
    }
    this.fire("onControlChange", controller_id, control, peer_data);
    if (!controller_id || controller_id == this.client_id) {
      this.log(`You got the media control`,"DEBUG");
    } else {
      this.log(`${controller_id} got the media control`,"DEBUG");
    }
  }

  async handleSync(method, media_message) {
    if (this.disable_sync) {
      this.log(`Sync dropped (${this.disable_sync})`, "WARNING");
      return;
    }

    if (media_message.action) {
      await this.notificationsCenter.emitAsync(media_message.action, media_message, method);
    } else {
      for (const [action, message] of Object.entries(media_message)) {
        try {
          await this.notificationsCenter.emitAsync(action, message, method);
        } catch(e) {
          this.log(e, "ERROR");
        }
      }
    }
  }

  reset() {
    this.global_message_id = 0;
    this.disable_sync = 0;
    this.queries = {};
  }

  handleSettings(method, settings) {
    this.fire("onSettings", settings, method);
  }

  async onSocketMessage(result) {
    this.fire("onMessage", result);
    
    try {
      switch (result.action) {
      case "connection":
        this.handleConnection(result.client_id, result.data.type);
        break;
      case "control":
        this.handleControl(result.data);
        break;
      case "sync":
        await this.handleSync(result.method, result.data);
        break;
      case "settings":
        this.handleSettings(result.method, result.data);
        break;
      default:
        this.log(`Unrecognized action : ${result.action}`, "ERROR");
        break;
      }
    } catch (e) {
      this.log(e, "ERROR");
    }

    if (result.id && this.queries[result.id]) {
      this.queries[result.id](result);
      delete this.queries[result.id];
    }
  }

  send(message) {
    if (this.socket) {
      let str = JSON.stringify(message);
      this.fire("onSendMessage", message, this);
      this.socket.send(str);
    } else {
      this.log("Cannot send message while socket is closed", "ERROR");
    }
  }

  incrementMessageId() {
    this.global_message_id = isFinite(this.global_message_id) ? (this.global_message_id + 1) : 0;
    return this.global_message_id;
  }

  async sendWait(message) {
    return new Promise((resolve, reject) => {
      message.id = message.id || this.incrementMessageId();
      this.queries[message.id] = resolve;
      this.send(message);
    });
  }
}

export default SocketBinding;
