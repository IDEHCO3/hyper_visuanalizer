<template>
  <div>
    <v-app dark id="map" />
    <div id="popup" ref="popup"></div>
  </div>
</template>

<script>
import Map from 'ol/Map'
import Overlay from 'ol/Overlay.js';
import Select from 'ol/interaction/Select';

export default {
  name: 'hv-baseview',
  data () {
    return {
      map: null,
      view: null,
      layers: []
    }
  },
  methods: {
    facadeOL() {
      return this.$store.state.facadeOL
    },
    onEachFeature (feature) {
      let result = '<div id="popup-close">X</div>'
      for (const [property_name, property_value] of Object.entries(feature)) {
      	if (property_name !== 'geometry') {
          result += "<p>" + property_name + ": " + property_value + "</p>"
        }
      }
      return result
    },
    popup (evt) {
      console.log(evt);
      const map = this.facadeOL().map
      const popup = new Overlay({ element: this.$refs.popup })
      const popupElement = this.$refs.popup
      const select = new Select()

      map.addInteraction(select)

      select.on('select', function(e) {
        map.removeInteraction(select)
        const layer_properties = e.selected[0].getProperties()
        popup.setPosition(evt.coordinate)
        map.addOverlay(popup)

        let result = '<div id="popup-close">X</div>'
        if (layer_properties) {
          for (const [property_name, property_value] of Object.entries(layer_properties)) {
          	if (property_name !== 'geometry') {
              result += "<p>" + property_name + ": " + property_value + "</p>"
            }
          }
        }

        popupElement.innerHTML = result
        popupElement.firstElementChild.addEventListener('click', () => popup.setPosition(undefined))
      })
    },
  },
  mounted () {
    // FacadeOL default values => id_map='map', coordinates_center=[-4331024.58685793, -1976355.8033415168], a_zoom_value = 4, a_baseLayer_name='OSM'
    this.$store.commit('default_facadeOL')
    this.facadeOL().map.on('singleclick', evt => this.popup(evt))
    //this.$store.state.facadeOL= this.$store.state.;
  }
}
</script>

<style>
  #map {
    height: 100%;
    width: 100%;
    position: absolute;
    bottom: 0;
    z-index: 0;
  }
  #popup {
    color: #000;
    position: absolute;
    background-color: white;
    -webkit-filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
    filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
    padding: 5px;
    padding-top: 15px;
    border-radius: 10px;
    border: 1px solid #cccccc;
    bottom: 12px;
    left: -50px;
    min-width: 280px;
    max-height: 350px;
    overflow-x: hidden;
    overflow-y: auto;
  }
  #popup::-webkit-scrollbar {
    background: #90CAF9;
    width: 13px;
    border-radius: 7px;
  }
  #popup::-webkit-scrollbar-thumb {
    background: #1565C0;
    border-radius: 5px;
  }
  #popup-close {
    position: absolute;
    color: #F44;
    content: 'X';
    height: 20px;
    width: 20px;
    top: 5px;
    right: 10px;
    cursor: pointer;
  }
</style>
