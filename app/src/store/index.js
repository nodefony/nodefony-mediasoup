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
import appRoom from './application/room/index.js'


// calendar store
import calendar from '../../../src/bundles/calendar-bundle/Resources/vue/store/calendar.js'
import events from '../../../src/bundles/calendar-bundle/Resources/vue/store/events.js'

export default new Vuex.Store({
  modules: {
    app,
    appRoom,
    user,
    auth,
    mediasoup,
    mediasoupPeer,
    mediasoupRoom,
    calendar,
    events
  }
});
