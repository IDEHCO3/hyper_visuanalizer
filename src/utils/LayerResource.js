import {transformExtent} from 'ol/proj'

export class OptionsLayer {
  /*constructor(supportedProperties, supportedOperations, context,  iriTemplate, iri) {
    this.supported_properties = supportedProperties;
    this.supported_operations = supportedOperations.sort((a,b) => a['hydra:operation'] < b['hydra:operation'] ? -1 : 1);
    this.context = context;
    this.iri_template = iriTemplate;
    this.iri = iri
  }*/
  constructor(json, iri) {
    this.jsonOptions = json
    this.iri = iri
  }
  get id() {
    return this.jsonOptions['@id']
  }
  get type() {
    return this.jsonOptions['@type']
  }
  get context() {
    return this.jsonOptions['@context']
  }
  get supportedProperties() {
    let properties = this.jsonOptions['hydra:supportedProperties']

    if (properties == undefined)
      return []

    properties = properties.slice(0)  // This line clones supportedOperations original array

    properties.map(elem => {
      let propName = elem['hydra:property']
      if (propName == 'geom') // geom é uma supportedProperty mas não tem @context
        return

      if (!(propName in this.context)) {
        return
      }

      let context = this.context[propName]

      elem['contextId'] = context['@id']
      elem['contextType'] = context['@type']

      return elem
    })

    return properties
  }
  get supportedOperations() {
    let operations = this.jsonOptions['hydra:supportedOperations']

    if (operations == undefined)
      return []

    operations = operations.slice(0)  // This line clones supportedOperations original array
    operations = operations.sort(
      (a, b) => {
        if (a['hydra:operation'] < b['hydra:operation'])
          return -1
        else if (a['hydra:operation'] > b['hydra:operation'])
          return 1

        return 0
      }
    )

    return operations
  }
}

class AbstractLayerResource {
  constructor(layer, iri, name) {
    this.layer = layer
    this.iri = iri
    this.name = name ? name : this.nameFromIRI(iri)
    this.activated = true
  }
  nameFromIRI(iri) {
    let arr = iri.split('/');
    let last = arr.length - 1;

    if (arr[last] == "")
      return arr[last - 1].toUpperCase();

    return arr[last].toUpperCase();
  }
}

export class GeoHyperLayerResource extends AbstractLayerResource {
}

//This class adresses the Layer in the GetCapabilities from WMS
export class WMSCapabilityLayer extends AbstractLayerResource {

  constructor(layerFromGetCapability,wms_version, wms_online_resource) {
    if (layerFromGetCapability != null) {
      super(null,layerFromGetCapability.url, layerFromGetCapability.Name)
      this.name = layerFromGetCapability.Name
      this.title = layerFromGetCapability.Title
      this.metadata = layerFromGetCapability.MetadataURL
      this.version = wms_version
      this.entryPoint = wms_online_resource
      this.was_requested = false
      this.crsName= layerFromGetCapability.CRS[0] // NÃO ESTÁ FUNCIONANDO PARA EPSG:4674 => FORÇADO PARA 'EPSG:4326'
      let extent = layerFromGetCapability.EX_GeographicBoundingBox
      let bbox = transformExtent(extent, 'EPSG:4326', 'EPSG:3857')
      this.bbox = bbox
      this.layer = null
    }

    else {
      this.json = null;
      this.url = null;
      this.options_response = null;
      this.vector_layer = null;
      this.options_layer = [];
    }
  }

   short_name() {
    let arr_url = this.url.split('/');
    let size_arr = arr_url.length;
    if (arr_url[size_arr-1] == "")
      return arr_url[size_arr-2].toUpperCase();
    return arr_url[size_arr-1].toUpperCase();
  }

}
