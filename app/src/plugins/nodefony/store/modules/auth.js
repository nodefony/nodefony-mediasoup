import {
  AUTH_REQUEST,
  AUTH_ERROR,
  AUTH_SUCCESS,
  AUTH_LOGOUT
} from '../actions/auth'

import {
  // USER_REQUEST,
  USER_PROFILE
} from '../actions/user'


import {
  api as Api
} from 'nodefony'
/*import {
  api as Api
} from '@/../../../nodefony-core/src/nodefony'*/


const state = {
  token: Api.token,
  username: window.localStorage.getItem('username'),
  status: '',
  loading: false,
  decodedToken: null
}

const getters = {
  getUser: state => state.username,
  isAuthenticated: state => !!state.token,
  authStatus: state => state.status,
  isLoading: state => state.loading
}

const actions = {
  [AUTH_REQUEST]: ({
    commit,
    dispatch
  }, {
    url,
    username,
    password
  }) => {
    return new Promise((resolve, reject) => {
      commit(AUTH_REQUEST)
      Api.clearToken();
      return Api.login(url, username, password)
        .then(async response => {
          commit(AUTH_SUCCESS, response.data.result)
          commit(USER_PROFILE, response.data.result.user)
          // let profile = await dispatch(USER_REQUEST, `/api/users/${username}` )
          return resolve(response.data.result)
        })
        .catch(err => {
          commit(AUTH_ERROR, err)
          reject(err)
        })
    })
  },
  [AUTH_LOGOUT]: ({
    commit,
    dispatch
  }) => {
    return new Promise((resolve, reject) => {
      return Api.logout('/api/jwt/logout')
        .then(resp => {
          commit(AUTH_LOGOUT)
          return resolve(resp)
        })
        .catch(err => {
          commit(AUTH_LOGOUT)
          commit(AUTH_ERROR, err)
          return reject(err)
        })
    })
  }
}

const mutations = {
  [AUTH_REQUEST]: (state) => {
    state.status = 'loading'
    state.loading = true
    state.username = window.localStorage.removeItem('username')
  },
  [AUTH_SUCCESS]: (state, resp) => {
    state.status = 'success'
    state.loading = false
    state.token = resp.token
    localStorage.setItem('username', resp.user.username)
    state.username = resp.username
    state.decodedToken = resp.decodedToken
  },
  [AUTH_ERROR]: (state) => {
    state.status = 'error'
    state.loading = false
  },
  [AUTH_LOGOUT]: (state) => {
    state.token = ''
    state.status = 'logout'
    state.loading = false
    state.username = window.localStorage.removeItem('username')
    state.decodedToken = null
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
