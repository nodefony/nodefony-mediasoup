import nodefony from 'nodefony';

const defaultOptions = {

};

class Peer extends nodefony.Service{
  constructor(id, options, mediasoup) {
    super("Peer", mediasoup.container, null, nodefony.extend({}, defaultOptions, options));
    this.id = id;
    this.mediasoup = mediasoup;
    this.consumers = [];
    this.producers = [];
    this.dataConsumers = [];
  }

  hasProducer(id){

  }

  addProducer(producer) {
    this.producers.push(producer);
  }

  deleteProducer(producer){
    console.log("todo deleteProducer")
  }

  addConsumer(consumer) {
    this.consumers.push(consumer);
  }

  close(){
    this.consumers.length = 0;
    this.producers.length = 0;
    this.dataConsumers.length = 0;
  }
}

export default Peer;
