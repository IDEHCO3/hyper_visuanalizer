<template>
<div>
  <v-list class="pa-0 ma-0">
    <v-list-group value="true">
      <template v-slot:activator>
        <v-icon color=orange>{{icon_name}}</v-icon>
        <v-list-item-title>{{title}}</v-list-item-title>
      </template>

      <list-item v-for="(layer, index) in items" :key="index" :layer=layer />
      
    </v-list-group>
  </v-list>
  <v-layout row justify-center>
    <v-dialog v-model="dialogOptions" >
      <v-card>
        <v-card-text>
          <basic-hyper-options
          @closeDialog="closeDialog"
          :optionsLayer="optionsLayer" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-layout>
</div>
</template>
<script>
import axios from 'axios';
import BasicHyperOptions from './BasicHyperOptions'
import ListItem from './ListResourceItem'
import { GeoHyperLayerResource, OptionsLayer } from '../utils/LayerResource'

export default {
  components: { BasicHyperOptions, ListItem },
  props: {
    icon_name: {type: String, required: false},
    title: {type: String, required: false},
  },
  data() {
   return {
     active: true,
     closeDialog: false,
     dialogOptions: false,
     optionsLayer: new OptionsLayer({}, '')
   }
  },
  methods: {
    async request (url, http_method=axios.get) {
      //let iri = null
      try {
        const response = await http_method(url)
        return response

      } catch (e) {
        this.errors.push(e)
        console.log("Houve algum erro durante a requisição. " + this.errors);
      }
    },
    cancel() {
      this.optionsLayer = new OptionsLayer({}, '')
    },
    facadeOL() {
      return this.$store.state.facadeOL
    },

  },
  computed: {
    items () {
      return this.$store.state.layersResource
    }
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
</style>
