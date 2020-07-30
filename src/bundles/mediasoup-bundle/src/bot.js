

class Bot extends nodefony.Service{
  constructor(transport, dataProducer, container){
    super(`Bot`, container);
    this.transport = transport;
    this.dataProducer = dataProducer;
  }

}

module.exports = Bot;
