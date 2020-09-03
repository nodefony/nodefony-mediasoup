module.exports = {
  Mediasoup: {
    environment: ["SERVER"],
    class: nodefony.services.Mediasoup,
    arguments: ["@container", kernel.settings, process.env]
  },
  Rooms: {
    environment: ["SERVER"],
    class: nodefony.services.Rooms,
    arguments: ["@container"]
  },
  Bot: {
    environment: ["SERVER"],
    class: nodefony.services.Bots,
    arguments: ["@container"]
  },
  Peers: {
    environment: ["SERVER"],
    class: nodefony.services.Peers,
    arguments: ["@container"]
  },
  record: {
    environment: ["SERVER"],
    class: nodefony.services.record,
    arguments: ["@container"]
  }
};
