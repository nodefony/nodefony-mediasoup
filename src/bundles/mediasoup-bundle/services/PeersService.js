const Peer = require(path.resolve(__dirname, "..", "src", "peer.js"))

class Peers extends nodefony.Service {

  constructor(container) {
    super("Peers", container);
  }

  async create(peerid , transport) {
    let peer = new Peer(peerid, transport, this.container);
    this.log(`Create New Peer : ${peer.id}`);
    return peer ;
  }

  startRecord(peer){
    return peer.startRecord();
  }
};

module.exports = Peers;
