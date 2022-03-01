const state = {
  calendars: []
};

const getters = {
  getCalendars: (state) => {
    return state.calendars
  }
}

const mutations = {
  setCalendar(state, calendar) {
    state.calendars.push(calendar)
  }
}

const actions = {
  async getRemoteCalendars({
    commit,
    dispatch
  }) {
    const $nodefony = this._vm.$nodefony
    const url = `calendar/list`;
    return await $nodefony.request(url, "GET", {})
      .then((res) => {
        if (res && res.result.length) {
          for (let i = 0; i < res.result.length; i++) {
            commit('setCalendar', res.result[i])
          }
        }
        return res.result
      })
      .catch(e => {
        throw e;
      })

  },
  async getRemoteCalendar({
    commit,
    dispatch
  }, {
    id
  }) {
    const $nodefony = this._vm.$nodefony
    const url = `calendar/calendar/${id}`;
    return await $nodefony.request(url, "GET", {})
      .then((res) => {
        return res.result
      })
      .catch(e => {
        throw e;
      })
  }
};


export default {
  state,
  getters,
  actions,
  mutations
}
