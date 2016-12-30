
function Stop(stop) {
  this.stop = stop;
  this.date = new Date(stop.departureTime);
}

function DirectionalRouteStop(route, direction, stops) {
  this.route = route;
  this.direction = direction;
  this.stops = [];

  var now = new Date();
  for (var k = 0; k < stops.length; ++k) {
    var newStop = new Stop(stops[k]);
    if (newStop.date > now) {
      this.stops.push(newStop);
    }
  }
}

function BusStop(data) {
  var routeLookup = {};
  var routeReferences = data.references.routes;

  for (var i = 0; i < routeReferences.length; i++) {
    routeLookup[routeReferences[i].id] = routeReferences[i];
  }

  this.info = data.references.stops[0];

  var stopRouteSchedules = data.entry.stopRouteSchedules;
  this.directionalRouteStops = [];

  for (var i = 0; i < stopRouteSchedules.length; ++i) {
    var routeSchedules = stopRouteSchedules[i];
    var routeDirectionSchedules = routeSchedules.stopRouteDirectionSchedules;

    for (var j = 0; j < routeDirectionSchedules.length; ++j) {
      newDirectionalRouteStops = new DirectionalRouteStop(
        routeLookup[routeSchedules.routeId],
        routeDirectionSchedules[j].tripHeadsign,
        routeDirectionSchedules[j].scheduleStopTimes
      );
      this.directionalRouteStops.push(newDirectionalRouteStops);
    }
  }
}

function OneBusAway(apiKey="test", domain="api.pugetsound.onebusaway.org", debug = false) {
  this.apiKey = apiKey;
  this.domain = domain;

  this.getNextDepartures = function(stop_id, callback) {
    $.ajax({
      dataType: 'jsonp',
      crossDomain: true,
      url: "http://" + this.domain + "/api/where/schedule-for-stop/" + stop_id + ".json?key=" + this.apiKey
    })
      .done(function(response) {
        callback(new BusStop(response.data));
      })
      .fail(function(error) {
        console.log(error.responseText);
        callback(null);
      });
  }
}
