const Bot = require(path.resolve(__dirname, "..", "src", "bot.js"))

class Bots extends nodefony.Service {

  constructor(container) {
    super("Bots", container);
  }

  async create(name, router) {
    // Create a DirectTransport for connecting the bot.
    const transport = await router.createDirectTransport({
      maxMessageSize: 512
    });

    // Create DataProducer to send messages to peers.
    const dataProducer = await transport.produceData({
      label: name
    });

    return new Bot(name, transport, dataProducer, this.container);
  }
}

module.exports = Bots;
