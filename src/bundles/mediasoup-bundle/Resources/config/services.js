module.exports = {
  Mediasoup: {
    environment: ["SERVER"],
    class: nodefony.services.Mediasoup,
    arguments: ["@container", kernel.settings, process.env]
  },
  Meetings: {
    environment: ["SERVER"],
    class: nodefony.services.Meetings,
    arguments: ["@container"]
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
  recorder: {
    environment: ["SERVER"],
    class: nodefony.services.Recorder,
    arguments: ["@container"]
  },
  streamer: {
    environment: ["SERVER"],
    class: nodefony.services.Streamer,
    arguments: ["@container"]
  }
};
