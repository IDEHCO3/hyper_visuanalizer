<template>
<div>
  <v-list class="pa-0 ma-0">
    <v-list-group  value="true">
      <template v-slot:activator>
        <v-icon color="brown darken-1">{{icon_name}}</v-icon>
        <v-list-item-title >{{title}}</v-list-item-title>
      </template>
      
      <v-list-item>
        <v-list-item-content class="pt-0 pb-0">
          <v-select
            class=mt-2
            shaped
            outlined
            filled
            dense
            item-text="name"
            :items="items" 
            v-model="itemSelected"
            @change="onChange"
            single-line
            return-object
          />

          <v-text-field  
            style="border-radius: 0 0 16px 16px"
            outlined
            dense 
            v-model="url" label="Insira a URL"
            @keyup.enter="search(url)" 
            solo  
            single-line
          >
            <template v-slot:append>
              <v-fade-transition leave-absolute>
                <v-icon :disabled="url==''" @click.stop="search(url)" color="blue">search</v-icon>
              </v-fade-transition>
            </template>
            <template v-slot:append-outer > 
              <v-fade-transition leave-absolute>
                <v-btn icon @click.stop="cancel" style="top: -12px">
                  <v-icon color="red">cancel</v-icon>
                </v-btn>
              </v-fade-transition>
            </template>
          </v-text-field>
        </v-list-item-content>
      </v-list-item>

      <v-list-item v-for="(layer, index) in layersFromGeoHyperEntryPoint" :key="index">
        <v-list-item-content>
          <v-list-item-title v-text="layer.name" :title=layer.name />
        </v-list-item-content>

        <v-list-item-action class=ml-2>
          <v-btn-toggle rounded>
            <v-btn @click.native="onClick_downloadLayer(layer)">
              <v-icon color=green>get_app</v-icon>
            </v-btn>
            <v-btn @click.stop="onClick_requestOptions(layer)">
              <v-icon color=blue>info</v-icon>
            </v-btn>
          </v-btn-toggle>
        </v-list-item-action>

      </v-list-item>
    </v-list-group>
  </v-list>

  <v-layout row justify-center>
    <v-dialog v-model="dialogOptions" >
      <v-card>
        <v-card-text>
          <basic-hyper-options
          @closeDialog="closeDialog" @expressionUrlSelected="onSelectUrl_downloadResource"
          :optionsLayer="optionsLayer" :title="layerName"/>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-layout>
</div>
</template>

<script>
import axios from 'axios';
import { GeoHyperLayerResource, OptionsLayer } from '../utils/LayerResource'
import BasicHyperOptions from './BasicHyperOptions'

import geobuf from 'geobuf'
import Pbf from 'pbf'
import { log } from 'util';

export class Layer {
  constructor (iri, name) {
    this.name = name ? name : this.nameFromIRI(iri)
    this.iri = iri
    this._response = null
  }
  nameFromIRI (iri) {
    let arr = iri.split('/');
    let last = arr.length - 1;

    if (arr[last] == "")
      return arr[last - 1].toUpperCase();

    return arr[last].toUpperCase();
  }
  /*async request (http_method=axios.get) {
    if (this.iri == null || this.iri == undefined || this.iri == '') {
      return null
    }
    try {
      
      if (http_method == axios.get) {
        let configToResquestABuffer = {
          responseType: 'arraybuffer',
          headers: {'Accept': 'application/octet-stream'}
        }
        var responseOfGet = await http_method(this.iri, configToResquestABuffer)

        if (this._response == null) {
          responseOfGet.data = geobuf.decode(new Pbf(responseOfGet.data))
          console.log("response data parsed", responseOfGet.data)

          this._response = responseOfGet
          
          return this._response
        }
      }
      const response = await http_method(this.iri)
      return response
    } catch (e) {
      this.errors.push(e)
      console.log("Houve algum erro durante a requisição. " + this.errors);
    }
  }*/
  async request (http_method=axios.get) {
    if (this.iri == null || this.iri == undefined || this.iri == '') {
      return null
    }
    try {
      const response = await http_method(this.iri)
      if (http_method == axios.get) {
        if (this._response == null) {
          this._response = response
          return this._response
        }
      }
      return response
    } catch (e) {
      this.errors.push(e)
      console.log("Houve algum erro durante a requisição. " + this.errors);
    }
  }
  async isEntryPoint() {
    let response = await this.request(axios.head)
    let link = response.headers.link.toUpperCase()
    let entryPointRel = '://schema.org/EntryPoint'.toUpperCase()

    return link.search(entryPointRel) > -1
  }
}

export default {
  props: {
    name: {type: String, required: false},
    items: { type: Array, required: true}, // Items is Array. each Item  is an object => {name: a_name, value: a_value }
    icon_name: {type: String, required: false},
    title: {type: String, required: false},
  },
  components: { BasicHyperOptions },
  data () {
   return {
     itemSelected: '',
     url: '',
     errors: [],
     layersFromGeoHyperEntryPoint: [],
     layersBoolean: [],
     dialogOptions: false,
     optionsLayer: new OptionsLayer({}, ''),
     layerName: ''
   }
  },
  methods: {
    async onClick_requestOptions (clickedLayer) {
      const response = await clickedLayer.request(axios.options)
      this.dialogOptions = true
      this.layerName = clickedLayer.name
      //this.optionsLayer = new OptionsLayer(response.data["hydra:supportedProperties"], response.data["hydra:supportedOperations"], response.data["@context"], response.data["hydra:iriTemplate"], a_layer.iri)  //supportedProperties, supportedOperations, context,  iriTemplate
      this.optionsLayer = new OptionsLayer(response.data, clickedLayer.iri)
    },
    onChange (anItem) {
      this.url = anItem.url
    },
    cancel () {
      this.itemSelected = null
      this.url = ''
      this.layersFromGeoHyperEntryPoint = []
    },
    closeDialog (options) {
      this.dialogOptions = false
      this.optionsLayer = new OptionsLayer({}, '')
    },
    onSelectUrl_downloadResource (dialogUrl) {
      console.log('Downloading ', dialogUrl)
      this.dialogOptions = false
      this.search(dialogUrl)
    },
    facadeOL () {
      return this.$store.state.facadeOL
    },
    async getLayersFromEntryPoint (layer) {
      let response = await layer.request()

      for (let layerName in response.data) {
        let iri = response.data[layerName]
        let layer = new Layer(iri, layerName)

        this.layersFromGeoHyperEntryPoint.push(layer)
      }
    },
    async updateLayer (layer) {
      let response = await layer.request()

      let ol_vectorLayer = this.facadeOL().addVectorLayerFromGeoJSON(response.data)
      let geoHyperLayer = new GeoHyperLayerResource(ol_vectorLayer, layer.iri, null)
      this.$store.commit('addLayerResource', geoHyperLayer)
    },
    search (url) {
      let layer = new Layer(url, null)
      let isEntryPoint = layer.isEntryPoint()

      isEntryPoint.then(response => {
        console.log('isEntryPoint', response, layer);
        if (response) {
          this.getLayersFromEntryPoint(layer)

        } else {
          this.updateLayer(layer)
        }
      })
    },
    onClick_downloadLayer(clickedLayer) {
      this.updateLayer(clickedLayer)
    }
  }
}
</script>

<style>
</style>
