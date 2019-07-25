<template>
  <v-card>
    <v-card-title class="indigo white--text headline">
      Apis
      <v-spacer> </v-spacer>
       <v-text-field  label="Entre com a Url da API"></v-text-field>
    </v-card-title>
    <v-layout justify-space-between pa-3>
      <v-flex xs5>
        <v-treeview :active.sync="active" :items="items" :load-children="selectedItem" :open.sync="open"  activatable
          active-class="primary--text"
          class="grey lighten-5"
          open-on-click
          transition
        >
          <v-icon v-if="!item.children" slot="prepend" slot-scope="{ item, active }" :color="active ? 'primary' : ''">
              mdi-account
          </v-icon>
        </v-treeview>
      </v-flex>
      <v-flex d-flex text-xs-center >
        <v-scroll-y-transition mode="out-in">
          <div v-if="!selected" class="title grey--text text--lighten-1 font-weight-light" style="align-self: center;">
            Selecione uma URL
          </div>
          <v-card v-else :key="selected.id" class="pt-4 mx-auto" flat max-width="400" >
            <v-card-text>
              
              
            </v-card-text>
            <v-divider></v-divider>
            <v-layout tag="v-card-text"  text-xs-left wrap >
              <v-flex tag="strong" xs5 text-xs-right mr-3 mb-2>Company:</v-flex>
              
              <v-flex tag="strong" xs5 text-xs-right mr-3 mb-2>Website:</v-flex>
              
              <v-flex tag="strong" xs5 text-xs-right mr-3 mb-2>Phone:</v-flex>
              
            </v-layout>
          </v-card>
        </v-scroll-y-transition>
      </v-flex>
    </v-layout>
  </v-card>
</template>

<script>
import axios from 'axios'
export default {
    props: {
        name: {type: String, required: false},
        optionsLayer: { type: Object, required: false}, // Items is Array. each Item  is an object => {name: a_name, value: a_value }
        icon_name: {type: String, required: false},
        title: {type: String, required: false},
    },
    data() {
        return {
         apis: [ {id: '1', name: 'http://127.0.0.1:8000/api/bcim/', children: []} ],      
         active: [],
         open: [],
        }
    },
    computed: {
      items () {
        return [
          {
            name: 'Apis',
            children: this.apis
          }
        ]
      },
      findItem(apis) {
        if (apis == undefined)
            return 
        res = apis.find(api => api.id === id)
        if (res == undefined)
          api
        
      },
      selected() {
        if (!this.active.length) return undefined
        const id = this.active[0]
        console.log(this.active[0])
        console.log(this.items)
        return this.apis.find(api => api.id === id)
      }
    },
    methods: {
        async request(url, http_method=axios.get) {
            let iri = null
            try {
                return await http_method(url)
                
            } catch (e) {
                this.errors.push(e)
                console.log("Houve algum erro durante a requisição. " + this.errors);
            }
        },
        isEntryPoint(link_header) {
            return link_header.toLowerCase().indexOf('//schema.org/entrypoint') > - 1
        },
        async selectedItem(item){
            console.log(item)
            if (!item)
                return
            let response = await this.request(item.name,axios.head)  
            if (!this.isEntryPoint(response.headers.link)) 
                return 
            response = await this.request(item.name)  

            let id = 1
            let children = []
            
            for (let [key, value] of Object.entries(response.data)) {
                id++
                let id_str = ''+ item.id + id
                let obj = {id: id_str, name: value}
                children.push(obj)
            }
            
            item.children= children
    
            
        }
    },
    
}
</script>
