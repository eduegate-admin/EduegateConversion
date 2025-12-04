app.controller("DriverLocationController", [
  "$scope",
  "$http",
  "rootUrl",
  "GetContext",
  "$state",
  "$stateParams",
  "$rootScope",
  "$timeout",
  "$translate",
  "$q",
  function (
    $scope,
    $http,
    rootUrl,
    GetContext,
    $state,
    $stateParams,
    $rootScope,
    $timeout,
    $translate,
    $q
  ) {
    // --- Configuration ---
    const POLLING_INTERVAL_MS = 10000;
    var context = GetContext.Context();
    var dataService = rootUrl.SchoolServiceUrl;
    var appDataUrl = rootUrl.RootUrl;
    var pollingPromise = null;
    var map;
    var marker;

    // --- High-Performance SVG Bus Icon ---
    const vehicleIcon = {
      path: 'M 5,0 C 2,0, 0,2, 0,5 L 0,35 C 0,38, 2,40, 5,40 L 15,40 C 18,40, 20,38, 20,35 L 20,5 C 20,2, 18,0, 15,0 Z M 0,5 L -3,2 L -3,0 L 0,3 Z M 20,5 L 23,2 L 23,0 L 20,3 Z',
      fillColor: "#6F3C9F",
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 1,
      rotation: 0,
      scale: 1.2,
      anchor: new google.maps.Point(10, 20),
    };

    // --- Data Fetching Functions ---
    function getSettingValues() {
      var latPromise = $http.get(`${appDataUrl}/GetSettingValueByKey?settingKey=DEFAULT_SCHOOL_LATITUDE`, { headers: { CallContext: JSON.stringify(context) } });
      var lngPromise = $http.get(`${appDataUrl}/GetSettingValueByKey?settingKey=DEFAULT_SCHOOL_LONGITUDE`, { headers: { CallContext: JSON.stringify(context) } });
      return $q.all([latPromise, lngPromise]).then(function (results) {
        $scope.Default_School_Latitude = results[0].data || 25.2048;
        $scope.Default_School_Longitde = results[1].data || 55.2708;
      });
    }

    function getStopsPositionsByRoute() {
      return $http.get(`${dataService}/GetStopsPositionsByRouteStaff`, { headers: { CallContext: JSON.stringify(context) } }).then(function (response) {
        $scope.StopsPositionsByRoute = response.data || [];
      });
    }

    function getStaffInOutVehicleStatus() {
      return $http.get(`${dataService}/GetStaffInOutVehicleStatus`, { headers: { CallContext: JSON.stringify(context) } }).then(function (response) {
        // IMPORTANT: You have hardcoded this for testing. For production, this should be:
        // return !!response.data;
        return true;
      });
    }

    // --- Map Initialization and Drawing ---
    function initDriverMapLocationPicker() {
      return $http.get(`${dataService}/GetDriverGeoLocationByStaff`, { headers: { CallContext: JSON.stringify(context) } }).then(function (response) {
        const locationString = response.data;
        if (!locationString || typeof locationString !== "string" || locationString.split(",").length < 2) {
          showToast("NOTAVAILABLEFORTRACKING");
          drawEmptyMap();
          return $q.reject("Driver location not available or malformed.");
        }
        const locationParts = locationString.split(",");
        const pos = { lat: parseFloat(locationParts[0]), lng: parseFloat(locationParts[1]) };
        initializeMap(pos);
        drawStopsAndRoute();
        startPollingLoop(pos);
      });
    }

    function initializeMap(centerPos) {
      const mapOptions = {
        zoom: 16,
        gestureHandling: "greedy",
        center: centerPos,
        heading: 320,
        tilt: 47.5,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      };
      const noPoi = [{ featureType: "poi", stylers: [{ visibility: "off" }] }];
      map = new google.maps.Map(document.getElementById("drivermap"), mapOptions);
      map.setOptions({ styles: noPoi });
    }

    function drawEmptyMap() {
      const centerPos = { lat: parseFloat($scope.Default_School_Latitude), lng: parseFloat($scope.Default_School_Longitde) };
      initializeMap(centerPos);
    }

    // --- NEW: Standard Practice - Optimized Route Drawing ---
    // This function makes ONE API call for the whole route, not one per stop.
    function drawStopsAndRoute() {
      if (!$scope.StopsPositionsByRoute || $scope.StopsPositionsByRoute.length < 2) return;

      const directionsService = new google.maps.DirectionsService();
      
      const origin = $scope.StopsPositionsByRoute[0];
      const destination = $scope.StopsPositionsByRoute[$scope.StopsPositionsByRoute.length - 1];
      const waypoints = $scope.StopsPositionsByRoute.slice(1, -1).map(stop => ({
        location: new google.maps.LatLng(parseFloat(stop.latitude || stop.Latitude), parseFloat(stop.longitude || stop.Longitude)),
        stopover: true,
      }));

      const request = {
        origin: new google.maps.LatLng(parseFloat(origin.latitude || origin.Latitude), parseFloat(origin.longitude || origin.Longitude)),
        destination: new google.maps.LatLng(parseFloat(destination.latitude || destination.Latitude), parseFloat(destination.longitude || destination.Longitude)),
        waypoints: waypoints,
        optimizeWaypoints: true, // Let Google find the best order for the waypoints
        travelMode: google.maps.TravelMode.DRIVING,
      };

      directionsService.route(request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true, // We will draw our own custom markers
            polylineOptions: { strokeColor: "#4986E7" },
          }).setDirections(result);
        }
      });

      // Draw custom markers for each stop
      $scope.StopsPositionsByRoute.forEach(function (stop) {
        new google.maps.Marker({
          position: new google.maps.LatLng(parseFloat(stop.latitude || stop.Latitude), parseFloat(stop.longitude || stop.Longitude)),
          map: map,
          icon: { url: "./images/bus-stop.svg", scaledSize: new google.maps.Size(40, 40) },
          label: { color: "#6F3C9F", fontWeight: "600", text: (stop.stopName || stop.StopName) },
        });
      });
    }

    // --- Polling and Marker Animation ---
    function startPollingLoop(currentPos) {
      updateOrMoveMarker(currentPos);
      
      pollingPromise = $timeout(function () {
        // NEW: Only poll if the document is visible
        if (document.hidden) {
            startPollingLoop(currentPos); // Reschedule without making an API call
            return;
        }

        $http.get(`${dataService}/GetDriverGeoLocationByStaff`, { headers: { CallContext: JSON.stringify(context) } })
          .then(function (response) {
            const locationString = response.data;
            if (locationString && typeof locationString === "string" && locationString.split(",").length >= 2) {
              const locationParts = locationString.split(",");
              const newPos = { lat: parseFloat(locationParts[0]), lng: parseFloat(locationParts[1]) };
              startPollingLoop(newPos); // Recursive call
            } else {
              throw new Error("Tracking data unavailable or malformed.");
            }
          })
          .catch(function (error) {
            console.error("Stopping polling due to an error:", error.message);
            showToast("TRACKINGSTOPPED");
            if (pollingPromise) $timeout.cancel(pollingPromise);
          });
      }, POLLING_INTERVAL_MS);
    }

    function updateOrMoveMarker(newPos) {
      const newLatLng = new google.maps.LatLng(newPos.lat, newPos.lng);
      if (!marker) {
        marker = new google.maps.Marker({ position: newLatLng, map: map, icon: vehicleIcon });
        map.setCenter(newLatLng);
      } else {
        const oldPos = marker.getPosition();
        if (!oldPos.equals(newLatLng)) {
          map.panTo(newLatLng);
          animateMarker(oldPos, newLatLng, POLLING_INTERVAL_MS);
        }
      }
    }

    function animateMarker(startLatLng, endLatLng, duration) {
      const start = performance.now();
      const heading = google.maps.geometry.spherical.computeHeading(startLatLng, endLatLng);
      const animationFrame = function (time) {
        const elapsed = time - start;
        const progress = Math.min(elapsed / duration, 1);
        const currentPos = google.maps.geometry.spherical.interpolate(startLatLng, endLatLng, progress);
        marker.setPosition(currentPos);
        const icon = marker.getIcon();
        icon.rotation = heading;
        marker.setIcon(icon);
        if (progress < 1) {
          requestAnimationFrame(animationFrame);
        }
      };
      requestAnimationFrame(animationFrame);
    }

    // --- Helper and Cleanup Functions ---
    function showToast(messageKey) {
      $translate([messageKey]).then(function (translation) {
        $rootScope.ShowToastMessage(translation[messageKey] || messageKey, 'error');
      });
    }

    // --- Controller Initialization Chain ---
    // NEW: Added a loading indicator for better UX.
    $rootScope.ShowLoader = true;
    getSettingValues()
      .then(getStopsPositionsByRoute)
      .then(getStaffInOutVehicleStatus)
      .then(function (isStaffOnBus) {
        if (!isStaffOnBus) {
          showToast("STAFFBOARDINGNOTCONFIRMEDYET");
          drawEmptyMap();
          return;
        }
        return initDriverMapLocationPicker();
      })
      .catch(function (error) {
        console.error("Initialization failed:", error);
        showToast("ERROR_FETCHING_LOCATION");
      })
      .finally(function () {
        // NEW: Always hide the loader when the chain is complete (success or fail).
        $rootScope.ShowLoader = false;
      });

    // Clean up the polling timer when the user navigates away
    $scope.$on("$destroy", function () {
      if (pollingPromise) {
        $timeout.cancel(pollingPromise);
        console.log("Polling for driver location has been stopped.");
      }
    });
  },
]);