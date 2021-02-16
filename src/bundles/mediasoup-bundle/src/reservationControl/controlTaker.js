module.exports = class ControlTaker {
  static ControlValue = Object.freeze({
      CHANGED:      0,
      CONTINUE:     1,
      NEW:          2,
      NOT_TESTED:   3
  });

  constructor(room_id, rooms, policy, log, onLost) {
    this.rooms = rooms;
    this.client_id = null;
    this.room_id = room_id;
    this.peer_data = {};
    this.timer = null;
    this.Timeout = 3000;
    this.policy = policy;
    this.log = log;
    this.onLost = onLost;
  }

  askControl(client_id) {
    this.log(`Control asked by : ${client_id} in room ${this.room_id}`, "DEBUG");

    let control_changed = this.constructor.ControlValue.NOT_TESTED;
    let peer_data = null;

    if (client_id !== this.client_id) {
      const old_client_control_id = this.client_id;
      this.client_id = this.policy.control(old_client_control_id, client_id);  
      control_changed = old_client_control_id != this.client_id ? 
        (!old_client_control_id ? this.constructor.ControlValue.NEW : this.constructor.ControlValue.CONTINUE) : this.constructor.ControlValue.CHANGED;
      if (control_changed == this.constructor.ControlValue.NEW || control_changed == this.constructor.ControlValue.CHANGED) {
        this.log(`Control granted to : ${this.client_id} in room ${this.room_id}`, "DEBUG");
        this.peer_data = this.rooms.getPeerData(this.room_id, this.client_id);
        peer_data = this.peer_data;
      }
    }

    this.resetTimer();
    return {client_id: this.client_id, peer_data: peer_data};
  }

  hasControl(client_id) {
    return this.client_id == client_id;
  }

  resetTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      clearTimeout(this.timer);
      this.timer = null;

      if (this.peer_data) {
        this.log(`Control timed out for ${this.client_id} (${this.peer_data.username})`, "DEBUG");
      }

      const old_peer_data = this.peer_data ? Object.assign({}, this.peer_data) : {};
      const old_client_id = this.client_id;
      this.client_id = this.policy.lost(old_client_id);
      if (this.client_id != old_client_id) {
        this.peer_data = this.rooms.getPeerData(this.room_id, this.client_id);
      }
      this.log(`Control is now owned by ${this.client_id}`, "DEBUG");
      this.onLost({
        room_id: this.room_id,
        client_id: old_client_id,
        peer: old_peer_data
      });
    }, this.Timeout);
  }

};
