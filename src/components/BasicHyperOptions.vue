<template>
  <!--<v-layout row justify-center wrap>-->
  <v-tabs dark v-model="active" color="cyan" slider-color="yellow" >
    <v-tab :key="1" ripple > Atributos </v-tab>
    <v-tab :key="2" ripple > Operações </v-tab>
    <v-tab :key="3" ripple > Requisições </v-tab>
    <v-tab :key="4" ripple > Junções no cliente </v-tab>

    <v-tab-item :key="1">
      <basic-hyper-options-attribute :optionsLayer="optionsLayer" />
    </v-tab-item>
    <v-tab-item :key="2">
      <basic-hyper-options-operation :optionsLayer="optionsLayer" />
    </v-tab-item>
    <v-tab-item :key="3">
      <basic-hyper-options-requisicao @selectedUrl="selectedUrl" @close="closeDialog" :optionsLayer="optionsLayer" />
    </v-tab-item>
    <v-tab-item :key="4">
      <basic-hyper-join-client @close="closeDialog" :optionsLayer="optionsLayer" :hyperLayer="hyperLayer" />
    </v-tab-item>
  </v-tabs>
</template>

<script>
import axios from 'axios';
import BasicHyperOptionsAttribute from './BasicHyperOptionsAttribute'
import BasicHyperOptionsOperation from './BasicHyperOptionsOperation'
import BasicHyperOptionsRequisicao from './BasicHyperOptionsRequisicao'
import BasicHyperJoinClient from './BasicHyperJoinClient'

export default {
  props: {
    optionsLayer: { type: Object, required: false}, // Items is Array. each Item  is an object => {name: a_name, value: a_value }
    hyperLayer: {type: Object, required: false},
  },
  components: { BasicHyperOptionsAttribute, BasicHyperOptionsOperation, BasicHyperOptionsRequisicao, BasicHyperJoinClient },
  data() {
   return {
     active: null
   }
  },
  methods: {
    closeDialog() {
      //console.log('close on BasicHyperOptions')
      this.$emit("closeDialog")
    },
    selectedUrl(expressionUrl) {
      //console.log("selectedUrl: " + expressionUrl);
      this.$emit("expressionUrlSelected", expressionUrl)
    }
  }
}
</script>

<style scoped>
.nospace {
  margin: 0px;
  padding: 0px;
}
.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
  'atributos amostras'
  'opcoes valores'
  'operadores operadores'
  'expressao expressao'
  'botoes botoes';
  grid-column-gap: 10px;
  grid-row-gap: 5px;
}
.atributos {
  height: 300px;
  border:5px solid #EEEEEE;
  grid-area: atributos;
  overflow: auto;
}
.atributo-list:nth-child(odd), .valores-list:nth-child(odd) {
  background: #ECEFF1;
}
.atributo-list:nth-child(even), .valores-list:nth-child(even) {
  background: #CFD8DC;
}
</style>
