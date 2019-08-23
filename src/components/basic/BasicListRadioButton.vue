<template>
  <v-list class="pa-0 ma-0">
      <v-list-group>
        <template v-slot:activator>
          <v-icon color="blue-grey">{{icon_name}}</v-icon>
          <v-list-item-title>{{title}}</v-list-item-title>
        </template>

        <!--
        <v-radio-group :mandatory="true" @change="onChange" v-model="selectedItem">
          <v-list-item v-for="(item, index) in items" :key="index">
            <v-radio :value="item" :label="item.name"/>
          </v-list-item>
        </v-radio-group>
        -->
        <v-radio-group class="ma-0" :mandatory="true" @change="onChange" v-model="selectedItem">
          <v-list-item v-for="(item, index) in items" :key="index">
            <v-radio :value="item" :label="item.name"/>
          </v-list-item>
        </v-radio-group>

      </v-list-group>
  </v-list>
</template>

<script>
export default {
  props: {
    items: { type: Array, required: true}, // Items is Array. each Item  is an object => {name: a_name, value: a_value }
    icon_name: {type: String, required: false},
    title: {type: String, required: false}
  },
  data () {
   return {
     selectedItem: null
   }
  },
  methods: {
    onChange () {
      console.log(this.selectedItem)
      this.$emit("itemChanged", this.selectedItem)
    }
  },
  mounted () {
    // Auto-select first item of the list
    this.selectedItem = this.items[0]
  }
}
</script>
