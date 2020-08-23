const mediasoup = require('mediasoup');
const {
  networkInterfaces
} = require('os');


const getLocalExternalIP = () => [].concat(...Object.values(networkInterfaces()))
  .find((details) => details.family === 'IPv4' && !details.internal);


const getDevice = () => {
  const nets = networkInterfaces();
  const devices = Object.create(null); // or just '{}', an empty object
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (!devices[name]) {
        devices[name] = [];
        devices[name].push(net);
      } else {
        devices[name].push(net);
      }
    }
  }
  return devices;
};
/**
 *	@class apiController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/mediasoup/api")
 */
class apiController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    //this.startSession();
    this.roomsService = this.get("Rooms");
    // start session
    this.api = new nodefony.api.Json({
      name: "mediasoup",
      version: mediasoup.version,
      description: "Mediasoup Api",
    }, this.context);
  }


  /**
   *  API GET resource that returns the mediasoup Router RTP capabilities of the room
   *    @Route ("/servers",
   *      name="route-mediasoup-servers")
   */
  getServerAction() {
    return this.api.render({
      external: getLocalExternalIP(),
      devices: getDevice(),
      config: this.bundle.settings.mediasoup
    });
  }

  getRoom(roomId) {
    return this.roomsService.getRoom(roomId);
  }

  /**
   *  API GET resource that returns the mediasoup Router RTP capabilities of the room
   *    @Route ("/rooms/{roomId}",
   *      name="route-mediasoup-rooms")
   */
  async roomsAction(roomId) {
    const room = this.getRoom(roomId);
    let status = null;
    if (room) {
      status = await room.logStatus();
    }
    return this.api.render({
      roomid: roomId,
      status: status
    });
  }

  /**
   *    POST API to create a Broadcaster.
   *    @Route ("/rooms/{roomId}/broadcasters",
   *      name="route-mediasoup-rooms-broadcasters")
   */
  roomsBroadcastersAction(roomId) {
    return this.api.render({
      roomId,
      broadcasters: "true"
    });
  }

  /**
   *    DELETE API to delete a Broadcaster.
   *    @Route ("/rooms/{roomId}/broadcasters/{broadcasterId}",
   *      name="route-mediasoup-rooms-broadcasters-delete")
   */
  roomsBroadcastersDeleteAction(roomId, broadcasterId) {
    return this.api.render({
      roomId,
      broadcasterId
    });
  }

  /**
   * POST API to create a mediasoup Transport associated to a Broadcaster.
   * It can be a PlainTransport or a WebRtcTransport depending on the
   * type parameters in the body. There are also additional parameters for
   * PlainTransport.
   *
   *    @Route ("/rooms/{roomId}/broadcasters/{broadcasterId}/transports",
   *    name="route-mediasoup-rooms-broadcasters-transport")
   */
  roomsBroadcastersTransportAction(roomId, broadcasterId) {
    return this.api.render({
      roomId,
      broadcasterId
    });
  }

  /**
   * POST API to connect a Transport belonging to a Broadcaster. Not needed
   * for PlainTransport if it was created with comedia option set to true.
   *
   *    @Route ("/rooms/{roomId}/broadcasters/{broadcasterId}/transports/{transportId}/connect",
   *    name="route-mediasoup-rooms-broadcasters-transport-connect")
   */
  roomsBroadcastersTransportConnectAction(roomId, broadcasterId, transportId) {
    return this.api.render({
      roomId,
      broadcasterId,
      transportId
    });
  }

  /**
   * POST API to create a mediasoup Producer associated to a Broadcaster.
   * The exact Transport in which the Producer must be created is signaled in
   * the URL path. Body parameters include kind and rtpParameters of the
   * Producer.
   *    @Route ("/rooms/{roomId}/broadcasters/{broadcasterId}/transports/{transportId}/producers",
   *    name="route-mediasoup-rooms-broadcasters-transport-producers")
   */
  roomsBroadcastersTransportProducerAction(roomId, broadcasterId, transportId) {
    return this.api.render({
      roomId,
      broadcasterId,
      transportId
    });
  }

  /**
   * POST API to create a mediasoup Consumer associated to a Broadcaster.
   * The exact Transport in which the Consumer must be created is signaled in
   * the URL path. Query parameters must include the desired producerId to
   * consume.
   *    @Route ("/rooms/{roomId}/broadcasters/{broadcasterId}/transports/{transportId}/consume",
   *    name="route-mediasoup-rooms-broadcasters-transport-consume")
   */
  roomsBroadcastersTransportConsumeAction(roomId, broadcasterId, transportId) {
    return this.api.render({
      roomId,
      broadcasterId,
      transportId
    });
  }

  /**
   * POST API to create a mediasoup DataConsumer associated to a Broadcaster.
   * The exact Transport in which the DataConsumer must be created is signaled in
   * the URL path. Query body must include the desired producerId to
   * consume.
   *    @Route ("/rooms/{roomId}/broadcasters/{broadcasterId}/transports/{transportId}/consume/data",
   *    name="route-mediasoup-rooms-broadcasters-transport-consume-data")
   */
  roomsBroadcastersTransportConsumeDataAction(roomId, broadcasterId, transportId) {
    return this.api.render({
      roomId,
      broadcasterId,
      transportId
    });
  }

  /**
   * POST API to create a mediasoup DataProducer associated to a Broadcaster.
   * The exact Transport in which the DataProducer must be created is signaled in
   *    @Route ("/rooms/{roomId}/broadcasters/{broadcasterId}/transports/{transportId}/produce/data",
   *    name="route-mediasoup-rooms-broadcasters-transport-produce-data")
   */
  roomsBroadcastersTransportProduceDataAction(roomId, broadcasterId, transportId) {
    return this.api.render({
      roomId,
      broadcasterId,
      transportId
    });
  }
}

module.exports = apiController;
