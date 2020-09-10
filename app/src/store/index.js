import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import user from '../plugins/nodefony/store/modules/user'
import auth from '../plugins/nodefony/store/modules/auth'
import api from '../plugins/nodefony/store/modules/api'


import mediasoup from '../plugins/mediasoup/store/modules/mediasoup'
import peer from '../plugins/mediasoup/store/modules/peer'
import room from '../plugins/mediasoup/store/modules/room'


export default new Vuex.Store({
  state:{
    drawer: true
  },
  getters:{
    getDrawer(state){
      return state.drawer;
    }
  },
  mutations: {
   toogleDrawer (state) {
     state.drawer = ! state.drawer;
   },
   openDrawer(state){
     state.drawer =true;
   },
   closeDrawer(state){
     state.drawer =false;
   }
 },
  modules: {
    user,
    auth,
    api,
    mediasoup,
    peer,
    room
  }
});
