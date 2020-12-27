const state = {
  peer:null,
  audioStream: null,
  videoStream: null
};

const getters = {
  // peer
  getPeer(state) {
    return state.peer;
  },
  // stream
  audioStream(state) {
    return state.audioStream;
  },
  videoStream(state) {
    return state.videoStream;
  },
};

const mutations = {
  //peer
  setPeer(state, value){
    state.peer = value;
  },

  // stream
  setAudioStream(state, value) {
    state.audioStream = value;
    return state.audioStream;
  },
  deleteAudioStream(state) {
    if (state.audioStream) {
      state.audioStream.stop();
      this.commit("setAudioStream", null);
    }
  },
  setVideoStream(state, value) {
    state.videoStream = value;
    return state.videoStream;
  },
  deleteVideoStream(state) {
    if (state.videoStream) {
      state.videoStream.stop();
      this.commit("setVideoStream", null);
    }
  },
};

const actions = {};



export default {
  state,
  getters,
  actions,
  mutations
}
