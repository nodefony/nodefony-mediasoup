class Peer extends nodefony.Service {
  constructor(peerid, transport, container) {
    super(`Peer`, container);
    this.id = peerid;
    this.user = null;
    this.media = null;
    this.transport = transport;
    if (this.transport) {
      this.transport.once("onClose", () => {
        this.close(false);
      });
    }
    //this.consume = null;
    this.joined = false;
    this.status = "waiting"; // connected | waiting  | joined | disconnected
    this.displayName = null;
    this.device = null;
    this.rtpCapabilities = null;
    this.sctpCapabilities = null;
    this.transports = new Map();
    this.producers = new Map();
    this.consumers = new Map();
    this.dataProducers = new Map();
    this.dataConsumers = new Map();
    // record
    this.process = null;
    this.remotePorts = [];
  }

  async parserMediasoupApi(struct, type, getStats = false) {
    let stats = null;
    try {
      if (getStats && struct.getStats) {
        stats = await struct.getStats();
      }
    } catch (e) {
      this.log(e, "ERROR");
    }

    switch (type) {
    case "producer":
      return {
        kind: struct.kind,
        type: struct.type,
        appData: struct.appData,
        paused: struct.paused,
        closed: struct.closed,
        stats: stats
      };
    case "dataProducer":
      return {
        kind: "data",
        type: struct.type,
        appData: struct.appData,
        closed: struct.closed,
        label: struct.label,
        protocol: struct.protocol,
        stats: stats
      }
    case "consumer":
      return {
        kind: struct.kind,
        type: struct.type,
        producerPaused: struct.producerPaused,
        appData: struct.appData,
        paused: struct.paused,
        closed: struct.closed,
        stats: stats
      };
    case "dataConsumer":
      return {
        kind: "data",
        type: struct.type,
        appData: struct.appData,
        closed: struct.closed,
        label: struct.label,
        protocol: struct.protocol,
        stats: stats
      }
    case "transport":
      return {
        kind: struct.kind,
        type: struct.type,
        appData: struct.appData,
        paused: struct.paused,
        closed: struct.closed,
        stats: stats
      }
    default:
      return {}
    }
  }

  async parser(stats) {
    let producers = {};
    let consumers = {};
    let dataProducers = {};
    let dataConsumers = {};
    let transports = {};
    try {
      for (let [index, producer] of this.producers) {
        producers[index] = await this.parserMediasoupApi(producer, "producer", stats);
      }
      for (let [index, consumer] of this.consumers) {
        consumers[index] = await this.parserMediasoupApi(consumer, "consumer", stats);
      }
      for (let [index, producer] of this.dataProducers) {
        dataProducers[index] = await this.parserMediasoupApi(producer, "dataProducer", stats);
      }
      for (let [index, consumer] of this.dataConsumers) {
        dataConsumers[index] = await this.parserMediasoupApi(consumer, "dataConsumer", stats);
      }
      for (let [index, transport] of this.transports) {
        transports[index] = await this.parserMediasoupApi(transport, "transport", stats);
      }
      return {
        producers,
        consumers,
        dataProducers,
        dataConsumers,
        transports
      }
    } catch (e) {
      throw e;
    }
  }

  async peerInfos(stats = false) {
    try {
      const parser = await this.parser(stats);
      return {
        id: this.id,
        displayName: this.displayName,
        status: this.status,
        device: this.device,
        user: this.user,
        producers: parser.producers,
        consumers: parser.consumers,
        dataProducers: parser.dataProducers,
        dataConsumers: parser.dataConsumers,
        transports: parser.transports,
        media: this.media
      };
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
  }

  async peerStats() {
    return await this.peerInfos(true);
  }

  hasConsumer(consumerId) {
    return this.consumers.has(consumerId);
  }

  getConsumer(consumerId) {
    return this.consumers.get(consumerId);
  }

  setConsumer(consumerId, consumer) {
    return this.consumers.set(consumerId, consumer);
  }

  deleteConsumer(consumerId) {
    return this.consumers.delete(consumerId);
  }

  hasProducer(producerId) {
    return this.producers.has(producerId);
  }

  getProducer(producerId) {
    return this.producers.get(producerId);
  }

  setProducer(producerId, producer) {
    return this.producers.set(producerId, producer);
  }

  getProducersByKind(kind) {
    return this.producers.filter((producer => producer.kind === kind));
  }

  getConsumersByKind(kind) {
    return this.consumers.filter((consumer => consumer.kind === kind));
  }

  deleteProducer(producerId) {
    return this.producers.delete(producerId);
  }

  hasTransport(transportId) {
    return this.transports.has(transportId);
  }

  getTransport(transportId) {
    return this.transports.get(transportId);
  }

  setTransport(transportId, transport) {
    return this.transports.set(transportId, transport);
  }

  deleteTransport(transportId) {
    return this.transports.delete(transportId);
  }

  close(closeTransport = true) {
    if (closeTransport) {
      if (this.transport) {
        this.transport.close();
      }
    }
    // Iterate and close all mediasoup Transport associated to this Peer, so all
    // its Producers and Consumers will also be closed.
    for (const transport of this.transports.values()) {
      try {
        transport.close();
      } catch (e) {
        this.log(e, "WARNING");
      }
    }
    this.fire("close", this);
    this.log(`Close Peer : ${this.id}`);
    return this;
  }

  send(room, method, data) {
    let message = {
      method: method,
      peerid: this.id,
      roomid: room.id,
      data: data
    };
    return this.transport.send(JSON.stringify(message));
  }

  notify(room, event, data) {
    //this.log(event, "NOTICE");
    return this.send(room, "notify", {
      event: event,
      data: data
    });
  }

  async pauseProducer(producerId) {
    if (!this.hasProducer(producerId)) {
      throw new Error(`producer with id "${producerId}" not found`);
    }
    let producer = this.getProducer(producerId);
    await producer.pause();
    return producer;
  }

  async resumeProducer(producerId) {
    if (!this.hasProducer(producerId)) {
      throw new Error(`producer with id "${producerId}" not found`);
    }
    let producer = this.getProducer(producerId);
    await producer.resume();
    return producer;
  }

  async closeProducer(producerId) {
    if (!this.hasProducer(producerId)) {
      throw new Error(`producer with id "${producerId}" not found`);
    }
    const producer = this.getProducer(producerId);
    if (!producer) {
      throw new Error(`producer with id "${producerId}" not found`);
    }
    try {
      await producer.close();
      this.deleteProducer(producerId);
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
  }

  async pauseConsumer(consumerId) {
    if (!this.hasProducer(consumerId)) {
      throw new Error(`Consumer with id "${consumerId}" not found`);
    }
    let consumer = this.getConsumer(consumerId);
    await consumer.pause();
    return consumer;
  }

  async resumeConsumer(consumerId) {
    if (!this.hasProducer(consumerId)) {
      throw new Error(`Consumer with id "${consumerId}" not found`);
    }
    let consumer = this.getConsumer(consumerId);
    await consumer.resume();
    return consumer;
  }

}

module.exports = Peer;
