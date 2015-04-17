/**
 * =================
 * variables
 * =================
 */

//map
var Map = {};
Map.map = null;
Map.layers = [];

//popup
element = null;
popup = null;

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
  Map.layers.push(new ol.layer.Tile({
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
Map.layers.push(vectorLayer);

// add Bing's map change listener
$('#layer-select').change(function () {
  var style = $(this).find(':selected').val();
  var i, ii;
  for (i = 0, ii = Map.layers.length; i < ii; ++i) {
    Map.layers[i].setVisible(i == 5 || styles[i] == style);
  }
});
$('#layer-select').trigger('change');

//get current lon, lat, zoom
Map.getCurrentLonLatZoom = function() {
  return {
    'center': mapTransform2(Map.map.getView().getCenter()),
    'zoom': Map.map.getView().getZoom()
  }
}

//transform 'EPSG:4326' to  'EPSG:3857'
Map.mapTransform1 = function(lonlat) {
  return ol.proj.transform(lonlat, 'EPSG:4326', 'EPSG:3857')
}

//transform 'EPSG:3857' to 'EPSG:4326'
Map.mapTransform2 = function (lonlat) {
  return ol.proj.transform(lonlat, 'EPSG:3857', 'EPSG:4326')
}

//add features
Map.addFeature = function(lonlat, description) {
  var iconFeature = new ol.Feature({
    geometry: new ol.geom.Point(lonlat),
    name: description
  });
  iconFeature.setStyle(iconStyle);
  vectorSource.addFeature(iconFeature);
  Map.map.render();
}

// clear features
Map.clearFeatures = function() {
  vectorSource.clear();
}

//add map
Map.addMap = function() {
  Map.map = new ol.Map({
    target: document.getElementById('map'),
    layers: Map.layers,
    loadTilesWhileInteracting: true,
    view: new ol.View({
      center: Map.mapTransform1([105.785, 21.035]),
      zoom: 16
    })
  });
  
  element = document.getElementById('popup');
  popup = new ol.Overlay({
    element: element,
    positioning: 'bottom-center',
    stopEvent: false
  });
  Map.map.addOverlay(popup);
  Map.mapClick();
  Map.mapHover();
}

// mapClick
Map.mapClick = function() {
  Map.map.on('click', function (evt) {
    var feature = Map.map.forEachFeatureAtPixel(evt.pixel,
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

//maphover
Map.mapHover = function(){
  // change mouse cursor when over marker
  Map.map.on('pointermove', function(e) {
    if (e.dragging) {
      $(element).popover('destroy');
      return;
    }
    var pixel = Map.map.getEventPixel(e.originalEvent);
    var hit = Map.map.hasFeatureAtPixel(pixel);
    Map.map.getTarget().style.cursor = hit ? 'pointer' : '';
  });
}

// panto map
Map.panTo = function(lonlat) {
  var pan = ol.animation.pan({
    duration: 2000,
    source: /** @type {ol.Coordinate} */ (Map.map.getView().getCenter())
  });
  Map.map.beforeRender(pan);
  Map.map.getView().setCenter(Map.mapTransform1(lonlat));
}