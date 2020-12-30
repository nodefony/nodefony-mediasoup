const now = new Date();

const setStorage = (item, value) => {
  return window.sessionStorage.setItem(item, JSON.stringify(value));
};

const getStorage = (item) => {
  return JSON.parse(window.sessionStorage.getItem(item));
};

const state = {
  clock: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
  sideBar: getStorage("roomsidebar") || [],
  dialogJoin: true,
  dialogQuit: false,
  medias: getStorage("medias") || ["audio", "video"],
  peers: [],
  slider: true
};

const getters = {
  getClock(state) {
    return state.clock;
  },
  getSideBar(state) {
    return state.sideBar;
  },
  getJoinDialog(state) {
    return state.dialogJoin;
  },
  dialogQuit(state) {
    return state.dialogQuit;
  },

  // user medias
  hasAudio(state) {
    return state.medias.includes("audio");
  },
  hasVideo(state) {
    return state.medias.includes("video");
  },
  hasScreen(state) {
    return state.medias.includes("screen");
  },
  hasNoise(state) {
    return state.medias.includes("noise");
  },
  getMedias(state) {
    return state.medias;
  },

  // remote peers
  peers(state) {
    return state.peers;
  },
  getRemotePeer(state) {
    return (peerId) => {
      let find = state.peers.findIndex((peer) => {
        return peer.id === peerId;
      });
      if (find !== -1) {
        return state.peers[find];
      }
      return null;
      //throw new Error(`No peer found ${peerId}`);
    }
  },
  // layouts
  slider(state) {
    return state.slider;
  }
}

const mutations = {
  setClock(state) {
    const now = new Date();
    state.clock = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
  },
  setSideBar(state, value) {
    state.sideBar = value;
    setStorage('roomsidebar', value);
  },
  openJoinDialog(state) {
    state.dialogJoin = true;
  },
  closeJoinDialog(state) {
    state.dialogJoin = false;
  },
  openQuitDialog(state) {
    state.dialogQuit = true;
  },
  closeQuitDialog(state) {
    state.dialogQuit = false;
  },
  setMedia(state, type) {
    let index = state.medias.indexOf(type);
    if (index < 0) {
      state.medias.push(type);
      this.commit("storeMedias", state.medias);
    }
  },
  storeMedias(state, value) {
    state.medias = value;
    setStorage('medias', value);
    return state.medias;
  },
  deleteMedias(state, type) {
    let index = state.medias.indexOf(type);
    if (index >= 0) {
      state.medias.splice(index, 1);
      this.commit("storeMedias", state.medias);
    }
  },

  // remote peer
  addRemotePeer(state, value) {
    state.peers.push(value);
  },
  removePeer(state, id) {
    let index = state.peers.findIndex((peer) => {
      return peer.id === id;
    });
    if (index >= 0) {
      state.peers.splice(index, 1);
    }
  },
  removeAllPeers(state) {
    while (state.peers.length > 0) {
      state.peers.pop();
    }
  },
  //layout
  toogleSlider(state) {
    state.slider = !state.slider;
  }

}

const actions = {};

export default {
  state,
  getters,
  actions,
  mutations
}
