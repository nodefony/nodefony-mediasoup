
const defaultFixtures = [{
  name: "webrtc",
  description:"webrtc Meeting",
  secure: false,
  access:"private",
  sticky_cookie:null
}, {
  name: "broadcast",
  description:"Videos Broadcaster",
  secure: true,
  password: "admin",
  access:"private",
  sticky_cookie:"sticky-room-broadcast"
}];

module.exports.default = defaultFixtures;
