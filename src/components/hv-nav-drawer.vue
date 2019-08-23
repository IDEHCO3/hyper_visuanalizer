<template>
<div>
  <v-btn fab @click.stop="toggleDrawer()" class="white transparentButton" fixed top left>
    <v-icon color="red">{{icon_btn}}</v-icon>
  </v-btn>

  <v-navigation-drawer v-model="drawer" app hide-overlay stateless class="transparentnav" width="350" >
    <basic-list-radio-button icon_name="layers" title="Camada base"
    :items="baseLayersRadio"
    @itemChanged="onItemChanged_changeBaseLayer" />
    <v-divider></v-divider>

    <basic-list-hyper-resource icon_name="layers" title="API hipercamadas" :items="geoHyperEntryPoint" />
    <v-divider></v-divider>

    <basic-list-wms icon_name="layers" title="Geoserviços WMS" :items="registeredWMSCapability" />
    <v-divider></v-divider>

    <list-resource icon_name="layers" title="Camadas selecionadas" />
  </v-navigation-drawer>
</div>
</template>

<script>
  import BasicListRadioButton from './basic/BasicListRadioButton'
  import BasicListWms from './BasicListWms'
  import BasicListHyperResource from './BasicListHyperResource'
  import ListResource from './ListResource'

  export default {
    name: 'hv-nav-drawer',
    components: { BasicListRadioButton, BasicListWms, BasicListHyperResource, ListResource },
    data () {
      return {
        drawer: true,
        right: null,

        items: [
          { title: 'Camadas base', icon: 'dashboard' },
          { title: 'Sobre', icon: 'question_answer' }
        ],
        baseLayersRadio: [
          {name: 'Openstreetmap', value: 'OSM'},
          {name: 'Google', value: 'google'},
          {name: 'Google Satélite', value: 'satelite'},
          {name: 'Water color', value: 'watercolor'},
          {name: 'Wikimedia', value: 'wikimedia'},
          {name: 'Nenhum', value: null}
        ],
        registeredWMSCapability: [
          {name: 'BNDES', title: 'Banco Nacional de Desenvolvimento Econômico e Social', url: 'http://www.geoservicos.inde.gov.br/geoserver/BNDES/wms', registration: '', service_type: ''},
          {name: 'SPM', title: 'Secretaria Nacional de Políticas para Mulher', url: 'http://www.geoservicos.inde.gov.br/geoserver/SPM/wms', registration: '', service_type: ''},
          {name: 'CCAR-IBGE', title: 'Coordenação de Cartografia-IBGE', url: 'http://172.30.137.117/geoserver-ccar/ows', registration: '', service_type: ''}
        ],
        geoHyperEntryPoint: [
          {name: 'BCIM 2016', title: 'Base Cartográfica Contínua do Brasil ao Milionésimo-IBGE', url: 'http://172.30.137.117/api/ibge/cartografia/bases-cartograficas/1000k/2016/', registration: '', service_type: ''},
          {name: 'B250 2015', title: 'Base Cartográfica 250k - IBGE', url: 'http://172.30.137.117/api/ibge/cartografia/bases-cartograficas/250k/2015/', registration: '', service_type: ''},
          {name: 'OSM', title: 'Base vetorial do OpenStreetMap de 2017-06', url: 'http://172.30.137.117/api/osm-2017-06/', registration: '', service_type: ''},
          {name: 'CREN - Cobertura de terra', title: 'Cobertura de uso da terra - CREN', url: 'http://172.30.137.117/api/ibge/recursos-naturais/cobertura-uso-terra/', registration: '', service_type: ''},
          {name: 'Atlas Demográfico 2010', title: 'Atlas Demográfico 2010', url: 'http://172.30.137.117/api/ibge/geografia/atlas/demografico/2010/', registration: '', service_type: ''},
          {name: 'Munic 2015', title: 'Munic 2015', url: 'http://ggt-des.ibge.gov.br/api/munic-2015/', registration: '', service_type: ''},

        ],
      }
    },
    methods: {
      onItemChanged_changeBaseLayer(item_radio_base_layer) {
        this.$store.state.facadeOL.setBaseLayer(item_radio_base_layer.value)
      },
      toggleDrawer() {
        this.drawer = !this.drawer
      }
    },
    computed: {
      icon_btn () {
        return this.drawer ? 'chevron_left' : 'chevron_right'
      }
    }
  }
</script>
<style scoped>
.transparentnav {
  margin-top: 80px; 
  opacity: 0.8;
  background-color: white!important;
}
.transparentButton {
  opacity: 0.8;
}
</style>
