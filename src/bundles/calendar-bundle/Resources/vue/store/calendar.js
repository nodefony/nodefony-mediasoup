const state = {

};

const getters = {

}

const mutations = {

}

const actions = {
  async getRemoteCalendar({
    commit,
    dispatch
  }, {id}){
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
