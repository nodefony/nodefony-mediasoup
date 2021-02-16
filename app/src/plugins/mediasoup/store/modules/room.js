const state = {
  room: null,
  roomEntity:null,
  peers:null,
  chatMessages:[],
  unreadMessages:0,
  nbWaiting:0
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
  },
  nbWaiting(state){
    return state.nbWaiting
  },
  nbUnreadMessage(state){
    return state.unreadMessages
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
    if( ! message.from.local ){
      this.commit('setUnreadMessage');
    }
    state.chatMessages.push( message);
  },
  setNbWaiting(state, value){
    state.nbWaiting = value;
  },
  setUnreadMessage(state, value){
    if (value === 0){
      return state.unreadMessages = value;
    }
    return state.unreadMessages = state.unreadMessages +1;
  }
};

const actions = {};

export default {
  state,
  getters,
  actions,
  mutations
};
