const bot = require(path.resolve(__dirname, "..", "src", "bot.js"))

class Bot extends nodefony.Service {

  constructor(container) {
    super("Bot", container);
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

    return new bot(transport, dataProducer, this.container);
  }
};

module.exports = Bot;
