const Peer = require(path.resolve(__dirname,  "peer.js"))

class Broadcaster extends Peer {
  constructor(id, displayName, device = {}, rtpCapabilitie = null, container = null) {
    super(id, null, container);
    this.id = id;
    this.displayName = displayName;
    this.device = device;
    this.rtpCapabilities = rtpCapabilitie;
    this.peerInfos = [];
  }

}

module.exports = Broadcaster;
