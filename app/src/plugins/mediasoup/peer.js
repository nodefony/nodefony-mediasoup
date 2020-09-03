import nodefony from 'nodefony';

const defaultOptions = {

};

class Peer {
  constructor(id, options, mediasoup) {
    let opt = nodefony.extend({}, defaultOptions);
    this.options = nodefony.extend(opt, options);
    //super("Peer", mediasoup.container, null, nodefony.extend({}, defaultOpt, options));
    this.id = id;
    this.mediasoup = mediasoup;
    this.videoElement = null;
    this.audioElement = null;
    this.consumers = [];
    this.producers = [];
    this.dataConsumers = [];
  }

  addProducer(producer) {
    this.producers.push(producer);
  }

  addConsumer(consumer) {
    this.consumers.push(consumer);
  }
}

export default Peer;
