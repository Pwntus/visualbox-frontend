import Vue from 'vue'
import * as t from '@/store/types'
import API from '@/service/API'
import { cloneDeep } from '@/lib/utils'

const state = {
  list: [],
  public: []
}

const mutations = {
  [t.INTEGRATION_RESET] (state) {
    state.list = []
    state.public = []
  },
  [t.INTEGRATION_SET_LIST] (state, payload) {
    state.list = cloneDeep(payload)
  },
  [t.INTEGRATION_CONCAT_LIST] (state, payload) {
    state.list = state.list.concat(payload)
  },
  [t.INTEGRATION_DELETE_LIST] (state, id) {
    state.list = state.list.filter(i => i.id !== id)
  },
  [t.INTEGRATION_COMMIT] (state, project) {
    const index = state.list.findIndex(({ id }) => id === project.id)
    if (index >= 0)
      Vue.set(state.list, index, project)
  },
  [t.INTEGRATION_CLEAN_DASHBOARD] (state, integrations) {
    // Remove every integration that does not exist in list
    integrations.forEach(i => {
      const index = state.list.findIndex(a => a.id === i.id)
      if (index < 0)
        integrations.splice(index, 1)
    })
  }
}

const actions = {
  async list ({ commit }) {
    let result = [] // Default value

    try {
      result = await API.invoke('get', '/integration')
    } catch (e) {
      throw e
    } finally {
      commit(t.INTEGRATION_SET_LIST, result)
    }
  },
  async create ({ commit }, id = null) {
    let result = [] // Default value

    try {
      result.push(await API.invoke('post', '/integration', {
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
      await API.invoke('del', `/integration/${id}`)
    } catch (e) {
      throw e
    } finally {}
  },

  async commit ({ commit, getters }, project) {
    try {
      const { id } = project
      const old = getters.integrationById(id)
      if (!old)
        return

      const { uid, createdAt } = old
      project.uid = uid
      project.createdAt = createdAt
      project.updatedAt = +new Date()

      commit(t.INTEGRATION_COMMIT, project)
      await API.invoke('put', `/integration/${id}`, { body: project })
    } catch (e) {
      throw e
    }
  },

  async loadPublic ({ commit }, id) {
    let result = null // Default value

    try {
      result = await API.invoke('get', `/integration/${id}`)
    } catch (e) {
      throw e
    } finally {
      commit(t.INTEGRATION_SET_PUBLIC, result)
    }
  }
}

const getters = {
  /**
   * Get an integration by ID.
   */
  integrationById: ({ list }) => id => {
    return list.find(i => i.id === id)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
