import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import user from '../plugins/nodefony/store/modules/user'
import auth from '../plugins/nodefony/store/modules/auth'
import api from '../plugins/nodefony/store/modules/api'


import peer from '../plugins/mediasoup/store/modules/peer'
import room from '../plugins/mediasoup/store/modules/room'


export default new Vuex.Store({
  modules: {
    user,
    auth,
    api,
    peer,
    room
  }
})
