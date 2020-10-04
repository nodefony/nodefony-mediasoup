

class Bot extends nodefony.Service{
  constructor(name, transport, dataProducer, container){
    super(name, container);
    this.transport = transport;
    this.dataProducer = dataProducer;
  }

  handlePeerDataProducer(){

  }

}

module.exports = Bot;
