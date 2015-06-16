/** =================
 Database handler
  Model, handle connection to graph database
 Timemap project
 @author: Viet Vu Danh
 *===================/


/*
  DB handler for Timemap system
  */

//namespace
DB = {};

//URL of DB
DB.url = 'http://localhost:7474/db/data/cypher';

/*
  query data based on time
  */
DB.queryByTime = function (time, windowSize) {

    // options of the query
    var option = {
      'query': 'match (n:Event) return n',
      'params': {}
    };

    // query
    $.ajax({
      url: DB.url,
      type: 'POST',
      contentType: "application/json",
      dataType: 'json',
      data: JSON.stringify(option),
      success: function (data) {

        // places
        // group places by object
        var places = {};

        // iterrate through data
        $.each(data.data, function (index, d) {
          var tmp = d[0].data;
          if (tmp.icon in places) {
            places[tmp.icon].push(tmp);
          } else {
            places[tmp.icon] = [];
            places[tmp.icon].push(tmp);
          }
        });
        Main.places = places;
        Main.drawFeatures();
      },
      error: function (msg) {
        console.log('ERROR::' + msg);
      }
    });

  } // end query by time

/*
  query timeline
  @param: [Date] time - current time
          [int] nodeID - id of the node
          
  @return: nodes, in 3 groups {current:[], past:[], future:[]}
  */
DB.queryTimeline = function (time, nodeID) {
    // options of the query
    var option = {
      'query': 'match (n{id:' + nodeID + '}), (m{icon:n.icon}) return m', // return nodes of same object
      'params': {}
    };

    // query
    $.ajax({
      url: DB.url,
      type: 'POST',
      contentType: "application/json",
      dataType: 'json',
      data: JSON.stringify(option),
      success: function (data) {

        // return  results
        var results = {
          'past': [],
          'current': [],
          'future': []
        };

        // itterate through data
        $.each(data.data, function (index, d) {
          var tmp = d[0].data;
          var date = (new Date(tmp.time)).getFullYear();
          if (date < time) {
            results['past'].push(tmp);
          } else if (date == time) {
            results['current'].push(tmp);
          } else {
            results['future'].push(tmp);
          }
        });
        if (results['past'].length > 0) {
          results['current'].push(results['past'].pop());
        }
        // add results to modal
        var content = '';
        
        content += "PAST:";
        $.each(results.past, function(i, past){
          
          content += "<button class='btn btn-danger btn-small'>" + 
                      "PAST:" + past.time + "<br>" + 
                      past.name + 
                      "</button>";
        });
        content += "<br>";
        
        content += "CURRENT:";
        $.each(results.current, function(i, current){

          content += "<button class='btn btn-primary btn-small'>" + 
                       current.time + "<br>" + 
                      current.name + 
                      "</button>";
        });
        content += "<br>";
        
        content += "FUTURE:";
        $.each(results.future, function(i, future){
          
          content += "<button class='btn btn-success btn-small'>" + 
                       future.time + "<br>" + 
                      future.name + 
                      "</button>";
        });
        $('#modal-body').html(content);

      },
      error: function (msg) {
        console.log('ERROR::' + msg);
      }
    });
  } // end query timeline

/*
  query children
  @param [Date] time - current time
         [int] nodeID - id of the node
          
  @return: [Array] nodes
  */
DB.queryChildren = function (time, nodeID) {

    // options of the query
    var option = {
      'query': 'match (n:Event{id:' + nodeID + '}), (n)<-[r:CHILD]-() return n,r', // find children of node nodeID
      'params': {}
    };

    // query
    $.ajax({
      url: DB.url,
      type: 'POST',
      contentType: "application/json",
      dataType: 'json',
      data: JSON.stringify(option),
      success: function (data) {

        // result
        var results = [];

        // iterrate throuh data
        $.each(data.data, function (index, d) {
          results.push[d];
        });
        $('#modal-body').html(JSON.stringify(results));
      },
      error: function (msg) {
        console.log('ERROR::' + msg);
      }
    });
  } // end query children

/*
  Select current state
  @param: [Array] list of places
  @return: [Array] list of nodes ready to draw
 */
DB.getCurrentState = function (places, year, windowSize) {

  // return results
  var results = {};

  // iterrate through places, add to current
  $.each(places, function (icon, place) {

    var last = null; // last event in the list
    var isDrawn = false; // if one event in the chain is drawn

    $.each(place, function (index, event) {
      
      var eventDate = new Date(event.time);
      var eventYear = eventDate.getFullYear();
      
      // the last event small than current
      if (eventDate.getFullYear() < year){
        last = event;
      }

      // 1. check if the year of event is in window time
      if (year - windowSize <= eventYear && eventYear <= year + windowSize) {
        isDrawn = true;

        // add to list to be drawn later
        var key = String(event.lon) + String(event.lat);
        //        console.log(index + '-' + event.id);

        // check if location exists
        if (key in results) {
          // overlap, update it
          console.log('OVERLAP');
          var prevYear = (new Date(results[key].event.time)).getFullYear();
          results[key].event.name = "<table><tr>" + 
                                        "<td>" + results[key].event.name + '-' + prevYear + "</td>" + 
                                        "<td>" + '</br>==>></br>' + "</td>" +
                                        "<td>" + event.name + "-" + (new Date(event.time)).getFullYear() + "</td>" +
                                     "</tr></table>";
          console.log(results[key].event.name);
        } else {
          // new, add to the list
          results[key] = {
            event: {
              id: event.id,
              name: event.name,
              lon: event.lon,
              lat: event.lat,
              time: event.time,
              description: event.description,
              icon: event.icon
            },
            display: true
          };
          results[key].event.newName = results[key].event.name + '-' + (new Date(event.time)).getFullYear();
        } // end check location exists
      } // end 1. if event is in window time
    }); // end each events

    // check if has been drawn
    if (!isDrawn && last != null) {
      // not, add the last
      // add to list to be drawn later
      var event = last;
      var key = String(event.lon) + String(event.lat);
      //      console.log(icon + '-' + event.id);

      // check if location exists
      if (key in results) {
        console.log('OVERLAP');
        var prevYear = (new Date(results[key].event.time)).getFullYear();
        results[key].event.newName = "<table><tr>" + 
                                        "<td>" + results[key].event.newName + '-' + prevYear + "</td>" + 
                                        "<td>" + '</br>==>></br>' + "</td>" +
                                        "<td>" + event.name + "-" + (new Date(event.time)).getFullYear() + "</td>" +
                                     "</tr></table>";
        console.log(results[key].event.name);
      } else {
        results[key] = {
          event: {
            id: event.id,
            name: event.name,
            lon: event.lon,
            lat: event.lat,
            time: event.time,
            description: event.description,
            icon: event.icon
          },
          display: false
        };
        results[key].event.newName = results[key].event.name + '-' + (new Date(event.time)).getFullYear();
      } // end check location exists
    }
  });
  
  return results;
}