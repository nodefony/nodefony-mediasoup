import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// nodefony store
import user from '../plugins/nodefony/store/modules/user'
import auth from '../plugins/nodefony/store/modules/auth'

// mediasoup store
import mediasoup from '../plugins/mediasoup/store/modules/mediasoup'
import mediasoupPeer from '../plugins/mediasoup/store/modules/peer'
import mediasoupRoom from '../plugins/mediasoup/store/modules/room'

// application store
import app from './application/index.js'
import room from './application/room/index.js'


export default new Vuex.Store({
  state:{},
  getters:{},
  mutations: {},
  modules: {
    app,
    room,
    user,
    auth,
    mediasoup,
    mediasoupPeer,
    mediasoupRoom
  }
});
