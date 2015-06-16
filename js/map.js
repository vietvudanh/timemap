/** =================
 Map view, logic file
  Control logic and view of the map
 Timemap project
 @author: Viet Vu Danh
 *===================/

/**
 * =================
 * variables
 * =================
 */

//map
var Map = {};   //name space
Map.map = null; // the map
Map.layers = [];  // layers on the map

//popup
var element = null;
var popup = null;

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

// add vector source
var vectorSource = new ol.source.Vector({
  features: []
});

// vector layer
var vectorLayer = new ol.layer.Vector({
  source: vectorSource
});
Map.layers.push(vectorLayer);

//add features
/*
lonlat: Ol.lonlat
event: event object*/
Map.addFeature = function (lonlat, event, icon) {
  var iconFeature = new ol.Feature({
    geometry: new ol.geom.Point(lonlat),
    name: event.name,
    event: event
  });
  iconFeature.setStyle(Map.iconStyles[icon]);
  vectorSource.addFeature(iconFeature);
  Map.map.render();
}

// clear features
Map.clearFeatures = function () {
  vectorSource.clear();
}

// translate type to iconStyle
Map.iconStyles = {
  'uet': new ol.style.Style({
    image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
      //      size: [32, 32],
      scale: 0.5,
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      opacity: 0.75,
      src: 'img/uet.png'
    }))
  }),
  'ueb': new ol.style.Style({
    image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
      //      size: [32, 32],
      scale: 0.3,
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      opacity: 0.75,
      src: 'img/ueb.jpg'
    }))
  }),
  'vnu': new ol.style.Style({
    image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
      //      size: [32, 32],
      scale: 0.3,
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      opacity: 0.75,
      src: 'img/vnu.jpg'
    }))
  }),
  'ueb': new ol.style.Style({
    image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
      //      size: [32, 32],
      scale: 0.3,
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      opacity: 0.75,
      src: 'img/ueb.jpg'
    }))
  }),
  'ussh': new ol.style.Style({
    image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
      //      size: [32, 32],
      scale: 0.4,
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      opacity: 0.75,
      src: 'img/ussh.png'
    }))
  }),
  'hus': new ol.style.Style({
    image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
      //      size: [32, 32],
      scale: 0.3,
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      opacity: 0.75,
      src: 'img/hus.jpg'
    }))
  }),
  'ulis': new ol.style.Style({
    image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
      //      size: [32, 32],
      scale: 0.2,
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      opacity: 0.75,
      src: 'img/ulis.png'
    }))
  }),
  'ued': new ol.style.Style({
    image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
      //      size: [32, 32],
      scale: 0.3,
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      opacity: 0.75,
      src: 'img/ued.png'
    }))
  }),
  'circle': new ol.style.Style({
    image: new ol.style.Circle({
      radius: 10,
      fill: new ol.style.Fill({
        color: 'rgba(20,150,200,0.3)'
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(20,130,150,0.8)',
        width: 1
      })
    })
  })
};

/**
 * ==========
 * Utilities
 * ==========
 */
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
Map.getCurrentLonLatZoom = function () {
  return {
    'center': mapTransform2(Map.map.getView().getCenter()),
    'zoom': Map.map.getView().getZoom()
  }
}

//transform 'EPSG:4326' to  'EPSG:3857'
Map.mapTransform1 = function (lonlat) {
  return ol.proj.transform(lonlat, 'EPSG:4326', 'EPSG:3857')
}

//transform 'EPSG:3857' to 'EPSG:4326'
Map.mapTransform2 = function (lonlat) {
  return ol.proj.transform(lonlat, 'EPSG:3857', 'EPSG:4326')
}

//add map
Map.addMap = function () {
  Map.map = new ol.Map({
    target: document.getElementById('map'),
    layers: Map.layers,
    loadTilesWhileInteracting: true,
    view: new ol.View({
      center: Map.mapTransform1([105.81037113753096, 21.012182750687288]),
      zoom: 12
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
Map.mapClick = function () {
  Map.map.on('click', function (evt) {
    console.log(Map.mapTransform2(Map.map.getCoordinateFromPixel(evt.pixel)));
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
        'content': 
          "<div class='popup-map'>" + 
            "<p>" + feature.get('event').name + ': '+feature.get('event').time + "</p>"+
            "<button class='btn btn-primary btn-small' onclick=\"$('#modal-title').text('Details of "+ feature.get('event').name +"');$('#modal-body').html('<b>ID: </b>"+ feature.get('event').id + "<br><b>Name: </b>" + feature.get('event').name +"<br><b>Time: </b>" + feature.get('event').time + "<br><b>Description: </b>" + feature.get('event').description + "<br><b>Longitude: </b>" + feature.get('event').lon + "<br><b>lattittude: </b>" + feature.get('event').lat + "');$('#myModal').modal('show',true);\">Details</button>" +
            "<button class='btn btn-success btn-small' onclick=\"$('#modal-title').text('Timeline of "+ feature.get('event').name +"');DB.queryTimeline(Main.year, " + feature.get('event').id + ");$('#myModal').modal('show',true);\">Timeline</button>" +
            "<button class='btn btn-danger btn-small' onclick=\"$('#modal-title').text('Children of "+ feature.get('event').name +"');DB.queryChildren(Main.year, " + feature.get('event').id + ");$('#myModal').modal('show',true);\">Children</button>" +
          "</div>"
      });
      $(element).popover('show');
    } else {
      $(element).popover('destroy');
    }
  });
}

//maphover
Map.mapHover = function () {
  // change mouse cursor when over marker
  Map.map.on('pointermove', function (e) {
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
Map.panTo = function (lonlat) {
  var pan = ol.animation.pan({
    duration: 2000,
    source: /** @type {ol.Coordinate} */ (Map.map.getView().getCenter())
  });
  Map.map.beforeRender(pan);
  Map.map.getView().setCenter(Map.mapTransform1(lonlat));
}