import nodefony from 'nodefony-client';

class Peer {
  constructor(id, mediasoupPeer, mediasoup) {
    //super("Peer", mediasoup.container, null, nodefony.extend({}, defaultOptions, options));
    this.id = id;
    this.local = false;
    this.displayName = "";
    this.user = null;
    //this.mediasoup = mediasoup;
    this.consumers = [];
    this.producers = [];
    this.dataConsumers = new Map();
    this.audioStream = new nodefony.medias.Stream(null,{}, this);
    this.videoStream = new nodefony.medias.Stream(null,{}, this);
    this.audioPaused = null;
    this.videoPaused = null;
    this.hydrate(mediasoupPeer);
  }

  hydrate(mdpeer){
    if( mdpeer.user ){
      this.user  = mdpeer.user
    }
    if( mdpeer.displayName){
      this.displayName = mdpeer.displayName;
    }
    if( mdpeer.status ){
      this.status = mdpeer.status;
    }
    if( mdpeer.device ){
      this.device = mdpeer.device;
    }
    if (mdpeer.producers){
      for( let id in mdpeer.producers){
        let producer = mdpeer.producers[id];
        if( producer.kind === "audio"){
          this.audioPaused = producer.paused;
        }
        if( producer.kind === "video"){
          this.videoPaused = producer.paused;
        }
      }
    }
  }

  hasProducer(id){
    let prod = this.producers.find((producer) => {
      if (producer.id === id) {
        return producer;
      }
    });
    if (prod) {
      return prod;
    }
    return null ;
  }

  addProducer(producer) {
    this.producers.push(producer);
  }

  deleteProducer(id){
    let res = this.producers.findIndex((producer) => {
      return producer.id === id;
    });
    if (res !== -1) {
      this.producers.splice(res, 1);
    }
  }

  hasConsumer(id){
    let cons = this.consumers.find((consumer) => {
      if (consumer.id === id) {
        return consumer
      }
    });
    if (cons) {
      return cons;
    }
    return null ;
  }

  addConsumer(consumer) {
    this.consumers.push(consumer);
  }
  deleteConsumer(id){
    let res = this.consumers.findIndex((consumer) => {
      return consumer.id === id;
    });
    if (res !== -1) {
      this.consumers.splice(res, 1);
    }
  }

  getInitial() {
    if (this.user) {
      let trg = `${this.user.name.substr(0, 1)}${this.user.surname.substr(0, 1)}`;
      return trg.toLowerCase();
    }
    return this.displayName || this.id;
  }

  getTrigramme() {
    if (this.user) {
      let size = this.user.surname.length;
      let trg = `${this.user.name.substr(0, 1)}${this.user.surname.substr(0, 1)}${this.user.surname.substr(size-1,1)}`;
      return trg.toLowerCase();
    }
    return this.displayName || this.id;
  }

  close(){
    this.consumers.length = 0;
    this.producers.length = 0;
    delete this.dataConsumers;
    this.audioStream = null;
    this.videoStream = null;
  }
}

export default Peer;
