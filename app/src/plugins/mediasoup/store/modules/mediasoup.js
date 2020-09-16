const state = {
  room: null,
  peer: null,
  connected: false,
  activity: false,
  sConnected: false,
  sActivity: false,
};

const getters = {
  getMediasoupStatus(state) {
    return state.connected;
  },
  getMediasoupActivity(state) {
    return state.activity;
  },
  getSipStatus(state) {
    return state.sConnected;
  },
  getSipActivity(state) {
    return state.sActivity;
  }
};

const actions = {

};

const mutations = {
  setConnected(state, value) {
    state.connected = value;
    if (!state.connected) {
      state.activity = false;
    }
  },
  setRoom(state, room) {
    state.room = room;
  },
  setPeer(state, peer) {
    state.peer = peer;
  },
  mediasoupActivity(state) {
    state.activity = !state.activity;
  },
  sipActivity(state) {
    state.sActivity = !state.sActivity;
  },
  sipConnected(state, value) {
    state.sConnected = value;
    if (!state.sConnected) {
      state.sActivity = false;
    }
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
