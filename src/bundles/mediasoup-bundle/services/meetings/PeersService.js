const Peer = require(path.resolve(__dirname, "..", "..", "src", "peer.js"))

class Peers extends nodefony.Service {

  constructor(container) {
    super("Peers", container);
    if (!this.kernel.ready) {
      this.kernel.once("onReady", () => {
        this.usersService = this.get("users");
      });
    } else {
      this.usersService = this.get("users");
    }
  }

  async create(peerid, transport) {
    let peer = new Peer(peerid, transport, this.container);
    peer.user = await this.getUserpeer(peerid);
    this.log(`Create New Peer : ${peer.id}`);
    return peer;
  }

  async getUserpeer(peerid) {
    return this.usersService.findOne(peerid)
      .then((response) => {
        const {
          username,
          roles,
          name,
          surname,
          lang,
          gender,
          email
        } = response;
        return {
          username,
          roles,
          name,
          surname,
          lang,
          gender,
          email
        };
      })
      .catch((e) => {
        this.log(e, "WARNING");
        return null;
      });
  }

  startRecord(peer) {
    return peer.startRecord();
  }
};

module.exports = Peers;
