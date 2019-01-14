import * as _ from 'lodash'
import * as t from '@/store/types'
import API from '@aws-amplify/api'
import config from '@/config'
import difference from '@/lib/difference'
import mergeDeep from '@/lib/mergeDeep'
import cloneDeep from '@/lib/cloneDeep'

const state = {
  list: [],
  public: [],
  loaded: null,
  tab: 0
}

const mutations = {
  [t.INTEGRATION_RESET] (state) {
    state.list = []
    state.public = []
    state.loaded = null
    state.tab = 0
  },
  [t.INTEGRATION_SET_TAB] (state, payload) {
    state.tab = payload
  },
  [t.INTEGRATION_SET_LIST] (state, payload) {
    state.list = _.cloneDeep(payload)
  },
  [t.INTEGRATION_CONCAT_LIST] (state, payload) {
    state.list = state.list.concat(payload)
  },
  [t.INTEGRATION_DELETE_LIST] (state, id) {
    state.list = state.list.filter(i => i.id !== id)
  },
  [t.INTEGRATION_SET_LOADED] (state, payload) {
    state.loaded = _.cloneDeep(payload)
  },
  [t.INTEGRATION_CONCAT_LOADED] (state, payload) {
    state.loaded = mergeDeep(state.loaded, payload)
    state.loaded = _.cloneDeep(state.loaded)
  },
  [t.INTEGRATION_COMMIT_LOADED] (state, nullify = false) {
    const { loaded } = state
    let index = state.list.findIndex(i => i.id === loaded.id)
    state.list[index] = _.cloneDeep(loaded)
    state.list = _.cloneDeep(state.list)

    // Used when closing / exiting 'loaded'
    if (nullify)
      state.loaded = null
  },
  [t.INTEGRATION_CLEAN_DASHBOARD] (state, integrations) {
    // Remove every integration that does not exist in list
    integrations.forEach(i => {
      const index = state.list.findIndex(a => a.id === i.id)
      if (index < 0)
        integrations.splice(index, 1)
    })
  },
  [t.INTEGRATION_SET_PUBLIC] (state, payload) {
    // Try to find existing
    const index = state.public.findIndex(item => item.id === payload.id)

    if (index < 0)
      state.public.push(payload)
    else
      state.public[index] = _.cloneDeep(payload)
    state.public = _.cloneDeep(state.public)
  }
}

const actions = {
  async list ({ commit }) {
    let result = [] // Default value

    try {
      result = await API.get(config.env, '/integration')
    } catch (e) {
      throw e
    } finally {
      commit(t.INTEGRATION_SET_LIST, result)
    }
  },
  async create ({ commit }, id = null) {
    let result = [] // Default value

    try {
      result.push(await API.post(config.env, '/integration', {
        body: { id }
      }))
    } catch (e) {
      throw e
    } finally {
      commit(t.INTEGRATION_CONCAT_LIST, result)
    }
  },
  async del ({ commit }, id) {
    // Immediately remove integration from local app
    commit(t.INTEGRATION_DELETE_LIST, id)

    try {
      await API.del(config.env, `/integration/${id}`)
    } catch (e) {
      throw e
    } finally {}
  },
  // Load an integration by making a local copy
  load ({ commit, getters }, id) {
    commit(t.INTEGRATION_SET_LOADED, getters.integrationById(id))
  },
  // Update a loaded local integration
  updateLoaded ({ commit, dispatch }, payload = {}) {
    payload.updatedAt = +new Date()
    commit(t.INTEGRATION_CONCAT_LOADED, payload)
  },
  async closeLoaded ({ commit, dispatch, state, getters }) {
    dispatch('updateLoaded') // To add timestamp
    try {
      const { id } = state.loaded
      const diff = cloneDeep(getters.loadedDiff)
      commit(t.INTEGRATION_COMMIT_LOADED, true) // Must come before API call
      await API.put(config.env, `/integration/${id}`, { body: diff })
    } catch (e) {
      throw e
    }
  },
  // Commit a loaded local integration
  async commitLoaded ({ commit, state, getters }) {
    try {
      await API.put(config.env, `/integration/${state.loaded.id}`, { body: getters.loadedDiff })
      commit(t.INTEGRATION_COMMIT_LOADED)
    } catch (e) {
      throw e
    }
  },
  async loadPublic ({ commit }, id) {
    let result = null // Default value

    try {
      result = await API.get(config.env, `/integration/${id}`)
    } catch (e) {
      throw e
    } finally {
      commit(t.INTEGRATION_SET_PUBLIC, result)
    }
  }
}

const getters = {
  list (state) {
    return state.list
  },
  integrationById: ({ list }) => id => {
    return list.find(i => i.id === id)
  },
  // Return diff between loaded and old item in list
  loadedDiff ({ loaded }, getters) {
    try {
      return difference(loaded, getters.integrationById(loaded.id))
    } catch (e) {
      return {}
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
