/**
 * =================
 * variables
 * =================
 */
var year = null; // current year
var places = null; // places list
var windowSize = null; // time window

/**
 * =================
 * main entry
 * =================
 */
$(document).ready(function () {
  addListener();
  Map.addMap();
  init();
  getData();
});

//init
function init() {
  year = 2002;
  $('#year-box').text(year);
  $('#feat-lon').val(105.785);
  $('#feat-lat').val(21.035);
}

//add listeners
function addListener() {

  //slider
  $('#year-slider').on('input', function () {
    year = $(this).val();
    $('#year-box').text(year);
    drawFeatures();
  });
  $('#year-input').change(function () {
    year = $(this).val();
    $('#year-box').text(year);
    drawFeatures();
  });
  $('#window-slider').on('input', function () {
    windowSize = $(this).val();
    console.log();
    $('#window-size').text(windowSize);
    drawFeatures();
  });

  //control
  $('#center').click(function () {
    var current = getCurrentLonLatZoom();
    log(JSON.stringify(current));
  });
  $('#pan-to').click(function () {
    var lon = parseFloat($('#feat-lon').val());
    var lat = parseFloat($('#feat-lat').val());
    Map.panTo([lon, lat]);
  });

  // add feature
  $('#add-feat').click(function () {
    var lon = parseFloat($('#feat-lon').val());
    var lat = parseFloat($('#feat-lat').val());
    Map.addFeature(mapTransform1([lon, lat]), 'hi');
  });
}

//log
function log(msg) {
  $('<div>', {
    text: getDateTime() + ' >> ' + msg
  }).appendTo('#log');
}

// get data
function getData() {
  $.ajax({
    type: "get",
    dataType: 'json',
    url: 'data/sample2.json',
    success: function (data) {
      places = data;
//      $.each(places, function (index, place) {
//        $('<option/>', {
//          value: place.id,
//          text: place.name
//        }).appendTo('#place-select');
//      });
    },
    error: function (e) {
      alert("Error in loading data");
    }
  });
}

// draw features
// clear and redraw features on the map
function drawFeatures() {
  Map.clearFeatures();

  // iterrate through places
  $.each(places, function (i, place){
    // iterrate through events
    $.each(place.events, function (j, event) {
      // get date of data
      var date = new Date(event.time);
      // filter for events sastify time window
      if (date.getFullYear() >= (parseInt(year) - windowSize) && date.getFullYear() <= parseInt(year) + windowSize) {
        // add featture to map
        Map.addFeature(Map.mapTransform1([parseFloat(event.lon), parseFloat(event.lat)]), i + '.' + event.name);
      }
    });
  });
}