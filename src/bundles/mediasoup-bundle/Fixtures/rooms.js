const defaultFixtures = [{
  name: "room1",
  description: "Webrtc Meeting",
  secure: false,
  access: "private",
  sticky_cookie: null
}, {
  name: "room2",
  description: "Webrtc Meeting Secure",
  secure: true,
  password: "12345678",
  access: "private",
  sticky_cookie: "sticky-room-broadcast"
}, {
  name: "room3",
  type: "WEBRTC",
  description: "Webrtc Public Meeting Secure",
  secure: true,
  password: "12345678",
  access: "public",
  sticky_cookie: "sticky-room-broadcast"
},{
  name: "room4",
  description: "Webrtc Meeting Secure waiting",
  secure: true,
  password: "12345678",
  access: "private",
  waitingconnect:"true",
  sticky_cookie: "sticky-room-broadcast"
}];

module.exports.default = defaultFixtures;
