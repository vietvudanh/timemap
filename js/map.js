/**
 * =================
 * variables
 * =================
 */

//map
var map = null
var layers = [];

//style for Bing map
var styles = [
  'Road',
  'Aerial',
  'AerialWithLabels',
  'collinsBart',
  'ordnanceSurvey'
];

/**
 * =================
 * initialize layers
 * =================
 */

// ---------------------
// add Bing's map layers
// ---------------------
for (var i = 0; i < styles.length; ++i) {
  layers.push(new ol.layer.Tile({
    visible: false,
    preload: Infinity,
    source: new ol.source.BingMaps({
      key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
      imagerySet: styles[i]
        // use maxZoom 19 to see stretched tiles instead of the BingMaps
        // "no photos at this zoom level" tiles
        // maxZoom: 19
    })
  }));
}

// ---------------------
// features
// ---------------------

// icon style
var iconStyle = new ol.style.Style({
  image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
    anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    opacity: 0.75,
    src: 'img/icon.png'
  }))
});

// add vector source
var vectorSource = new ol.source.Vector({
  features: []
});

// vecor layer
var vectorLayer = new ol.layer.Vector({
  source: vectorSource
});
layers.push(vectorLayer);

// add Bing's map change listener
$('#layer-select').change(function () {
  var style = $(this).find(':selected').val();
  var i, ii;
  for (i = 0, ii = layers.length; i < ii; ++i) {
    layers[i].setVisible(i == 5 || styles[i] == style);
  }
});
$('#layer-select').trigger('change');

//get current lon, lat, zoom
function getCurrentLonLatZoom() {
  return {
    'center': mapTransform2(map.getView().getCenter()),
    'zoom': map.getView().getZoom()
  }
}

//transform 'EPSG:4326' to  'EPSG:3857'
function mapTransform1(lonlat) {
  return ol.proj.transform(lonlat, 'EPSG:4326', 'EPSG:3857')
}

//transform 'EPSG:3857' to 'EPSG:4326'
function mapTransform2(lonlat) {
  return ol.proj.transform(lonlat, 'EPSG:3857', 'EPSG:4326')
}

//add features
function addFeature(lonlat, description) {
  var iconFeature = new ol.Feature({
    geometry: new ol.geom.Point(lonlat),
    name: description
  });
  iconFeature.setStyle(iconStyle);
  vectorSource.addFeature(iconFeature);
  map.render();
}

// clear features
function clearFeatures() {
  vectorSource.clear();
}

//add map
function addMap() {
  map = new ol.Map({
    target: 'map',
    layers: layers,
    loadTilesWhileInteracting: true,
    view: new ol.View({
      center: mapTransform1([105.785, 21.035]),
      zoom: 16
    })
  });
}

// mapClick
function mapClick() {
  map.on('click', function (evt) {
    var feature = map.forEachFeatureAtPixel(evt.pixel,
      function (feature, layer) {
        return feature;
      });
    if (feature) {
      var geometry = feature.getGeometry();
      var coord = geometry.getCoordinates();
      popup.setPosition(coord);
      $(element).popover({
        'placement': 'top',
        'html': true,
        'content': feature.get('name')
      });
      $(element).popover('show');
    } else {
      $(element).popover('destroy');
    }
  });
}

// panto map
function panTo(lonlat) {
  var pan = ol.animation.pan({
    duration: 2000,
    source: /** @type {ol.Coordinate} */ (map.getView().getCenter())
  });
  map.beforeRender(pan);
  map.getView().setCenter(mapTransform1(lonlat));
}