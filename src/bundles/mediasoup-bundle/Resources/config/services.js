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
  },
  MediasoupStats: {
    environment: ["SERVER"],
    class: nodefony.services.MediasoupStats,
    arguments: ["@container"]
  },
  media_viewer_rooms: {
    environment: ["SERVER"],
    class: nodefony.services.MediaViewerRooms,
    arguments: ["@container"]
  },
  media_viewer_controller: {
    environment: ["SERVER"],
    class: nodefony.services.MediaViewerController,
    arguments: ["@container"]
  },
  media_viewer_synchronizer: {
    environment: ["SERVER"],
    class: nodefony.services.MediaViewerSynchronizer,
    arguments: ["@container"]
  },
  media_viewer_settings: {
    environment: ["SERVER"],
    class: nodefony.services.MediaViewerSettings,
    arguments: ["@container"]
  },
  media_viewer_dispatcher: {
    environment: ["SERVER"],
    class: nodefony.services.MediaViewerDispatcher,
    arguments: ["@container"]
  }
};
