import {
  API_REQUEST,
  API_ERROR,
  API_REQUEST_END
} from '../actions/api'

import {
  api as Api
} from 'nodefony'
/*import {
  api as Api
} from '@/../../../nodefony-core/src/nodefony'*/

const state = {
  loading: false,
  status: "waiting"
};

const getters = {};

const actions = {
  [API_REQUEST]: ({
    commit,
    dispatch
  },
    url,
    method='GET',
    options={}
  ) =>   {
    return new Promise((resolve, reject) => {
      commit(API_REQUEST)
      return Api.http(url, method, options)
        .then(response => {
          commit(API_REQUEST_END);
          return resolve(response);
        })
        .catch(err => {
          commit(API_ERROR, err)
          return reject(err)
        })
    })
  }
};
const mutations = {
  [API_REQUEST]: (state) => {
    state.status = 'loading'
    state.loading = true
  },
  [API_ERROR]: (state) => {
    state.status = 'error'
    state.loading = false
  },
  [API_REQUEST_END]: (state) => {
    state.status = 'finished'
    state.loading = false
  }
};

export default {
  state,
  getters,
  actions,
  mutations
}
