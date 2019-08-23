import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import TileImage from 'ol/source/TileImage'
import ImageLayer from 'ol/layer/Image'
import ImageWMS from 'ol/source/ImageWMS'
import Vector from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import VectorLayer from 'ol/layer/Vector'
import WMSCapabilities from 'ol/format/WMSCapabilities'
import Stroke from 'ol/style/Stroke'
import Graticule from 'ol/Graticule'
import axios from 'axios'

import Geobuf from 'geobuf'
import Pbf from 'pbf'
import { WMSCapabilityLayer} from './LayerResource'

export class FacadeOL {
    constructor(id_map='map', coordinates_center=[-4331024.58685793, -1976355.8033415168], a_zoom_value = 4, a_baseLayer_name='OSM' ) {
      this.map = new Map({ target: id_map});
      this.view = new View({center: coordinates_center, zoom: a_zoom_value});
      this.map.setView(this.view);
      this.currentBaseLayer = this.osmBaseLayer();
      this.map.addLayer(this.currentBaseLayer);

    }
    // Begins - These operations are related to the baselayer
    //return a null base layer
    nullBaseLayer() {
      return null
    }
    //returns a OSM TileLayer as baselayer
    osmBaseLayer() {
        return new TileLayer({ source: new XYZ({url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'}), zIndex: 0 })
    }
    //returns a google TileLayer as baselayer
    googleBaseLayer() {
      return new TileLayer({source: new XYZ({url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'}), zIndex: 0})
    }
    //returns a google satelite TileLayer as baselayer
    sateliteBaseLayer() {
      return new TileLayer({source: new TileImage({ url: 'http://mt1.google.com/vt/lyrs=s&hl=pl&&x={x}&y={y}&z={z}'}), zIndex: 0})
    }
    //returns a water TileLayer as baselayer
    watercolorBaseLayer() {
      return new TileLayer({source: new XYZ({url: 'http://{a-c}.tile.stamen.com/watercolor/{z}/{x}/{y}.png'}), zIndex: 0})
    }
    //returns wikimedia TileLayer as baselayer
    wikimediaBaseLayer() {
      return new TileLayer({source: new XYZ({url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'}), zIndex: 0})
    }
    //returns a TileLayer based on name(a_baseLayer_name) or null
    baseLayer(a_baseLayer_name) {
      // name: 'Wikimedia', value: 'wikimedia'}, {name: 'Nenhum', value: null}]
      const layers = {
        'OSM': this.osmBaseLayer(),
        'google': this.googleBaseLayer() ,
        'satelite': this.sateliteBaseLayer(),
        'watercolor': this.watercolorBaseLayer(),
        'wikimedia': this.wikimediaBaseLayer(),
        null: this.nullBaseLayer()
      }
      return layers[a_baseLayer_name]
    }
    setBaseLayer(a_baseLayer_name) {
      this.map.removeLayer(this.currentBaseLayer)
      
      if (!a_baseLayer_name)
        return

      this.currentBaseLayer = this.baseLayer(a_baseLayer_name)
      this.map.addLayer(this.currentBaseLayer)
      this.currentBaseLayer.setZIndex(0);
    }
    // Ends - These operations above are related to the baselayer
    // Begins - These operations are related to the WMS
    getWMSCapabilitiesAsJSON(resquestedXml) {
      let  parser = new WMSCapabilities()
      return parser.read(resquestedXml)
    }
    getWMSCapabilityLayers(requestedXml) {
      let capability_json = this.getWMSCapabilitiesAsJSON(requestedXml)
      let layers = capability_json.Capability.Layer.Layer

      return layers.map((a_layer) => new WMSCapabilityLayer(a_layer, capability_json.version, capability_json.Service.OnlineResource))
    }
    getWMSMap(wmsLayer) {
      let wmsSource = new ImageWMS({url: wmsLayer.entryPoint +'/wms', params: {'LAYERS': wmsLayer.name}})
      return new ImageLayer({extent: wmsLayer.bbox, source: wmsSource})
    }
    addWMSLayer(wmsLayer) {
      let image_layer = this.getWMSMap(wmsLayer)
      this.map.addLayer(image_layer)
      wmsLayer.layer = image_layer
      return wmsLayer
    }
    removeWMSLayer(wmsLayer) {
      this.map.removeLayer(wmsLayer.olLayer)
      wmsLayer.olLayer = null
    }
    // End - These operations above are related to the WMS
    //
    showGraticule(color='rgba(255,120,0,0.9)', width=2, lineDash=[0.5, 4], showLabels=true) {
      let strokeStyle = new Stroke({ color: color, width: width, lineDash: lineDash })
      let graticule = new Graticule({ strokeStyle: strokeStyle, showLabels: showLabels})
      graticule.setMap(this.map)
    }

    // Begin  -  HyperResource related operations
    createHyperResourceLayer(name, iri) {
      return new HyperResourceLayer(name, iri);
    }
    addVectorLayerFromGeoJSON(geoJson) {
      const gjson_format = new GeoJSON().readFeatures(geoJson, {featureProjection: this.map.getView().getProjection()})
      const vector_source = new Vector({features: gjson_format})
      const vector_layer = new VectorLayer({ renderMode: 'image', source: vector_source })
      this.map.addLayer(vector_layer)
      return vector_layer
    }
    async addHyperResourceLayer(a_HyperResourceLayer) {
      let resp_get
      try {
        let requestConfig = { responseType: 'arraybuffer', headers: {'Accept': 'application/octet-stream'} }
        resp_get = await axios.get(a_HyperResourceLayer.iri, requestConfig)
      }
      catch(err) {
        console.log('Houve algum erro na requisição. ', err)
      }
      finally {
        console.log("RESPOSTA BINARIA" + resp_get.data)
        var geoJson = Geobuf.decode(new Pbf(resp_get.data))
      }
      const gjson_format = new GeoJSON().readFeatures(geoJson, {featureProjection: this.map.getView().getProjection()})
      const vector_source = new Vector({features: gjson_format})
      const vector_layer = new VectorLayer({ source: vector_source })
      this.map.addLayer(vector_layer)

    }
    removeHyperResourceLayer(a_HyperResourceLayer) {}
    // End  - These operations are related to the HyperResource
}
