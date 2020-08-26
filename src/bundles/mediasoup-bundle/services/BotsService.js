const Bot = require(path.resolve(__dirname, "..", "src", "bot.js"))

class Bots extends nodefony.Service {

  constructor(container) {
    super("Bots", container);
  }

  async create(router) {
    // Create a DirectTransport for connecting the bot.
    const transport = await router.createDirectTransport({
      maxMessageSize: 512
    });

    // Create DataProducer to send messages to peers.
    const dataProducer = await transport.produceData({
      label: this.name
    });

    return new Bot(transport, dataProducer, this.container);
  }
}

module.exports = Bots;
