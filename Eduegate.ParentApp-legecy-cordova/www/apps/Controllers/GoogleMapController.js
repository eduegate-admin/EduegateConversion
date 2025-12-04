app.controller('GoogleMapController', ['$scope', '$http', 'rootUrl', '$location', 'GetContext', 'serviceCartCount', '$state', '$stateParams', '$rootScope', 'serviceAddToCart', 'loggedIn', '$sce', '$timeout', '$translate', function ($scope, $http, rootUrl, $location, GetContext, serviceCartCount, $state, $stateParams, $rootScope, serviceAddToCart, loggedIn, $sce, $timeout, $translate) {
  var context = GetContext.Context();
  $scope.nearestplaces = [];

  $scope.hideMap = function () {
    $(".googleMapContainer").hide();
  }

  function getPlaces(position) {
    if (position) {
      $scope.register.AddressLongitude = position.lng.toString();
      $scope.register.AddressLatitude = position.lat.toString();
    }

var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' 
    + position.lat + ',' + position.lng 
    + '&key=' + rootUrl.GoogleAPIKey;

$http({
    method: 'GET',
    url: url,
    headers: {
        'custom-xid-header': null
    }
}).then(function (response) {
    var r = response.data;

    if (r && r.results[0]) {
        $scope.nearestplaces = [];
        $scope.register.CustomerAddress = r.results[0].formatted_address;
        $scope.register.AddressLongitude = position.lng.toString();
        $scope.register.AddressLatitude = position.lat.toString();
        $scope.Address.Longitude = position.lng.toString();
        $scope.Address.Latitude = position.lat.toString();

        if ($scope.Address) {
            $scope.Address.AddressLine1 = r.results[0].formatted_address;
        }

        for (var i = 0; i < r.results.length; i++) {
            if (r.results[i]) {
                $scope.nearestplaces.push(r.results[i].formatted_address || "");
            }
        }
    } else {
        $rootScope.ErrorMessage = "Couldn't find any address from the picked location.";
    }

    $rootScope.ShowLoader = false;

}, function (error) {
    // error
    $rootScope.ShowLoader = false;
});

  }

  $scope.setplace = function (place) {
    $scope.register.CustomerAddress = place;
    $scope.Address.AddressLine1 = place;
    $(".googleMapContainer").hide();
  }

  var map, infoWindow;
  $scope.initMapLocationPicker = function () {
    // Try HTML5 geolocation.

    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(success, error, { timeout: 1000 });
      function success(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        var mapOptions = {
          zoom: 17,
          center: new google.maps.LatLng(pos.lat, pos.lng),
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById('map'),
          mapOptions);
        var GeoMarker = new GeolocationMarker(map);
        GeoMarker.setCircleOptions({ fillOpacity: 0, strokeWeight: 0 });
        // Configure the click listener.
        map.addListener('click', function (mapsMouseEvent) {
          $scope.mapClick(mapsMouseEvent, map);

        });


      }
      function error() {
        var mapOptions = {
          zoom: 12,
          center: new google.maps.LatLng("23.652246", "53.705974"),
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById('map'),
          mapOptions);
        map.addListener('click', function (mapsMouseEvent) {
          $scope.mapClick(mapsMouseEvent, map);

        });
      }
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }

  }

  $scope.mapClick = function (mapsMouseEvent, map) {
    var position = {
      lat: mapsMouseEvent.latLng.lat(),
      lng: mapsMouseEvent.latLng.lng()
    };

    getPlaces(position);
    mapmarking(position, map);

  }

  function mapmarking(position, map) {
    if ($scope.marker) {
      $scope.marker.setMap(null);
    }
    var uluru = { lat: parseFloat(position.lat), lng: parseFloat(position.lng) };
    $scope.marker = new google.maps.Marker({
      position: uluru, map: map,
      animation: google.maps.Animation.DROP
    });
    google.maps.event.addListener($scope.marker, 'click', function () { $scope.hideMap(); });


  }


  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
  }

  $scope.LocateTaggedAddress = function (latitude, longitude) {
    var mapOptions = {
      zoom: 17,
      center: new google.maps.LatLng(latitude, longitude),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById('map'),
      mapOptions);
    var uluru = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
    $scope.marker = new google.maps.Marker({
      position: uluru, map: map,
      animation: google.maps.Animation.DROP
    });
    if ($scope.IsMapClickable) {
      map.addListener('click', function (mapsMouseEvent) {
        $scope.mapClick(mapsMouseEvent, map);

      });
    }
  }
}]);