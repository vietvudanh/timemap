/** =================
 Main logic file
  Controller of system
 Timemap project
 @author: Viet Vu Danh
 *===================/

/**
 * =================
 * variables
 * =================
 */
// main namespace
var Main = {}; // namespace
Main.year = null; // current year
//Main.places = null; // places list
Main.windowSize = null; // time window
Main.eventsToBeDrawn = {}; // eventsToBeDrawn

/**
 * =================
 * main entry
 * =================
 */
$(document).ready(function () {
  Main.init();
  Main.addListener();
  Map.addMap();
  //  Main.getData();
  DB.queryByTime((new Date('1980-01-01')), 4);
});

//init
Main.init = function () {
  Main.year = parseInt($('#year-slider').val());
  Main.windowSize = parseInt($('#window-slider').val());

  $('#year-box').text(Main.year);
  $('#feat-lon').val(105.785);
  $('#feat-lat').val(21.035);
}

//add listeners
Main.addListener = function () {

  //slider
  $('#year-slider').on('input', function () {
    Main.year = parseInt($(this).val());
    $('#year-box').text(Main.year);
    Main.drawFeatures();
  });
  $('#year-input').change(function () {
    Main.year = parseInt($(this).val());
    $('#year-box').text(Main.year);
    Main.drawFeatures();
  });
  $('#window-slider').on('input', function () {
    Main.windowSize = parseInt($(this).val());
    console.log();
    $('#window-size').text(Main.windowSize);
    Main.drawFeatures();
  });
  
  //search
  $('#search-box').on('keyup', function(){
    var text = $.trim($(this).val().toLowerCase());
    $.each(Main.eventsToBeDrawn, function(i, element){
      var event = element.event;
      if( event.name.toLowerCase().indexOf(text) != -1 || 
          event.description.toLowerCase().indexOf(text) != -1 || 
          event.time.toLowerCase().indexOf(text) != -1)
      {
        element.display = true;
      }
      else if(text == ''){
        element.display = true;
      }
      else{
        element.display = false;
      }
    });
    Main.drawFeatures2();
    
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
Main.log = function (msg) {
  $('<div>', {
    text: getDateTime() + ' >> ' + msg
  }).appendTo('#log');
}

// get data
//Main.getData = function () {
//  $.ajax({
//    type: "get",
//    dataType: 'json',
//    url: 'data/sample2.json',
//    success: function (data) {
//      Main.places = data;
//      Main.drawFeatures();
//      //      $.each(places, function (index, place) {
//      //        $('<option/>', {
//      //          value: place.id,
//      //          text: place.name
//      //        }).appendTo('#place-select');
//      //      });
//    },
//    error: function (e) {
//      alert("Error in loading data");
//    }
//  });
//}

// draw features
// clear and redraw features on the map
Main.drawFeatures = function () {
  console.log(Main.places);

  Map.clearFeatures(); // clear the markers
  delete Main.eventsToBeDrawn; // clear the current locations track
  Main.eventsToBeDrawn = {}; // create new objects
  
  Main.eventsToBeDrawn = DB.getCurrentState(Main.places, Main.year, Main.windowSize);
  
  console.log(Main.eventsToBeDrawn);
  // add feature
  for (key in Main.eventsToBeDrawn) {
    var location = Main.eventsToBeDrawn[key];
    Map.addFeature(
      Map.mapTransform1([parseFloat(location.event.lon), parseFloat(location.event.lat)]),
      location.event,
      location.event.icon);
  }
}

// draw features
// clear and redraw features on the map
Main.drawFeatures2 = function () {
  console.log(Main.places);

  Map.clearFeatures(); // clear the markers
  
  console.log(Main.eventsToBeDrawn);
  // add feature
  for (key in Main.eventsToBeDrawn) {
    var location = Main.eventsToBeDrawn[key];
    if(location.display){
      Map.addFeature(
        Map.mapTransform1([parseFloat(location.event.lon), parseFloat(location.event.lat)]),
        location.event,
        location.event.icon);
    }
  }
}