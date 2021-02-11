
class PdfIframeEventListener {

  constructor(iframe, controller, socketBinding, settings, queryResolver) {
    this.iframe = iframe;
    this.socketBinding = socketBinding;
    this.queryResolver = queryResolver;
    this.settings = settings;
    this.controller = controller;
  }

  // Pdf iframe events
  protectWithSampling() {
    const result = this.settings.data.eventsPerSecond * (Date.now() - this.now) < 1000;
    if (!result) {
      this.now = Date.now();
    }
    return result;
  }

  listen() {
  }

  unlisten() {
  }

  syncIfControl(action, data) {
    if (!this.controller.canTakeControl()) {
      return;
    }
    this.socketBinding.send({
      action: "sync",
      method: "set",
      data: {
        action: action,
        media_id: this.settings.data.mediaUrl,
        data: data
      }
    });
  }

}

export default PdfIframeEventListener;
