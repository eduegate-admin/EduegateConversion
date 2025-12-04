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
    const POLLING_INTERVAL_MS = 10000;
    var context = GetContext.Context();
    var dataService = rootUrl.SchoolServiceUrl;
    var appDataUrl = rootUrl.RootUrl;
    $scope.StudentID = $stateParams.studentID;
    $scope.StopsPositionsByRoute = [];
    var pollingPromise = null;
    var map; // Keep a reference to the map object
    var marker; // Keep a reference to the driver's marker object

    // --- High-Performance SVG Bus Icon ---
    // Using an SVG path is dramatically more performant than loading an image.
const vehicleIcon = {
  // A new, cleaner path with distinct, visible mirrors
  path: 'M 5,0 C 2,0, 0,2, 0,5 L 0,35 C 0,38, 2,40, 5,40 L 15,40 C 18,40, 20,38, 20,35 L 20,5 C 20,2, 18,0, 15,0 Z M 0,5 L -3,2 L -3,0 L 0,3 Z M 20,5 L 23,2 L 23,0 L 20,3 Z',
  fillColor: "#6F3C9F", // A rich, metallic-like violet
  fillOpacity: 1,
  strokeColor: "#FFFFFF", // White outline for good contrast
  strokeWeight: 1,
  rotation: 0, // Can be updated with the bus's bearing
  scale: 1.2,
  // Anchor is set to the center of the main bus body
  anchor: new google.maps.Point(10, 20)
};

    // --- Data Fetching (Chained to prevent race conditions) ---
    function GetSettingValues() {
      var latPromise = $http.get(
        `${appDataUrl}/GetSettingValueByKey?settingKey=DEFAULT_SCHOOL_LATITUDE`,
        { headers: { CallContext: JSON.stringify(context) } }
      );
      var lngPromise = $http.get(
        `${appDataUrl}/GetSettingValueByKey?settingKey=DEFAULT_SCHOOL_LONGITUDE`,
        { headers: { CallContext: JSON.stringify(context) } }
      );

      return $q.all([latPromise, lngPromise]).then(function (results) {
        // Provide default values if settings are missing
        $scope.Default_School_Latitude = results[0].data || 25.2048; // Default to Dubai
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

    function GetStudentInOutVehicleStatus() {
      return $http
        .get(
          `${dataService}/GetStudentInOutVehicleStatus?studentID=${$scope.StudentID}`,
          { headers: { CallContext: JSON.stringify(context) } }
        )
        .then(function (response) {
          return !!response.data; // Ensure it's a boolean
        });
    }

    // --- Map Initialization ---
 function initDriverMapLocationPicker() {
      return $http
        .get(
          `${dataService}/GetDriverGeoLocationByStudent?studentID=${$scope.StudentID}`,
          { headers: { CallContext: JSON.stringify(context) } }
        )
        .then(function (response) {
          // THE FIX: The API is returning a plain string, not a JSON object.
          const locationString = response.data;

          // Check if the string is valid
          if (!locationString || typeof locationString !== 'string') {
            showToast("NOTAVAILABLEFORTRACKING");
            drawEmptyMap();
            return $q.reject("Driver location not available or in wrong format.");
          }

          const locationParts = locationString.split(',');

          // Check if the split was successful
          if (locationParts.length < 2) {
            showToast("NOTAVAILABLEFORTRACKING");
            drawEmptyMap();
            return $q.reject("Received malformed location string: " + locationString);
          }

          const pos = {
            lat: parseFloat(locationParts[0]),
            lng: parseFloat(locationParts[1]),
          };

          initializeMap(pos);
          drawStopsAndRoute();
          DriverMap(pos);
        });
    }
    function initializeMap(centerPos) {
      // RESTORED: All original map options, including tilt for 3D view.
      const mapOptions = {
        zoom: 16,
        gestureHandling: "greedy",
        center: centerPos,
        heading: 320,
        tilt: 47.5, // This gives the 3D perspective
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      };

      // RESTORED: The original complex styling for the map.
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
        {
          elementType: "labels.text.fill",
          stylers: [
            { color: "#dddddd" },
            { visibility: "on" },
            { weight: 0.1 },
            { gamma: 0.5 },
          ],
        },
        {
          elementType: "labels.text.stroke",
          stylers: [{ color: "#ffffff" }, { visibility: "on" }],
        },
      ];

      map = new google.maps.Map(
        document.getElementById("drivermap"),
        mapOptions
      );
      map.setOptions({ styles: noPoi });
    }

    function drawEmptyMap() {
      const centerPos = {
        lat: parseFloat($scope.Default_School_Latitude),
        lng: parseFloat($scope.Default_School_Longitde),
      };
      initializeMap(centerPos);
      // Optionally, you could add the school as a marker here
    }

      function drawStopsAndRoute() {
        const directionsService = new google.maps.DirectionsService();
        $scope.StopsPositionsByRoute.forEach(function (stopPosition, index, array) {
            const lat = stopPosition.latitude || stopPosition.Latitude;
            const lng = stopPosition.longitude || stopPosition.Longitude;
            const stopName = stopPosition.stopName || stopPosition.StopName; // Also fix the stop name
            if (!lat || !lng) { return; }

            const stopLatLng = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
            new google.maps.Marker({
                position: stopLatLng,
                map: map,
                icon: { url: './images/bus-stop.svg', scaledSize: new google.maps.Size(40, 40) },
                label: { color: '#6F3C9F', fontWeight: '600', text: stopName }
            });

            if (index < array.length - 1) {
                const nextStop = array[index + 1];
                const nextLat = nextStop.latitude || nextStop.Latitude;
                const nextLng = nextStop.longitude || nextStop.Longitude;
                if (!nextLat || !nextLng) { return; }

                const request = {
                    origin: stopLatLng,
                    destination: new google.maps.LatLng(parseFloat(nextLat), parseFloat(nextLng)),
                    travelMode: google.maps.TravelMode.DRIVING
                };
                directionsService.route(request, function (result, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        new google.maps.DirectionsRenderer({ map: map, suppressMarkers: true, polylineOptions: { strokeColor: '#4986E7' } }).setDirections(result);
                    }
                });
            }
        });
    }

 function DriverMap(initialPos) {
      updateOrMoveMarker(initialPos);
      checkStopArrivals(initialPos);

      pollingPromise = $timeout(function () {
        $http
          .get(
            `${dataService}/GetDriverGeoLocationByStudent?studentID=${$scope.StudentID}`,
            { headers: { CallContext: JSON.stringify(context) } }
          )
          .then(function (response) {
            // APPLY THE SAME FIX HERE for polling
            const locationString = response.data;
            if (locationString && typeof locationString === 'string') {
              const locationParts = locationString.split(',');
              if (locationParts.length >= 2) {
                const newPos = {
                  lat: parseFloat(locationParts[0]),
                  lng: parseFloat(locationParts[1]),
                };
                DriverMap(newPos); // Recursively call with new position
                return; // Exit the function here
              }
            }
            // If we reach here, the data was invalid
            throw new Error("Tracking data became unavailable or malformed.");
          })
          .catch(function (error) {
            console.error("Stopping polling due to an error:", error.message);
            showToast("TRACKINGSTOPPED");
            $timeout.cancel(pollingPromise);
          });
      }, POLLING_INTERVAL_MS);
    }

    function updateOrMoveMarker(newPos) {
      const newLatLng = new google.maps.LatLng(newPos.lat, newPos.lng);

      if (!marker) {
        marker = new google.maps.Marker({
          position: newLatLng,
          map: map,
          icon: vehicleIcon,
        });
        map.setCenter(newLatLng);
      } else {
        const oldPos = marker.getPosition();
        if (!oldPos.equals(newLatLng)) {
          const mapBounds = map.getBounds();
          if (mapBounds && !mapBounds.contains(newLatLng)) {
            map.setCenter(newLatLng);
          } else {
            map.panTo(newLatLng);
          }
          // Animate marker using the constant for duration
          animateMarker(oldPos, newLatLng, POLLING_INTERVAL_MS);
        }
      }
    }

    // --- KEY CHANGE: Animation now only handles the marker ---
    function animateMarker(startLatLng, endLatLng, duration) {
      const start = performance.now();
      const heading = google.maps.geometry.spherical.computeHeading(
        startLatLng,
        endLatLng
      );

      const animationFrame = function (time) {
        const elapsed = time - start;
        const progress = Math.min(elapsed / duration, 1);
        const currentPos = google.maps.geometry.spherical.interpolate(
          startLatLng,
          endLatLng,
          progress
        );

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
    // --- Helper Functions ---
    function checkStopArrivals(driverPos) {
      const driverLatLng = new google.maps.LatLng(driverPos.lat, driverPos.lng);
      $scope.StopsPositionsByRoute.forEach((stop) => {
        if (!stop.arrived) {
          const stopLatLng = new google.maps.LatLng(
            parseFloat(stop.latitude),
            parseFloat(stop.longitude)
          );
          if (
            google.maps.geometry.spherical.computeDistanceBetween(
              driverLatLng,
              stopLatLng
            ) < 50
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
   GetSettingValues()
      .then(GetStopsPositionsByRoute)
      .then(GetStudentInOutVehicleStatus)
      .then(function (isStudentOnBus) {
        if (!isStudentOnBus) {
          showToast("STUDENTBOARDINGNOTCONFIRMEDYET");
          drawEmptyMap();
          return;
        }
        return initDriverMapLocationPicker();
      })
      .catch(function (error) {
        console.error("Initialization failed:", error);
        if (error.indexOf && error.indexOf('location') === -1) {
            $rootScope.ShowLoader = false;
        }
      });

    $scope.$on("$destroy", function () {
      if (pollingPromise) {
        $timeout.cancel(pollingPromise);
        console.log("Polling for driver location has been stopped.");
      }
    });
  },
]);
