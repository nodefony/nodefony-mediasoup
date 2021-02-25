import Controls from './control.js'

class ViewerController {

  constructor(socketBinding) {
    this.socketBinding = socketBinding;
    this.has_control = Controls.NONE;
    this.DefaultDisableControl = 0;
    this.global_disable_control = false;
    this.disable_control = this.DefaultDisableControl;

    this.events = new Map([
      ["onControlChange", (controller_id, control, peer_data, allowed) => {
        this.has_control = control;
        if (allowed !== undefined) {
          this.global_disable_control = !allowed;
        }
      }], ["onDisconnected", (event) => {
        this.unlisten();
      }]
    ]);
    this.listen();
  }

  listen() {
    this.unlisten();
    for (const [name, listener] of this.events) {
      this.socketBinding.on(name, listener);
    }
  }

  unlisten() {
    for (const [name, listener] of this.events) {
      this.socketBinding.removeListener(name, listener);
    }
  }

  reset() {
    this.disable_control = this.DefaultDisableControl;
  }

  canTakeControl() {
    return !this.global_disable_control && !this.disable_control && (this.has_control == Controls.NONE || this.has_control == Controls.OWN);
  }

  syncIfControl(media_id, action, data, persist = true) {
    if (!this.canTakeControl()) {
      return;
    }
    this.socketBinding.send({
      action: "sync",
      method: "set",
      data: {
        action: action,
        persist: persist,
        media_id: media_id,
        data: data
      }
    });
  }

  async doAvoidControl(func, timeout) {
    this.disable_control++;
    let except = null;
    try {
      await func();
    } catch (e) {
      except = e;
    }
    setTimeout(() => {
      this.disable_control--;
    }, timeout);
    if (except) {
      throw except;
    }
  }

  forceControl(control) {
    this.has_control = control;
  }
}

export default ViewerController;
