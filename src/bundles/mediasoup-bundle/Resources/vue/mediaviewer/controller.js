import Controls from './control.js'

class ViewerController {

  constructor(socketBinding) {
    this.socketBinding = socketBinding;
    this.has_control = Controls.NONE;
    this.disable_control = 0;

    this.events = new Map([
      ["onControlChange", (controller_id, control) => {
          this.has_control = control;
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
    this.disable_control = 0;
  }

  canTakeControl() {
    return !this.disable_control && (this.has_control == Controls.NONE || this.has_control == Controls.OWN);
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
