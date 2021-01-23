const state = {
  room: null,
  roomEntity:null,
  peers:null,
  chatMessages:[]
}

const getters = {
  // room
  getRoom(state) {
    return state.room;
  },
  getRoomName(state) {
    if (state.room){
      return state.room.id;
    }
    return "";
  },
  getRoomEntity(state){
    return state.roomEntity;
  },
  getPeers(state){
    return state.peers;
  },
  getChatMessages(state){
    return state.chatMessages;
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
  },
  setChatMessage(state, message){
    state.chatMessages.push(message);
  }
};

const actions = {};

export default {
  state,
  getters,
  actions,
  mutations
};
