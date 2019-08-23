<template>
  <v-list>
    <v-list-group sub-group>
      <template v-slot:activator>
        <v-list-item-title :title=layer.name>{{layer.name}}</v-list-item-title>
      </template>
      
      <v-list-item>
        <v-list-item-action title="Ativar/Desativar">
          <v-switch @click.native="layerSwitchClicked"
          v-model="layer.activated" color="cyan"/>
        </v-list-item-action>

        <v-flex>
          <v-btn fab small @click.stop="clickedRemoveLayer" title="Remover camada">
            <v-icon color="red">delete</v-icon>
          </v-btn>
          <v-menu
            :close-on-content-click="false"
            :nudge-width="200"
            offset-x
          >
            <template v-slot:activator="{ on }">
              <v-btn class=ml-4 fab small title="Editar estilo" v-on="on">
                <v-icon>color_lens</v-icon>
              </v-btn>
            </template>
            
            <v-color-picker
              v-model="color"
              hideInputs
              hideModeSwitch
              class="mx-auto"
            />
          </v-menu>
          <v-btn class=ml-4 fab small @click="zoomToLayer" title="log">
            <v-icon>zoom_in</v-icon>
          </v-btn>
          <v-btn class=ml-4 fab small @click.stop="onClick_requestOptions" title="Opções da camada">
            <v-icon color="blue">info</v-icon>
          </v-btn>
        </v-flex>
        
      </v-list-item>

    </v-list-group>
      
    <v-layout row justify-center>
      <v-dialog v-model="dialogOptions" >
        <v-card>
          <v-card-text>
            <basic-hyper-options
            @closeDialog="closeDialog"
            :optionsLayer="optionsLayer"
            :hyperLayer="layer" />
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-list>
</template>

<script>
import axios from 'axios';
import Style from 'ol/style/Style'
import { GeoHyperLayerResource, OptionsLayer } from '../utils/LayerResource'
import BasicHyperOptions from './BasicHyperOptions'

export default {
  components: { BasicHyperOptions },
  props: ['layer'],
  data () {
    return {
      dialogOptions: false,
      optionsLayer: null,
      color: ''
    }
  },
  methods: {
    facadeOL() {
      return this.$store.state.facadeOL
    },
    async request (url, http_method=axios.get) {
      try {
        const response = await http_method(url)
        return response

      } catch (e) {
        this.errors.push(e)
        console.log("Houve algum erro durante a requisição. " + this.errors);
      }
    },
    zoomToLayer(){
      //let extent = this.layer.layer_resource.vector_layer.getSource().getExtent()
      //console.log(extent)
      console.log(this.layer)
    },
    createStyle (color) {
      const fill = new Style.Fill({ color: color }) // fundo
      return new Style.Style({
        image: new Style.Circle({
          fill: fill,
          radius: 5
        }), fill })
    },
    closeDialog (options) {
      this.dialogOptions = false
      this.optionsLayer = new OptionsLayer({}, '')
    },
    async onClick_requestOptions() {
      let clickedLayer = this.layer
      const response = await this.request(clickedLayer.iri, axios.options)
      this.dialogOptions = true
      this.optionsLayer = new OptionsLayer(response.data, clickedLayer.iri)
    },
    clickedRemoveLayer() {
      let aResourceLayer = this.layer
      this.facadeOL().map.removeLayer(aResourceLayer.layer)
      this.$store.commit('removeLayerResource', aResourceLayer)
    },
    layerSwitchClicked() {
      let aResourceLayer = this.layer
      if (aResourceLayer.activated)
        this.facadeOL().map.addLayer(aResourceLayer.layer)
      else {
        this.facadeOL().map.removeLayer(aResourceLayer.layer)
      }
    }
  }
}
</script>
<style>
#titleLayer{
  width: 100px;
  font-size: 12px!important;
  font-style: italic
}
</style>
