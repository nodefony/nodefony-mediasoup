const state = {
  room:null,
  peer:null,
  connected:false
};

const getters = {
  getMediasoupStatus(state){
    return state.connected ;
  }
};

const actions = {};

const mutations = {
  setConnected(state, value){
    state.connected = value;
  },
  setRoom(state, room){
    state.room = room ;
  },
  setPeer(state, peer){
    state.peer = peer ;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
