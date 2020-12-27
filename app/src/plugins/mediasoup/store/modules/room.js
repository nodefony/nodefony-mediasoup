const state = {
  room: null
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
  }
};

const mutations = {
  // room
  setRoom(state, value) {
    state.room = value;
  }
};

const actions = {};

export default {
  state,
  getters,
  actions,
  mutations
};
