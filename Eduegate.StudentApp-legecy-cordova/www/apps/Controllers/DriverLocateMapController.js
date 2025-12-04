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
    $scope.StudentID = $stateParams.studentID;
    $scope.StopsPositionsByRoute = [];
    var pollingPromise = null;
    var map; // Reference to the map object
    var marker; // Reference to the driver's marker object

    // --- High-Performance SVG Bus Icon (Matches Parent App) ---
    const vehicleIcon = {
      path: 'M 5,0 C 2,0, 0,2, 0,5 L 0,35 C 0,38, 2,40, 5,40 L 15,40 C 18,40, 20,38, 20,35 L 20,5 C 20,2, 18,0, 15,0 Z M 0,5 L -3,2 L -3,0 L 0,3 Z M 20,5 L 23,2 L 23,0 L 20,3 Z',
      fillColor: "#6F3C9F", // A rich, metallic-like violet
      fillOpacity: 1,
      strokeColor: "#FFFFFF", // White outline for good contrast
      strokeWeight: 1,
      rotation: 0,
      scale: 1.2,
      anchor: new google.maps.Point(10, 20),
    };

    // --- Data Fetching Functions (Chained for Reliability) ---
    function GetSettingValues() {
      var latPromise = $http.get(
        `${appDataUrl}/GetSettingValueByKey?settingKey=DEFAULT_SCHOOL_LATITUDE`,
        { headers: { CallContext: JSON.stringify(context) } }
      );
      var lngPromise = $http.get(
        `${appDataUrl}/GetSettingValueByKey?settingKey=DEFAULT_SCHOOL_LONGITUDE`,
        { headers: { CallContext: JSON.stringify(context) } }
      );

      // Use $q.all to wait for both settings to be fetched
      return $q.all([latPromise, lngPromise]).then(function (results) {
        $scope.Default_School_Latitude = results[0].data || 25.2048; // Default value
        $scope.Default_School_Longitde = results[1].data || 55.2708;
      });
    }

    function GetStopsPositionsByRoute() {
      return $http
        .get(
          `${dataService}/GetStopsPositionsByRoute?studentID=${$scope.StudentID}`,
          { headers: { CallContext: JSON.stringify(context) } }
        )
        .then(function (response) {
          $scope.StopsPositionsByRoute = response.data || [];
        });
    }

    // Added for consistency with the parent app logic
    function GetStudentInOutVehicleStatus() {
        return $http
            .get(`${dataService}/GetStudentInOutVehicleStatus?studentID=${$scope.StudentID}`, {
                headers: { CallContext: JSON.stringify(context) },
            })
            .then(function (response) {
                return !!response.data; // Ensure a boolean is returned
            });
    }

    // --- Map Initialization and Drawing ---
    function initDriverMapLocationPicker() {
      return $http
        .get(
          `${dataService}/GetDriverGeoLocationByStudent?studentID=${$scope.StudentID}`,
          { headers: { CallContext: JSON.stringify(context) } }
        )
        .then(function (response) {
          const locationString = response.data;

          if (!locationString || typeof locationString !== "string") {
            showToast("NOTAVAILABLEFORTRACKING");
            drawEmptyMap();
            return $q.reject("Driver location not available.");
          }

          const locationParts = locationString.split(",");
          if (locationParts.length < 2) {
            showToast("NOTAVAILABLEFORTRACKING");
            drawEmptyMap();
            return $q.reject("Malformed location string.");
          }

          const pos = {
            lat: parseFloat(locationParts[0]),
            lng: parseFloat(locationParts[1]),
          };

          // Initialize the map and start the process
          initializeMap(pos);
          drawStopsAndRoute();
          DriverMap(pos);
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

      const noPoi = [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "all", stylers: [{ saturation: -80 }] },
        {
          featureType: "road.arterial",
          elementType: "geometry",
          stylers: [{ hue: "#00ffee" }, { saturation: 50 }],
        },
        {
          featureType: "poi.business",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ];

      map = new google.maps.Map(document.getElementById("drivermap"), mapOptions);
      map.setOptions({ styles: noPoi });
    }

    function drawEmptyMap() {
        const centerPos = {
            lat: parseFloat($scope.Default_School_Latitude),
            lng: parseFloat($scope.Default_School_Longitde),
        };
        initializeMap(centerPos);
    }

    function drawStopsAndRoute() {
        if (!$scope.StopsPositionsByRoute || $scope.StopsPositionsByRoute.length === 0) return;
        
        const directionsService = new google.maps.DirectionsService();
        $scope.StopsPositionsByRoute.forEach(function (stopPosition, index, array) {
            const lat = stopPosition.latitude || stopPosition.Latitude;
            const lng = stopPosition.longitude || stopPosition.Longitude;
            const stopName = stopPosition.stopName || stopPosition.StopName;
            if (!lat || !lng) return;

            const stopLatLng = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
            
            new google.maps.Marker({
                position: stopLatLng,
                map: map,
                icon: { url: './images/bus-stop.svg', scaledSize: new google.maps.Size(40, 40) },
                label: { color: '#6F3C9F', fontWeight: '600', text: stopName }
            });

            // Draw route to the next stop
            if (index < array.length - 1) {
                const nextStop = array[index + 1];
                const nextLat = nextStop.latitude || nextStop.Latitude;
                const nextLng = nextStop.longitude || nextStop.Longitude;
                if (!nextLat || !nextLng) return;

                const request = {
                    origin: stopLatLng,
                    destination: new google.maps.LatLng(parseFloat(nextLat), parseFloat(nextLng)),
                    travelMode: google.maps.TravelMode.DRIVING
                };

                directionsService.route(request, function (result, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        new google.maps.DirectionsRenderer({
                            map: map,
                            suppressMarkers: true,
                            polylineOptions: { strokeColor: '#4986E7' }
                        }).setDirections(result);
                    }
                });
            }
        });
    }

    // --- Polling and Marker Animation ---
    function DriverMap(initialPos) {
      updateOrMoveMarker(initialPos);
      checkStopArrivals(initialPos);

      // Start the polling loop
      pollingPromise = $timeout(function () {
        $http
          .get(
            `${dataService}/GetDriverGeoLocationByStudent?studentID=${$scope.StudentID}`,
            { headers: { CallContext: JSON.stringify(context) } }
          )
          .then(function (response) {
            const locationString = response.data;
            if (locationString && typeof locationString === "string") {
              const locationParts = locationString.split(",");
              if (locationParts.length >= 2) {
                const newPos = {
                  lat: parseFloat(locationParts[0]),
                  lng: parseFloat(locationParts[1]),
                };
                DriverMap(newPos); // Recursively call with new position
                return;
              }
            }
            throw new Error("Tracking data unavailable or malformed.");
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
        // First time: create the marker
        marker = new google.maps.Marker({
          position: newLatLng,
          map: map,
          icon: vehicleIcon,
        });
        map.setCenter(newLatLng);
      } else {
        // Subsequent times: move the existing marker
        const oldPos = marker.getPosition();
        if (!oldPos.equals(newLatLng)) {
            // Pan the map if needed
            const mapBounds = map.getBounds();
            if (mapBounds && !mapBounds.contains(newLatLng)) {
                map.setCenter(newLatLng);
            } else {
                map.panTo(newLatLng);
            }
          // Animate the marker's movement
          animateMarker(oldPos, newLatLng, POLLING_INTERVAL_MS);
        }
      }
    }

    function animateMarker(startLatLng, endLatLng, duration) {
      const start = performance.now();
      // Calculate the direction of travel
      const heading = google.maps.geometry.spherical.computeHeading(startLatLng, endLatLng);

      const animationFrame = function (time) {
        const elapsed = time - start;
        const progress = Math.min(elapsed / duration, 1);

        // Interpolate the position of the marker
        const currentPos = google.maps.geometry.spherical.interpolate(
          startLatLng,
          endLatLng,
          progress
        );
        marker.setPosition(currentPos);

        // Update the icon's rotation
        const icon = marker.getIcon();
        icon.rotation = heading;
        marker.setIcon(icon);

        // Continue the animation until finished
        if (progress < 1) {
          requestAnimationFrame(animationFrame);
        }
      };
      requestAnimationFrame(animationFrame);
    }

    // --- Helper and Cleanup Functions ---
    function checkStopArrivals(driverPos) {
      const driverLatLng = new google.maps.LatLng(driverPos.lat, driverPos.lng);
      $scope.StopsPositionsByRoute.forEach((stop) => {
        if (!stop.arrived) {
          const stopLatLng = new google.maps.LatLng(
            parseFloat(stop.latitude || stop.Latitude),
            parseFloat(stop.longitude || stop.Longitude)
          );
          if (
            google.maps.geometry.spherical.computeDistanceBetween(driverLatLng, stopLatLng) < 50
          ) {
            stop.arrived = true;
          }
        }
      });
    }

    function showToast(messageKey) {
      $translate([messageKey]).then(function (translation) {
        $rootScope.ShowToastMessage(translation[messageKey] || messageKey);
      });
    }

    // --- Controller Initialization Chain ---
    GetSettingValues()
      .then(GetStopsPositionsByRoute)
      .then(GetStudentInOutVehicleStatus)
      .then(function(isStudentOnBus) {
          if (!isStudentOnBus) {
              showToast("STUDENTBOARDINGNOTCONFIRMEDYET");
              drawEmptyMap(); // Show map centered on school but don't start tracking
              return; // Stop the chain
          }
          // If student is on the bus, proceed to get location and start tracking
          return initDriverMapLocationPicker();
      })
      .catch(function (error) {
        console.error("Initialization failed:", error);
        $rootScope.ShowLoader = false;
        // Optionally show a generic error toast
        showToast("ERROR_FETCHING_LOCATION");
      });

    // Clean up the polling timer when the controller is destroyed
    $scope.$on("$destroy", function () {
      if (pollingPromise) {
        $timeout.cancel(pollingPromise);
        console.log("Polling for driver location has been stopped.");
      }
    });
  },
]);