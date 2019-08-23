<template>
  <v-card>
    <v-card-title class="indigo white--text headline">
      Apis
      <v-spacer></v-spacer>
      <v-text-field class="txfield-api" color="white" background-color="white"
      outline clearable label="Entre com a Url da API"
      v-model="textFieldApiLink" @keyup.enter="addApiLink(textFieldApiLink)" />
    </v-card-title>

    <v-layout pa-2>
      <v-flex xs6>
        <v-flex style="overflow-y: auto;overflow-x: auto;">
          <v-treeview class="text-xs-left"
          :open.sync="open" :items="items" :load-children="fetchItems"
          :active.sync="active" active-class="primary--text"
          activatable open-on-click transition return-object >

            <v-icon slot="prepend" v-if="!item.children" slot-scope="{ item, active }" >
              play_arrow
            </v-icon>

          </v-treeview>
        </v-flex>
      </v-flex>

      <v-flex xs6 v-if="active.length > 0">
        <v-layout wrap>
          <!-- PARTE ESQUERDA -->
          <v-flex xs6>
            <v-list>
              <v-list-item-title v-for="(property, index) in optionsLayer.supportedProperties" :key="index"
              style="border: 1px solid black">
                <v-flex xs12>
                  {{ property['hydra:property'] }}
                </v-flex>
                <v-flex xs2>
                  <v-radio-group v-model="firstAttribute">
                    <v-radio :value="property['hydra:property']"></v-radio>
                  </v-radio-group>
                </v-flex>
              </v-list-item-title>
            </v-list>
          </v-flex>

          <!-- PARTE DIREITA -->
          <v-flex xs6>
            <v-list>
              <v-flex>
                Camada: {{ selectedItem.name }}
              </v-flex>
              <v-list-item-title v-for="(property, index) in unionOptionLayer.supportedProperties" :key="index"
              style="border: 1px solid black">
                <v-flex xs1>
                  <v-radio-group v-model="unionAttribute">
                    <v-radio :value="property['hydra:property']"></v-radio>
                  </v-radio-group>
                </v-flex>
                <v-flex xs1>
                  <!--<v-checkbox light v-model="propertiesToAdd" :value="property['hydra:property']" />-->
                </v-flex>
                <v-flex xs10>
                  {{property['hydra:property']}}
                </v-flex>
              </v-list-item-title>
            </v-list>
          </v-flex>

          <v-flex xs12 align-self-start>
            <v-btn color="indigo lighten-3" @click="onClick_joinAtributtes">Unir Atributos</v-btn>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-card>
</template>

<script>
import axios from 'axios'
import { OptionsLayer } from '../utils/LayerResource'

export default {
  props: {
    optionsLayer: { type: Object, required: false },
    hyperLayer: { type: Object, required: false },
  },
  data () {
    return {
      textFieldApiLink: '',
      active: [],
      open: [],
      apis: [
        { id: '1', name: 'API IBGE', link: 'http://ggt-des.ibge.gov.br/api/ibge/', children: [] },
        { id: '2', name: 'OSM 2017', link: 'http://ggt-des.ibge.gov.br/api/osm-2017-06/', children: [] },
        { id: '3', name: 'Munic 2015', link: 'http://ggt-des.ibge.gov.br/api/munic-2015/', children: [] },
      ],

      firstAttribute: null,
      unionAttribute: null,
      unionOptionLayer: [],
      //propertiesToAdd: [],
    }
  },
  watch: {
    active () {
      if (this.active.length == 0) {
        this.unionOptionLayer = []
        //this.propertiesToAdd = []
        return
      }

      let selectedApiItem = this.selectedItem
      let options = this.request(selectedApiItem.link, axios.options)

      options.then(response => {
        this.unionOptionLayer = new OptionsLayer(response.data, selectedApiItem.link)
      })
    }
  },
  computed: {
    layerFeatures () {
      return this.hyperLayer.layer.getSource().getFeatures()
    },
    selectedItem () {
      return this.active[0]
    },
    items () {
      return [
        { id: '0', name: 'Apis', link: null, children: this.apis }
      ]
    }
  },
  methods: {
    async request (url, http_method=axios.get) {
      let iri = null

      try {
        return await http_method(url)

      } catch (e) {
        this.errors.push(e)
        console.log("Houve algum erro durante a requisição. " + this.errors);
      }
    },
    isEntryPoint (linkHeader) {
      return linkHeader.toLowerCase().indexOf('//schema.org/entrypoint') > - 1
    },
    async fetchItems (item) {
      if (!item)
        return

      let response = await this.request(item.link, axios.head)
      let linkHeader = response.headers.link

      if (!this.isEntryPoint(linkHeader)) {
        delete item.children
        return
      }

      response = await this.request(item.link)

      let id = 1
      let children = []

      for (let key in response.data) {
        let value = response.data[key]
        let name = response.data[key].split(item.link)

        id++
        let obj = {
          id: '' + item.id + id,
          name: name[1],
          link: value,
        }

        // Gambiarra para saber se o link é nó folha
        if (name[1].endsWith('/'))
          obj.children = []

        children.push(obj)
      }

      item.children = children
    },
    async addApiLink (link) {
      let item = {
        id: this.apis.length + 1,
        name: link,
        link: link,
      }

      let response = await this.request(link, axios.head)
      let linkHeader = response.headers.link
      console.log(response);
      if (this.isEntryPoint(linkHeader)) {
        item.children = []
      }

      this.apis.push(item)
      this.textFieldApiLink = ''
    },

    async onClick_joinAtributtes () {
      let firstAttribute = this.firstAttribute
      let unionAttribute = this.unionAttribute
      let optionLayer = this.optionsLayer
      let unionOptionLayer = this.unionOptionLayer

      await this.layerFeatures.map(
        async layer => {
          let iri = unionOptionLayer.iri.endsWith('/') ? unionOptionLayer.iri : unionOptionLayer.iri + '/'
          //let project = ','.join(this.propertiesToAdd)
          //let projectionFragment = 'projection/' + project
          //console.log(projectionFragment);
          const url = `${iri}filter/${unionAttribute}/eq/${layer.getProperties()[this.firstAttribute]}`

          try {
            const response = await axios.get(url)
            response.data.features.map(prop => {
              Object.keys(prop.properties).map(propKey => {
                if (propKey == 'geom') {
                  return
                }
                //if (this.propertiesToAdd.includes(propKey)) {
                  layer.setProperties({ [propKey]: prop.properties[propKey] })
                //}
              })
            })
          } catch (error) {
            console.log(error)
          }
        }
      )
    }
  },
}
</script>

<style scoped>
  .txfield-api >>> .v-text-field__slot input {
    color: white
  }
  .txfield-api >>> .v-text-field__slot label {
    color: white
  }
</style>
