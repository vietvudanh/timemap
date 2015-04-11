/**
 * =================
 * variables
 * =================
 */
var year = null;
var places = null;

/**
 * =================
 * main entry
 * =================
 */
$(document).ready(function () {
  addListener();
  addMap();
  init();
  getData();
  mapClick();
});

//init
function init(){
  year = 2015;
  $('#year-box').text(year);
  $('#feat-lon').val(105.785);
  $('#feat-lat').val(21.035);
}

//add listener
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
  
  //control
  $('#center').click(function(){
    var current = getCurrentLonLatZoom();
    log(JSON.stringify(current));
  });
  $('#pan-to').click(function(){
    var lon = parseFloat($('#feat-lon').val());
    var lat = parseFloat($('#feat-lat').val());
    panTo([lon, lat]);
  });
  
  // add feature
  $('#add-feat').click(function(){
    var lon = parseFloat($('#feat-lon').val());
    var lat = parseFloat($('#feat-lat').val());
    addFeature(mapTransform1([lon, lat]), 'hi');
  });
  
  // place select
  $('#place-select').change(function(){
    var i = $(this).val();
    var lon = parseFloat(places[i].lon);
    var lat = parseFloat(places[i].lat);
    $('#feat-lon').val(lon);
    $('#feat-lat').val(lat);
    panTo([lon, lat]);
  });
}

//log
function log(msg){
  $('<div>', {text: getDateTime() + ' >> ' +  msg}).appendTo('#log');
}

// get data
function getData(){
  $.ajax({
    type:"get",
    dataType:'json',
    url: 'data/sample.json',
    success: function(data){
      places = data;
      
      $.each(places, function(index, place){
        $('<option/>',{
          value : place.id,
          text : place.name
        }).appendTo('#place-select');
      });
    },
    error: function(e){
    }
  });
}

// draw features
function drawFeatures(){
  clearFeatures();
  $.each(places, function(index, data){
    var date = new Date(data.time);
    if(date.getFullYear() == parseInt(year)){
      addFeature(mapTransform1([parseFloat(data.lon), parseFloat(data.lat)]), data.description);
      console.log(vectorSource.getFeatures());
    }
  });
}