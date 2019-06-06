<template>
  <div>
  <v-list class="pa-0 ma-0">
    <v-list-group>
      <v-list-tile slot="activator">
          <v-list-tile-avatar>
            <v-icon color="brown darken-1">{{icon_name}}</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{title}}</v-list-tile-title>
          </v-list-tile-content>
      </v-list-tile>
      <v-list-tile>
          <v-list-tile-content>
              <v-select  slot="activator" class="elevation-0" :items="items" v-model="item" item-text= "name" hint="item.title"  @change="onChange"    box single-line dense ></v-select>
          </v-list-tile-content>
       </v-list-tile>
       <v-list-tile>
           <v-list-tile-content>
             <v-text-field  v-model="url"  label="Enter with URL " @keyup.enter="search" solo single-line dense ></v-text-field >
           </v-list-tile-content>
           <v-list-tile-content>
               <v-btn icon :disabled="url==''" @click.stop="search" >
                  <v-icon  color="blue">search</v-icon>
                </v-btn>
           </v-list-tile-content>
            <v-list-tile-content>
               <v-btn icon @click.stop="cancel" >
                  <v-icon color="red">cancel</v-icon>
                </v-btn>
           </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-for="(layer, index) in layersFromGeoHyperEntryPoint" :key="index" >
              <!--<v-checkbox  @click.prevent="layerCheckboxClicked" :label="layer.name"></v-checkbox>-->
          <v-list-tile-action>
            <v-btn slot="activator" @click.stop="clickedOnInfoLayer(layer)" icon><v-icon color="blue">info</v-icon></v-btn>
          </v-list-tile-action>
          <v-list-tile-action>
            <v-switch  @click.native="layerSwitchClicked(layer)"  v-model="layersBoolean[index]"  color="cyan" :disabled="layersBoolean[index]" /></v-switch>
          </v-list-tile-action>
          <v-list-tile-content dense>
            {{layer.name}}
            <!--<v-checkbox  @click="layerCheckboxClicked(layer)" :value="layer" :label="layer.name"></v-checkbox>-->
          </v-list-tile-content>
        </v-list-tile>
    </v-list-group>
  </v-list>
  <v-layout row justify-center>
     <v-dialog v-model="dialog_options" >
      <v-card>
        <v-card-text>
          <basic-hyper-options v-on:closeDialog="closeDialog" v-on:expressionUrlSelected="expressionUrlSelected" :optionsLayer="optionsLayer" :title="layerName"> </basic-hyper-options>
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
export class HyperResourceLayer {
  constructor(a_name, an_iri) {
    this.name = a_name
    this.iri  = an_iri
  }
}

export default {
  props: {
    name: {type: String, required: false},
    items: { type: Array, required: true}, // Items is Array. each Item  is an object => {name: a_name, value: a_value }
    icon_name: {type: String, required: false},
    title: {type: String, required: false},
    hint:{type: String, required: false}

  },
  components: {BasicHyperOptions},
  data() {
   return {
     itemsName: [],
     item: '',
     url: '',
     errors: [],
     layersFromGeoHyperEntryPoint: [],
     layersBoolean: [],
     dialog_options: false,
     optionsLayer: new OptionsLayer([], [], {}, {}),
     layerName: ''

   }
  },
  methods: {
    async request(url, http_method=axios.get ) {
      let iri = null
      try {

          const response = await http_method(url)
          return response

      } catch (e) {
          this.errors.push(e)
          console.log("Houve algum erro durante a requisição. " + this.errors);
      }
    },
    async clickedOnInfoLayer(a_layer) {
      const response = await this.request(a_layer.iri, axios.options)
      this.dialog_options = true
      this.layerName = a_layer.name
      this.optionsLayer = new OptionsLayer(response.data["hydra:supportedProperties"], response.data["hydra:supportedOperations"], response.data["@context"], response.data["hydra:iriTemplate"], a_layer.iri)  //supportedProperties, supportedOperations, context,  iriTemplate
    },
    onChange(anItem) {
      //let changed_item_on = "changed-items-on-list-checkbox"
      console.log(anItem);
      let idx = this.itemsName.indexOf(anItem)
      let itemObject = this.items[idx]
      if(!itemObject)
        return
      this.url = itemObject.url
      //this.$emit(changed_item_on, itemObject)
    },
    cancel() {
      this.item = ''
      this.url = ''
      this.layersFromGeoHyperEntryPoint = []
    },
    closeDialog(options) {
      this.dialog_options=false
      this.optionsLayer = new OptionsLayer([], [], {}, {})
    },
    expressionUrlSelected(expressionUrlSelected) {
      console.log(expressionUrlSelected)
      this.dialog_options=false
      this.url = expressionUrlSelected
      this.search()
    },
    facadeOL() {
        return this.$store.state.facadeOL
    },
    isEntryPoint(headers) {
      let id = headers.link.toUpperCase().indexOf('://schema.org/EntryPoint"'.toUpperCase())
      return id != -1
    },
    getLayersFromEntryPoint(json_name_url) {
      Object.entries(json_name_url).forEach(entry => {
          let name_iri_boolean_object = { name: entry[0], iri: entry[1], was_requested: false}
          this.layersFromGeoHyperEntryPoint.push(name_iri_boolean_object)
          this.layersBoolean.push(false)
      })
    },
    updateLayerFromHyperResourceURL(response) {
      let  vector_layer_ol =  this.facadeOL().addVectorLayerFromGeoJSON(response.data)
      let  geo_hyper_layer = new GeoHyperLayerResource(vector_layer_ol, this.url, null )
      this.$store.commit('addLayerResource', geo_hyper_layer)
    },

    async search() {
          const response = await this.request(this.url)
          //debugger
          if (this.isEntryPoint(response.headers))
             this.getLayersFromEntryPoint(response.data)
          else
             this.updateLayerFromHyperResourceURL(response)
    },
    async layerSwitchClicked(name_iri_boolean_object) {

      let response = await this.request(name_iri_boolean_object.iri)
      this.updateLayerFromHyperResourceURL(response)
    }
  },
  mounted() {
    this.itemsName = this.items.map(item => item.name)
    this.optionsLayer = new OptionsLayer([], [], {}, {})  //supportedProperties, supportedOperations, context,  iriTemplate
  }

}
</script>
<style scoped>
.nospace {
   margin: 0px;
   padding: 0px;
}
.firsplane {
  position: absolute;
  z-index: 20000;
}
</style >
