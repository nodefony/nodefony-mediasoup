class Peer extends nodefony.Service {
  constructor(peerid, transport, container) {
    super(`Peer`, container);
    this.id = peerid;
    this.transport = transport;
    this.transport.once("onClose", () => {
      this.close(false);
    });
    this.consume = null;
    this.joined = false;
    this.displayName = null;
    this.device = null;
    this.rtpCapabilities = null;
    this.sctpCapabilities = null;
    this.transports = new Map();
    this.producers = new Map();
    this.consumers = new Map();
    this.dataProducers = new Map();
    this.dataConsumers = new Map();
  }

  close(closeTransport = true) {
    try {
      if (closeTransport){
        this.transport.close();
      }
    }
    catch(e) {
      this.log(e, "WARNING");
    }

    // Iterate and close all mediasoup Transport associated to this Peer, so all
    // its Producers and Consumers will also be closed.
    for (const transport of this.transports.values()) {
      transport.close();
    }
    this.fire("close", this)
    this.log(`Close Peer : ${this.id}`);
    return this;
  }

  send(room, method, data) {
    let message = {
      method:method,
      peerid : this.id,
      roomid:room.id,
      data:data
    }
    return this.transport.send(JSON.stringify(message));
  }

  notify(event, data) {
    return this.send({
      method: "nofity",
      event: event,
      data: data
    });
  }

}

module.exports = Peer;
