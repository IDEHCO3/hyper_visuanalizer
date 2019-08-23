import Vue from 'vue'
import Vuex from 'vuex'
import { FacadeOL } from './facade_openlayers.js'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    facadeOL: null,
    layersResource: []
  },
  mutations: {
    default_facadeOL(state, id_map='map', coordinates_center=[-4331024.58685793, -1976355.8033415168], a_zoom_value = 4, a_baseLayer_name='OSM') {
      //FacadeOL default values => id_map='map', coordinates_center=[-4331024.58685793, -1976355.8033415168], a_zoom_value = 4, a_baseLayer_name='OSM'
      state.facadeOL = new FacadeOL(id_map, coordinates_center, a_zoom_value, a_baseLayer_name)
    },
    addLayerResource (state, a_layer_resource) {
       state.layersResource.push(a_layer_resource)
    },
    removeLayerResource(state, a_layer_resource) {
      const index = state.layersResource.indexOf(a_layer_resource);
      state.layersResource.splice(index, 1);
    }
  }
})
