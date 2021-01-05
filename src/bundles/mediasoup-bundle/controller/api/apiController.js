const mediasoup = require('mediasoup');
const {
  networkInterfaces
} = require('os');

/**
 *	@class apiController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/mediasoup/api/cli")
 */
class apiController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    //this.startSession();
    this.meetingsService = this.get("Meetings");

    // start session
    this.api = new nodefony.api.Json({
      name: "mediasoup-cli-rooms",
      version: mediasoup.version,
      description: "Mediasoup Rooms Api",
    }, this.context);

  }

  getRoom(roomId) {
    return this.meetingsService.getRoom(roomId);
  }

  /**
   *  API GET resource that returns all rooms
   *    @Route ("/rooms",
   *      name="route-mediasoup-rooms-all")
   */
  async allRoomsAction() {
    try {
      const rooms = [];
      this.meetingsService.rooms.
      forEach((value, key) => {
        rooms.push(key);
      });
      return this.api.render({
        rooms: rooms
      });
    } catch (e) {
      this.log(e, "ERROR");
      return this.api.render(e);
    }
  }

  /**
   *  API GET resource that returns the mediasoup Router RTP capabilities of the room
   *    @Route ("/rooms/{roomId}",
   *      name="route-mediasoup-rooms")
   *    @Method ({"GET"})
   */
  async roomsAction(roomId) {
    const room = this.getRoom(roomId);
    let status = null;
    if (room) {
      status = await room.logStatus();
    }
    return this.api.render({
      roomid: roomId,
      status: status,
      routerRtpCapabilities: room.getRouterRtpCapabilities()
    });
  }

  /**
   *    POST API to create a Broadcaster.
   *    @Route ("/rooms/{roomId}/broadcasters",
   *      name="route-mediasoup-rooms-broadcasters")
   *    @Method ({"POST"})
   */
  async roomsBroadcastersAction(roomId) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} not found`);
    }
    const {
      id,
      displayName,
      device,
      rtpCapabilities
    } = this.query;
    try {
      const broadcaster = await room.createBroadcaster(
        id,
        displayName,
        device,
        rtpCapabilities
      );
      return this.api.render({
        roomId,
        broadcasters: broadcaster.peerInfos
      });
    } catch (error) {
      this.log(error, "ERROR");
      return this.api.render(error);
    }
  }

  /**
   *    DELETE API to delete a Broadcaster.
   *    @Route ("/rooms/{roomId}/broadcasters/{broadcasterId}",
   *      name="route-mediasoup-rooms-broadcasters-delete")
   *    @Method ({"DELETE"})
   */
  async roomsBroadcastersDeleteAction(roomId, broadcasterId) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} not found`);
    }
    try {
      let res = await room.deleteBroadcaster(broadcasterId);
      return this.api.render({
        roomId,
        broadcasterId,
        delete: res
      });
    } catch (error) {
      this.log(error, "ERROR");
      return this.api.render(error);
    }
  }

  /**
   * POST API to create a mediasoup Transport associated to a Broadcaster.
   * It can be a PlainTransport or a WebRtcTransport depending on the
   * type parameters in the body. There are also additional parameters for
   * PlainTransport.
   *
   *    @Route ("/rooms/{roomId}/broadcasters/{broadcasterId}/transports",
   *    name="route-mediasoup-rooms-broadcasters-transport")
   *    @Method ({"POST"})
   */
  async roomsBroadcastersTransportAction(roomId, broadcasterId) {
    const {
      type,
      rtcpMux,
      comedia,
      sctpCapabilities
    } = this.query;
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} not found`);
    }
    try {
      const data = await room.createBroadcasterTransport(
        broadcasterId,
        type,
        rtcpMux,
        comedia,
        sctpCapabilities
      );
      return this.api.render({
        roomId,
        broadcasterId,
        transport: data
      });
    } catch (error) {
      this.log(error, "ERROR");
      return this.api.render(error);
    }
  }

  /**
   * POST API to connect a Transport belonging to a Broadcaster. Not needed
   * for PlainTransport if it was created with comedia option set to true.
   *
   *    @Route ("/rooms/{roomId}/broadcasters/{broadcasterId}/transports/{transportId}/connect",
   *    name="route-mediasoup-rooms-broadcasters-transport-connect")
   *    @Method ({"POST"})
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
   *    @Method ({"POST"})
   */
  async roomsBroadcastersTransportProducerAction(roomId, broadcasterId, transportId) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} not found`);
    }
    const {
      kind,
      rtpParameters
    } = this.query;
    try {
      const producer = await room.createBroadcasterProducer(
        broadcasterId,
        transportId,
        kind,
        rtpParameters
      );
      return this.api.render({
        roomId,
        broadcasterId,
        transportId,
        producer: producer.id
      });
    } catch (error) {
      this.log(error, "ERROR");
      return this.api.render(error);
    }

  }

  /**
   * POST API to create a mediasoup Consumer associated to a Broadcaster.
   * The exact Transport in which the Consumer must be created is signaled in
   * the URL path. Query parameters must include the desired producerId to
   * consume.
   *    @Route ("/rooms/{roomId}/broadcasters/{broadcasterId}/transports/{transportId}/consume",
   *    name="route-mediasoup-rooms-broadcasters-transport-consume")
   *    @Method ({"POST"})
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
   *    @Method ({"POST"})
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
   *    @Method ({"POST"})
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
