<template>
  <v-list class="pa-0 ma-0">
    <v-list-group>
      <v-list-tile slot="activator">
          <v-list-tile-avatar>
            <v-icon color=green>{{icon_name}}</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{title}}</v-list-tile-title>
          </v-list-tile-content>
      </v-list-tile>
      <v-list-tile>
          <v-list-tile-content>
            <v-select  class="elevation-0" :items="items" v-model="item" item-text= "name" hint="hint"  @change="onChange"  box single-line dense ></v-select>
          </v-list-tile-content>
       </v-list-tile>
       <v-list-tile>
           <v-list-tile-content>
             <v-text-field  v-model="url" label="Enter WMS URL"  @keyup.enter="search" single-line solo ></v-text-field >
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

        <v-list-tile v-for="(layer, index) in wmsLayersFromGetCapabilities" :key="index" >
              <!--<v-checkbox  @click.prevent="layerCheckboxClicked" :label="layer.name"></v-checkbox>-->
          <v-list-tile-action>
            <v-switch  @click.native="layerSwitchClicked(layer)"  v-model="layersBoolean[index]" :disabled="layersBoolean[index]" color="cyan"/></v-switch>
          </v-list-tile-action>
          <v-list-tile-content>
            {{layer.name}}
            <!--<v-checkbox  @click="layerCheckboxClicked(layer)" :value="layer" :label="layer.name"></v-checkbox>-->
          </v-list-tile-content>
        </v-list-tile>
    </v-list-group>
  </v-list>
</template>
<script>
import axios from 'axios';

export default {
  props: {
    name: {type: String, required: false},
    items: { type: Array, required: true}, // Items is Array. each Item  is an object => {name: a_name, value: a_value }
    icon_name: {type: String, required: false},
    title: {type: String, required: false},
    hint:{type: String, required: false}

  },
  data() {
   return {
     itemsName: [],
     item: '',
     url: '',
     errors: [],
     wmsLayersFromGetCapabilities: [],
     selectedLayers: [],
     layersCheckboxChanged: null,
     layersBoolean: []
   }
  },
  methods: {
    onChange(anItem) {
      let changed_item_on = "changed-items-on-list-checkbox"
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
      this.wmsLayersFromGetCapabilities = []
    },
    facadeOL() {
        return this.$store.state.facadeOL
    },

    isWMSGetMap(url) {
      let parsed_url = url.replace(/\s+/g, '')
      return  parsed_url.toUpperCase().indexOf('request=GetMap'.toUpperCase()) != -1
    },
    normalizedUrlWMSCapabilities(url) {
      let id = url.toUpperCase().indexOf('GetCapabilities'.toUpperCase())
      if (id == -1)
        return url + '?service=wms&request=GetCapabilities'
      return url
    },

    async getWMSLayersFromGetMap() {

    },
    async getWMSLayersFromGetCapabilities() {
      let iri = this.normalizedUrlWMSCapabilities(this.url)
      try {
          const response = await axios.get(iri)
          this.wmsLayersFromGetCapabilities = this.facadeOL().getWMSCapabilityLayers(response.data);
          for (let i = 0; i++; i <= this.wmsLayersFromGetCapabilities.length)
            this.layersBoolean[i] = false

      } catch (e) {
          this.errors.push(e)
          console.log("getWMSLayersFromGetCapabilities.Houve algum erro durante a requisição. " + this.errors);
      }
    },
    facadeOL() {
      return this.$store.state.facadeOL
    },
    async search() {

      let iri = null
      if (this.url =='')
        return
      if (this.isWMSGetMap(this.url))
        return this.facadeOL().addWMSLayer(layer)
       else
        return this.getWMSLayersFromGetCapabilities()

    },
    layerSwitchClicked(layer_from_capabilities) {

      let wms_layer_from_capabilities = this.facadeOL().addWMSLayer(layer_from_capabilities)
      this.$store.commit('addLayerResource', wms_layer_from_capabilities)

    }
  },
  mounted() {
    this.itemsName = this.items.map(item => item.name)
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
