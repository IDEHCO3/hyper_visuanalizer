<template>
<div>
  <v-expansion-panels color="black" focusable>

    <v-expansion-panel v-for="(operation, index) in optionsLayer.supportedOperations" :key="index">
      <v-expansion-panel-header>{{ operation["hydra:operation"] }}</v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-card>
          <v-card-text class="grey lighten-2">Descrição: </v-card-text>
          <v-card-text class="grey lighten-2">Semântica da operação em: <a target="_blank">{{ operation["@id"] }} </a></v-card-text>
          <v-card-text class="grey lighten-2" v-if="(operation['hydra:expects'].length) > 0">Parâmetros esperados:
            <v-flex v-for="(obj_parameter, index) in operation['hydra:expects']" :key="index">
              <v-text-field :label="obj_parameter['parameter']" append-icon="check_circle"> </v-text-field>
            </v-flex>
          </v-card-text>
          <v-card-text class="grey lighten-2">Retorno da operação: {{ operation["hydra:returns"] }}</v-card-text>
          <v-card-text class="grey lighten-2">Método HTTP: {{ operation["hydra:method"] }}</v-card-text>
          <v-card-text class="grey lighten-2">Exemplo: <a>{{ optionsLayer.iri }}/{{ operation["hydra:operation"] }}/{{ parameters_str(operation['hydra:expects']) }}</a></v-card-text>
        </v-card>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>

  <v-flex class="botoes">
    <v-btn tile outlined color="success" @click.native="closeDialog">Ok</v-btn>
  </v-flex>
</div>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    name: {type: String, required: false},
    optionsLayer: { type: Object, required: false}, // Items is Array. each Item  is an object => {name: a_name, value: a_value }
    icon_name: {type: String, required: false},
    title: {type: String, required: false}
  },
  methods: {
    log(msg) {
      console.log(msg);
    },
    parameters_str (parameters) {
      if (parameters.length == 0)
        return ''

      return '{' + parameters.join('&') + '}'
    },
    closeDialog () {
      this.$emit('close')
      console.log('close on BasicHyperOptionsOperation')
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
.operation {
  height: 300px;
  border:5px solid #EEEEEE;
  grid-area: atributos;
  overflow: auto;
}
.operation-list:nth-child(odd), .valores-list:nth-child(odd) {
  background: #ECEFF1;
}
.operation-list:nth-child(even), .valores-list:nth-child(even) {
  background: #CFD8DC;
}
</style>
