module.exports = {
  Mediasoup: {
    class: nodefony.services.Mediasoup,
    arguments: ["@container", kernel.settings, process.env]
  },
  rooms: {
    class: nodefony.services.rooms,
    arguments: ["@container"]
  },
  Bot: {
    class: nodefony.services.Bot,
    arguments: ["@container"]
  }
};
