module.exports = class ControlTaker {
  static ControlValue = Object.freeze({
      CHANGED:      0,
      CONTINUE:     1,
      NEW:          2,
      NOT_TESTED:   3
  });

  constructor(policy, log, onLost) {
    this.client_data = null;
    this.timer = null;
    this.Timeout = 3000;
    this.policy = policy;
    this.log = log;
    this.onLost = onLost;
  }

  askControl(client_data) {
    this.log(`Control asked by : ${client_data.client_id} in room ${client_data.room_id}`, "DEBUG");

    let changed_peer_data = null;
    if (!this.hasControl(client_data)) {
      const next_controller = this.policy.control(this.client_data, client_data);
      const control_changed = !this.hasControl(next_controller);
      this.client_data = next_controller;
      if (control_changed) {
        this.log(`Control granted to : ${this.client_data.client_id} in room ${this.client_data.room_id}`, "DEBUG");
        changed_peer_data = this.client_data;
      }
    }

    this.resetTimer();
    return { client_data: changed_peer_data };
  }

  hasControl(client_data) {
    return (!client_data && !this.client_data) || this.client_data && client_data && this.client_data.client_id == client_data.client_id;
  }

  currentController() {
    return this.client_data;
  }

  allowedControl(client_data) {
    return this.policy.allowed(client_data);
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  resetTimer() {
    this.clearTimer();

    this.timer = setTimeout(() => {
      clearTimeout(this.timer);
      this.timer = null;

      if (this.client_data && this.client_data.peer) {
        this.log(`Control timed out for ${this.client_data.client_id} (${this.client_data.peer.username})`, "DEBUG");
      }

      const old_client_data = this.client_data;
      this.client_data = this.policy.lost(old_client_data);
      this.log(`Control is now owned by ${this.client_data ? this.client_data.client_id : null}`, "DEBUG");
      this.onLost(old_client_data);
    }, this.Timeout);
  }

};
