const now = new Date();

const setStorage = (item, value)=>{
  return window.sessionStorage.setItem(item, JSON.stringify(value));
};

const getStorage = (item)=>{
  return JSON.parse( window.sessionStorage.getItem(item) );
};

const state = {
  clock: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
  sideBar: getStorage("roomsidebar") || [],
  dialogJoin: true,
  dialogQuit: false,
  medias: getStorage("medias") || ["audio","video"],
  audioStream:null,
  videoStream:null,
  peers:[]
};

const getters = {
  getClock(state){
    return state.clock;
  },
  getSideBar(state){
    return state.sideBar;
  },
  getJoinDialog(state){
    return state.dialogJoin;
  },
  dialogQuit(state){
    return state.dialogQuit;
  },
  hasAudio(state){
    return state.medias.includes("audio");
  },
  hasVideo(state){
    return state.medias.includes("video");
  },
  hasScreen(state){
    return state.medias.includes("screen");
  },
  hasNoise(state){
    return state.medias.includes("noise");
  },
  medias(state){
    return state.medias;
  },
  audioStream(state){
    return state.audioStream;
  },
  videoStream(state){
    return state.videoStream;
  },
  peers(state){
    return state.peers;
  },
  getPeer(state, peerId){
    let find = state.peers.findIndex((peer) => {
      return peer.id === peerId;
    });
    if (find !== -1) {
      return state.peers[find];
    }
    throw new Error(`No peer found ${peerId}`);
  }
}

const mutations = {
 setClock(state){
   const now = new Date();
   state.clock = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
 },
 setSideBar(state, value){
   state.sideBar = value;
   setStorage('roomsidebar', value);
 },
 openJoinDialog(state){
   state.dialogJoin = true;
 },
 closeJoinDialog(state){
   state.dialogJoin = false;
 },
 openQuitDialog(state){
   state.dialogQuit = true;
 },
 closeQuitDialog(state){
   state.dialogQuit = false;
 },
 setMedias(state, value){
   state.medias = value;
   setStorage('medias', value);
   return state.medias;
 },
 deleteMedias(state, type){
   let index = state.medias.indexOf(type);
   if ( index >= 0 ){
      state.medias.splice(index, 1);
      this.commit("setMedias", state.medias);
   }
 },
 setAudioStream(state, value){
   state.audioStream = value;
   return state.audioStream;
 },
 deleteAudioStream(state){
   if(state.audioStream){
     state.audioStream.stop();
     this.commit("setAudioStream", null);
   }
 },
 setVideoStream(state, value){
   state.videoStream = value;
   return state.videoStream;
 },
 deleteVideoStream(state){
   if(state.videoStream){
     state.videoStream.stop();
     this.commit("setVideoStream", null);
   }
 },
 addPeer(state, value){
   state.peers.push(value);
 },
 removePeer(state, id){
   let index = state.peers.indexOf(id);
   if ( index >= 0 ){
      state.peers.splice(index, 1);
   }
 },
 removeAllPeers(state){
   while (state.peers.length > 0) {
     state.peers.pop();
   }
 }
}

const actions = {};

export default {
  state,
  getters,
  actions,
  mutations
}
