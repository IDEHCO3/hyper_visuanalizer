<template>
  <v-card v-if="optionsLayer">
    <v-card-title class="headline">Opções para gerar requisição</v-card-title>
    <div class="container">

        <div class="atributos">
          Atributos
          <v-list>
            <v-list-item class="campos-list" v-for="(property, index) in optionsLayer.supportedProperties" :key="index">
              
              <v-list-item-content>
                <v-list-item-title v-text="property['hydra:property']" class="black--text"/>
              </v-list-item-content>

              <v-list-item-action>
                <v-btn class="attribute-button" v-if="expressao.includes('{attribute}')"
                @click.native.stop="includeAttribute(property['hydra:property'])" icon small >
                  <v-icon>send</v-icon>
                </v-btn>
                <v-btn class="grey lighten-1" v-else
                @click.native.stop="showAttribute(property['hydra:property'])" icon small >
                  <v-icon>search</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </div>

        <div class="amostra">
          <v-layout wrap>
            <v-flex xs6>
              <v-text-field v-model="a_partir_de" hide-details background-color="white" filled label="A partir de" />
            </v-flex>
            <v-flex xs6>
              <v-text-field v-model="qtd" hide-details background-color="white" filled label="Qtd" />
            </v-flex>
            <v-flex class="amostra" style="border: 1px solid transparent">
              <!--<v-textarea name="Amostras" :value="amostras" hide-details box background-color="white" height="240px" />-->
              <v-list dense style="height: 240px; overflow-y: auto">
                <v-list-item-title v-for="(item, index) in amostras" :key="index" style="height: 30px" ripple>
                  <v-layout align-center justify-start>
                    <v-flex xs10 align-self-center text-xs-left>
                      {{ item }}
                    </v-flex>
                    <v-flex xs2 shrink v-if="expressao.includes('{value}')">
                      <v-btn rounded small icon @click="includeValue(item)">
                        <v-icon color="green">add_circle</v-icon>
                      </v-btn>
                    </v-flex>
                  </v-layout>
                </v-list-item-title>
              </v-list>
            </v-flex>
          </v-layout>
        </div>

        <!-- OPERAÇÔES -->
        <div class="opcoes">
          Operações
          <v-list>
            <v-list-item class="campos-list" v-for="(operation, index) in optionsLayer.supportedOperations" :key="index">

              <v-list-item-content>
                <v-list-item-title>{{ operation['hydra:operation'] }}</v-list-item-title>
              </v-list-item-content>

              <v-list-item-action v-if="operation['hydra:expects'].length">
                <v-btn icon small ripple class="light-blue lighten-1" @click.stop="selectedOperation(operation)">
                  <v-icon>send</v-icon>
                </v-btn>
              </v-list-item-action>

              <v-list-item-action v-else>
                <v-btn icon small ripple @click.stop="selectedOperation(operation)" :class="operation['hydra:returns'].includes('geojson') ? 'light-blue lighten-1' : ''">
                  <v-icon v-if="operation['hydra:returns'].includes('geojson')">layers</v-icon>
                  <v-icon v-else color="light-blue darken-4">info</v-icon>
                </v-btn>
              </v-list-item-action>

            </v-list-item>
          </v-list>
        </div>

        <div class="valores">
          Operações Selecionadas
          <v-list>
            <template v-for="(operation, index) in uris">
              <v-list-item class="campos-list" v-if="operation.name" :key="index">
                
                <v-list-item-content>
                  <v-list-item-title>{{ operation.name }}</v-list-item-title>
                </v-list-item-content>

                <v-list-item-action>
                  <v-text-field v-if="currentOperationsHasParameters()"
                    name="Valor" label="Valor"
                    v-model="operation.value"
                    required
                    class="input-group--focused blue-grey lighten-3"
                  />
                  <v-btn icon small class="red lighten-1" @click.native="removeFilter(operation)">
                    <v-icon>remove</v-icon>
                  </v-btn>
                </v-list-item-action>

              </v-list-item>
            </template>
          </v-list>
        </div>

        <v-container class="operadores" d-flex>
          <v-layout row wrap d-flex class="justify-content: center">
            <v-btn class="grey lighten-3 black--text" @click="includeOperator('eq')">=</v-btn>
            <v-btn class="grey lighten-3 black--text" @click="includeOperator('neq')">!=</v-btn>
            <v-btn class="grey lighten-3 black--text" @click="includeOperator('gt')">></v-btn>
            <v-btn class="grey lighten-3 black--text" @click="includeOperator('lt')"><</v-btn>
            <v-btn class="grey lighten-3 black--text" @click="includeOperator('gte')">>=</v-btn>
            <v-btn class="grey lighten-3 black--text" @click="includeOperator('lte')"><=</v-btn>
            <v-btn class="grey lighten-3 black--text" @click="includeOperator('between')">between</v-btn>
            <v-btn class="grey lighten-3 black--text" @click="includeOperator('isnull')">null</v-btn>
            <v-btn class="grey lighten-3 black--text" @click="includeOperator('isnotnull')">not null</v-btn>
            <v-btn class="grey lighten-3 black--text" @click="includeOperator('like')">like</v-btn>
            <v-btn class="grey lighten-3 black--text" @click="includeOperator('notlike')">not like</v-btn>
            <v-btn class="grey lighten-3 black--text" @click="includeOperator('in')">in</v-btn>
            <v-btn class="grey lighten-3 black--text" @click="includeOperator('notin')">not in</v-btn>
            <v-btn class="grey lighten-3 black--text" @click="includeOperator('and')">and</v-btn>
            <v-btn class="grey lighten-3 black--text" @click="includeOperator('or')">or</v-btn>
          </v-layout>
        </v-container>

      <div class="expressao" style="background-color:lightgrey">
        <!--  label="Expressão de filtragem específica" -->
        <v-textarea name="expressao de filtragem" v-model="expressionUrl" label="Expressão de filtragem específica" auto-grow flat style="padding:15px 10px" />
      </div>

      <v-flex class="botoes">
        <v-btn tile outlined color="success" class="ma-2" @click.native="addFilters(expressionUrl)">Ok</v-btn>
        <v-btn tile outlined color="warning" class="ma-2" @click.native="clearUris">Limpar</v-btn>
        <v-btn tile outlined color="error" class="ma-2" @click.native="close">Cancelar</v-btn>
      </v-flex>

    </div>
  </v-card>
</template>

<script>
import axios from 'axios';
export default {
  props: {
    optionsLayer: { type: Object, required: false },
  },
  data() {
    return {
      uris: [],
      expressionUrl: '',
      attributes: [],
      amostra: '',
      amostras: [],
      a_partir_de: 1,
      current_operation: null,
      qtd: 30,
    }
  },
  methods: {
    async request(url, http_method=axios.get) {
      try {
        const response = await http_method(url)
        return response

      } catch (e) {
        this.errors.push(e)
        console.log("Houve algum erro durante a requisição. " + this.errors);
      }
    },
    async showAttribute (attribute) {
      this.clearAttributes()
      this.url = `${this.optionsLayer.iri}/projection/${attribute}/offset-limit/${this.a_partir_de}&${this.qtd}`

      const response = await this.request(this.url)

      this.amostras = response.data.filter(e => e[attribute] != null || e[attribute] != 'undefined')
      this.amostras = this.amostras.map(e => e[attribute])
    },
    includeAttribute (attribute) {
      const uri = this.uris.find(item => item.value.includes('{attribute}'))
      const uriIndex = this.uris.indexOf(uri)
      const newValue = uri.value.replace(/{attribute}/, attribute)
      this.uris[uriIndex].value = newValue
    },
    currentOperationsHasParameters() {
      if (this.current_operation == null)
        return false

      console.log(this.current_operation['hydra:expects'])
      return true
    },
    clearAttributes () {
      this.attributes = []
    },
    filterExpects (expects) {
      if (expects) {
        return expects.map(
          expect => {
            if (expect.parameter.includes('schema'))
              return expect.parameter.split('/').reverse()[0]
            else
              return expect.parameter.split('#').reverse()[0]
          }
        )
      }
    },
    selectedOperation (operation) {
      let operationName = operation['hydra:operation']
      let expects = this.filterExpects(operation['hydra:expects'])

      if (expects.length == 0) {
        this.uris.push({ name: operationName })
        return

      } else if (operationName == 'collect') {
        expects = '{attribute}&{operation}'

      } else if (expects.includes('expression')) {
        expects = "{attribute}/{operator}/{value}"

      } else {
        let expressions = expects.map(e => `{${e}}`)
        expects = expressions.join('&')
      }

      this.uris.push({ name: operationName, value: expects })
    },
    removeFilter (filter) {
      const filterIndex = this.uris.indexOf(filter)
      this.uris.splice(filterIndex, 1)
    },
    hasOperator (uris) {
      return this.uris.filter(uri => uri.value.includes('{operator}'))
    },
    includeOperator (value) {
      if (this.hasOperator(this.uris).length) {
        const uri = this.uris.find(item => item.value.includes('{operator}'))
        const uriIndex = this.uris.indexOf(uri)
        const newValue = uri.value.replace(/{operator}/, value)
        this.uris[uriIndex].value = newValue

      } else {
        this.uris.push({value})
      }
    },
    addFilters (url) {
      this.$emit('selectedUrl', url)
    },
    includeValue (value) {
      const uri = this.uris.find(item => item.value.includes('{value}'))
      const uriIndex = this.uris.indexOf(uri)
      const newValue = uri.value.replace(/{value}/, value)
      this.uris[uriIndex].value = newValue
    },
    clearUris () {
      this.uris = []
    },
    close () {
      this.clearUris()
      this.clearAttributes()
      this.$emit('close')
    },
  },
  computed: {
    expressao () {
      const uris = this.uris.map(
        operation => {
          let expression = ''

          if (operation.name) {
            expression = operation.name + '/'
            if (operation.value)
              expression = `${expression}${operation.value}/`
          }
          return expression
        }
      ).join('')

      this.expressionUrl = this.optionsLayer.iri + '/' + uris
      return this.url + uris
    }
  }
}
</script>
<style scoped>
.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
  'atributos amostras'
  'opcoes valores'
  'operadores operadores'
  'expressao expressao'
  'botoes botoes';
  grid-column-gap: 7px;
  grid-row-gap: 10px;
  color: white;
  background-color: #3b3f38;

}
.atributos {
  height: 300px;
  border:1px solid #EEEEEE;
  grid-area: atributos;
  overflow: auto;
}
.amostras {
  height: 300px;
  border:1px solid #EEEEEE;
  grid-area: amostras;
  overflow: auto;
}
.opcoes {
  height: 300px;
  border:1px solid #EEEEEE;
  grid-area: opcoes;
  overflow: auto;
}
.valores {
  height: 300px;
  border:1px solid #EEEEEE;
  grid-area: valores;
  overflow: auto;
}
.operadores {
  height: auto;
  border: 1px solid #EEEEEE;
  grid-area: operadores;
}
.expressao {
  padding: 0px;
  height: 70px;
  border:1px solid #EEEEEE;
  grid-area: expressao;
  overflow: auto;
}
.botoes {
  grid-area: botoes;
}
.campos-list:nth-child(odd), .valores-list:nth-child(odd) {
  background: #ECEFF1;
}
.campos-list:nth-child(even), .valores-list:nth-child(even) {
  background: #CFD8DC;
}
.attribute-button {
  animation-name: attribute-button;
  animation-duration: 3s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
div.amostras textarea {
  margin-top: 10px;
}
@keyframes attribute-button {
  0%   {background-color: #B3E5FC}
  25%  {background-color: #4FC3F7}
  50%  {background-color: #29B6F6}
  75%  {background-color: #4FC3F7}
  100% {background-color: #B3E5FC}
}
</style>
