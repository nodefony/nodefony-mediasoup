import nodefony from 'nodefony-client';

const defaultOptions = {

};

class Peer extends nodefony.Service{
  constructor(id, options, mediasoup) {
    super("Peer", mediasoup.container, null, nodefony.extend({}, defaultOptions, options));
    this.id = id;
    this.local = false;
    this.displayName = "";
    this.user = null;
    this.mediasoup = mediasoup;
    this.consumers = [];
    this.producers = [];
    this.dataConsumers = new Map();
    this.audioStream = new nodefony.medias.Stream(null,{}, this);
    this.videoStream = new nodefony.medias.Stream(null,{}, this);
    //console.log(this)
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
      this.log(`remove Producer : ${id}`)
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
      return consumer.id === consumer;
    });
    if (res !== -1) {
      this.log(`remove Consumer : ${id}`)
      this.consumers.splice(res, 1);
    }
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
