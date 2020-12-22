
const defaultFixtures = [{
  name: "webrtc",
  description:"webrtc Meeting",
  secure: false,
  accees:"private",
  sticky_cookie:null
}, {
  name: "broadcast",
  description:"Videos Broadcaster",
  secure: true,
  password: "admin",
  accees:"private",
  sticky_cookie:"sticky-room-broadcast"
}];

module.exports.default = defaultFixtures;
