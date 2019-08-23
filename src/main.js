import Vue from 'vue'
import App from './App.vue'

// pluglins
import vuetify from './plugins/vuetify';
import { store } from './utils/stateVisuanaliser.js';

Vue.config.productionTip = false

new Vue({
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
