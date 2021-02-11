class PdfSocketListener {

  constructor(iframe, controller, socketBinding) {
    this.iframe = iframe;
    this.controller = controller;
    this.socketBinding = socketBinding;

    this.socketEvents = new Map([
      ["setViewPosition", (media_message) => {
        // TODO scroll
      }],
      ["onDisconnected", (event) => {
        this.unlisten();
      }]
    ]);

    this.listen();
  }

  reset() {
    this.unlisten();
    this.listen();
  }

  listen() {
    for (const [name, listener] of this.socketEvents) {
      this.socketBinding.removeListener(name, listener);
      this.socketBinding.on(name, listener);
    }
  }

  unlisten() {
    for (const [name, listener] of this.socketEvents) {
      this.socketBinding.removeListener(name, listener);
    }
  }

}

export default PdfSocketListener;
