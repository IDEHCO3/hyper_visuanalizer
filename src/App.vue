<template>
  <div id="app">
    <v-app id="inspire">
      <hv-baseview/>
      <hv-nav-drawer/>
    </v-app>
  </div>
</template>

<script>
  import HvBaseview from './components/hv-baseview'
  import  HvNavDrawer from './components/hv-nav-drawer'
  export default {
    name: 'app',
    components: { 
      'hv-baseview': HvBaseview,
      'hv-nav-drawer': HvNavDrawer
    }
  }
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}
</style>

