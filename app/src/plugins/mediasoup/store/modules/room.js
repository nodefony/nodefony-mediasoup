const state = {
  room: null,
  roomEntity:null,
  peers:null
}

const getters = {
  // room
  getRoom(state) {
    return state.room;
  },
  getRoomName() {
    if (state.room){
      return state.room.id;
    }
    return "";
  },
  getRoomEntity(){
    return state.roomEntity;
  },
  getPeers(){
    return state.peers;
  }
};

const mutations = {
  // room
  setRoom(state, value) {
    state.room = value;
  },
  setRoomEntity(state, value){
    state.roomEntity = value;
  },
  setPeers(state, value){
    state.peers = value;
  }
};

const actions = {};

export default {
  state,
  getters,
  actions,
  mutations
};
