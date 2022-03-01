import nodefony from 'nodefony-client';

const state = {

};

const getters = {

}

const mutations = {

}

const actions = {
  async getRemoteEvents({
    commit,
    dispatch
  }, {id, start, end, hasTime, type, timezone}) {
    let options = {
      headers: {
        "Content-Type": "application/json"
      }
    }
    const $nodefony = this._vm.$nodefony
    let url = `events/calendar/${id}/events`;
    if (start || end) {
      if(! hasTime){
        start.hasTime = false
        start.type=type
        end.hasTime = false
        end.type=type
      }
      /*if( start){
        start.date = new Date(start.date).getTime()
      }
      if(end){
        end.date = new Date(end.date).getTime()
      }*/
      //$nodefony.log(start, "WARNING")
      //$nodefony.log(end, "WARNING")
      let qs = $nodefony.queryString({
        start: JSON.stringify(start),
        end: JSON.stringify(end),
        timezone:JSON.stringify(timezone)
      })
      url = `${url}?${qs}`
    }
    return await $nodefony.request(url, "GET", options)
      .then(async (res) => {
        return res.result;
      })
      .catch(e => {
        throw e;
      })
  },

  async getRemoteEventsMonth({
    commit,
    dispatch
  }, {id, month}){
    let options = {
      headers: {
        "Content-Type": "application/json"
      }
    }
    const $nodefony = this._vm.$nodefony
    let url = `events/calendar/${id}/month/events`;
    let qs = $nodefony.queryString({
      month: JSON.stringify(month)
    })
    url = `${url}?${qs}`
    return await $nodefony.request(url, "GET", options)
      .then(async (res) => {
        return res.result;
      })
      .catch(e => {
        throw e;
      })
  },

  async addRemoteEvent({
    commit,
    dispatch
  }, {event, id}) {
    let options = {
      headers: {
        "Content-Type": "application/json"
      }
    }
    options = nodefony.extend(true, {}, options, {
      body: JSON.stringify({
        event: event
      })
    })
    const $nodefony = this._vm.$nodefony
    const url = `events/calendar/${id}/events`
    return await $nodefony.request(url, "POST", options)
      .then(async (res) => {
        return res.result
      })
      .catch((e) => {
        throw e;
      })
  },

  async removeRemoteEvent({
    commit,
    dispatch
  }, {event, id, options}) {
    let defaultOptions = {
      headers: {
        "Content-Type": "application/json"
      }
    }
    options = nodefony.extend(true, {}, defaultOptions, options)
    const $nodefony = this._vm.$nodefony
    const url = `events/calendar/${id}/events/${event.id}`
    return await $nodefony.request(url, "DELETE", options)
      .then( (res) => {
        return res.result
      })
      .catch((e) => {
        throw e;
      })
  },

  async updateRemoteEvent({
    commit,
    dispatch
  }, {event, id, options}) {
    let defaultOptions = {
      headers: {
        "Content-Type": "application/json"
      }
    }
    options = nodefony.extend(true, {}, defaultOptions, options )
    const $nodefony = this._vm.$nodefony
    const url = `events/calendar/${id}/events/${event.id}`
    return await $nodefony.request(url, "PUT", options)
      .then(async (res) => {
        return res.result
      })
      .catch((e) => {
        throw e;
      })
  },
  async patchRemoteEvent({
    commit,
    dispatch
  }, {event, id, options}) {
    let defaultOptions = {
      headers: {
        "Content-Type": "application/json"
      }
    }
    options = nodefony.extend(true, {}, defaultOptions, options )
    const $nodefony = this._vm.$nodefony
    const url = `events/calendar/${id}/events/${event.id}`
    return await $nodefony.request(url, "PATCH", options)
      .then(async (res) => {
        return res.result;
      })
      .catch((e) => {
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
