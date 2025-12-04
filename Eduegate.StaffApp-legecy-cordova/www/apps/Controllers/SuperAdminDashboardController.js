app.controller('SuperAdminDashboardController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', '$state', '$stateParams', '$sce', '$rootScope', function ($scope, $http, loggedIn, rootUrl, $location, GetContext, $state, $stateParams, $sce, $rootScope) {
  var dataService = rootUrl.SchoolServiceUrl;
  $scope.ContentService = rootUrl.ContentServiceUrl;
  var rootUrl = rootUrl.RootUrl;
  var securityService = rootUrl.SecurityServiceUrl;
  var context = GetContext.Context();
  // $rootScope.ShowLoader = true;
  $rootScope.UserName = context.EmailID;
  $scope.NewAssignmentCount = 0;
  $scope.MyClassCount = 0;
  $scope.LessonPlanCount = 0;
  $scope.NotificationCount = 0;
  $rootScope.BoilerPlates = [];
  $rootScope.HomeBanners = [];
  var pageInfoPromise = null;
  $rootScope.UserDetails = null;
  $rootScope.Driver = false
  $scope.Teacher = false
  $rootScope.Admin = false
  $rootScope.Director = false;
  $rootScope.UserClaimSets = context.UserClaimSets;
  $scope.attendanceCardSpinner = true;

  if ($rootScope.UserClaimSets.some(code => code.Value === 'Driver')) {
    $rootScope.Driver = true,
      localStorage.setItem("isDriver", "true"); // Set when user logs in as a driver
  }
  if ($rootScope.UserClaimSets.some(code => code.Value === 'Class Teacher')) {
    $scope.Teacher = true
    localStorage.setItem("isDriver", "false"); // Set when user logs in other than driver

  }
  if ($rootScope.UserClaimSets.some(code => code.Value === 'Super Admin')) {
    $rootScope.Admin = true
    localStorage.setItem("isDriver", "false"); // Set when user logs in other than driver

  }
  if ($rootScope.UserClaimSets.some(code => code.Value === 'Director')) {
    $rootScope.Director = true;
    $rootScope.Admin = true;
    localStorage.setItem("isDriver", "false"); // Set when user logs in other than driver

  }

 if (typeof $rootScope.locationPromptHandled === 'undefined') {
    $rootScope.locationPromptHandled = false;
  }

  $scope.init = function () {

 if (!$scope.deviceReadyAttached) {
        document.addEventListener('deviceready', onDeviceReady, false);
        $scope.deviceReadyAttached = true;
    }

    function onDeviceReady() {
        // Now, the check function will use the persistent $rootScope flag.
        if (device.platform.toLowerCase() === "android") {
            checklocationService();
        } else {
            checklocationServiceIOS();
        }
    }

    $('.main-carousel').flickity({
      // options
      cellAlign: 'left',
      contain: true,
      wrapAround: true,
      autoPlay: true,
      adaptiveHeight: true,
      pageDots: false,
      dragThreshold: 10,
      imagesLoaded: true,
      prevNextButtons: false,
    });

    $scope.GetSettingValues();

    $scope.GetTodaysAttendance();
    $scope.LoadProfileInfo();
    $scope.getPageInfo();
    $scope.GetLatestStaffCircularCount();
    $scope.GetMyNotificationCount();

    if (!$rootScope.Driver) {

      $scope.GetMyClassCount();
      $scope.GetEmployeeAssignmentsCount();
      $scope.GetMyLessonPlanCount();
    }

    if ($rootScope.geoLocationInterval != null) {
      clearTimeout($rootScope.geoLocationInterval);
    };

    logGeoLocation();
  };

  $scope.GetSettingValues = function () {

    if ($rootScope.Driver) {
      $http({
        method: "GET",
        url:
          rootUrl +
          "/GetSettingValueByKey?settingKey=" +
          "DRIVER_LOCATION_UPDATE_DISTANCE_THRESHOLD",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).success(function (result) {
        $rootScope.driverLocationUpdateDistanceThreshold = result;
      }).error(function () {
      });
    }
  };

  $scope.getPageInfo = function () {

    if (pageInfoPromise) {
      if (pageInfoPromise.reject) {
        pageInfoPromise.reject("Aborted");
      }
    }

    pageInfoPromise = $http({
      url: rootUrl + '/GetPageInfo?pageID=109&parameter=',
      method: 'GET',
      headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(context) },
    }).then(function (result) {
      pageInfoPromise = null;
      result = result.data;
      $rootScope.LoadingMessage = "";
      if (result != undefined && result != null && result.BoilerPlates != undefined && result.BoilerPlates != null) {
        $rootScope.BoilerPlates = result.BoilerPlates;
        $rootScope.ShowLoader = false;
      }
      else {
        $rootScope.ShowLoader = false;
      }
    }, function (err) {
      pageInfoPromise = null;
      // $scope.getPageInfo();
    });
  };

  //Used for showing ID Card when the App Opens by using Modal
  // const myModal = new bootstrap.Modal(document.getElementById('myModal'))

let locationOffHandled = false; // global or scoped depending on your app

function checklocationService() {
  cordova.plugins.diagnostic.getLocationMode(
    function (locationMode) {
      switch (locationMode) {
        case cordova.plugins.diagnostic.locationMode.HIGH_ACCURACY:
          console.log("High accuracy");
          $rootScope.locationPromptHandled = false;
          break;

        case cordova.plugins.diagnostic.locationMode.BATTERY_SAVING:
          console.log("Battery saving");
          $rootScope.locationPromptHandled = false;
          break;

        case cordova.plugins.diagnostic.locationMode.DEVICE_ONLY:
          console.log("Device only");

          // Request permission
          cordova.plugins.diagnostic.requestLocationAuthorization(
            function (status) {
              console.log(status);
            },
            function (error) {
              console.error(error);
            },
            cordova.plugins.diagnostic.locationAuthorizationMode.WHEN_IN_USE
          );

          cordova.plugins.diagnostic.isLocationAvailable(
            function (available) {
              console.log("Location is " + (available ? "available" : "not available"));
            },
            function (error) {
              console.error("The following error occurred: " + error);
            }
          );
          break;

        case cordova.plugins.diagnostic.locationMode.LOCATION_OFF:
          console.log("Location off");

          // Only show once
          if (!locationOffHandled) {
            $rootScope.locationPromptHandled = true;

            var myModal = new bootstrap.Modal(document.getElementById('exampleModal'));
            myModal.show();

            cordova.plugins.locationAccuracy.canRequest(function (canRequest) {
              if (canRequest) {
                cordova.plugins.locationAccuracy.request(
                  function (success) {
                    console.log("Successfully requested accuracy: " + success.message);
                     $rootScope.locationPromptHandled = false;
                  },
                  function (error) {
                    console.error("Accuracy request failed: code=" + error.code + ", message=" + error.message);
                    if (error.code !== cordova.plugins.locationAccuracy.ERROR_USER_DISAGREED) {
                      if (window.confirm("Failed to automatically set Location Mode to 'High Accuracy'. Would you like to switch to the Location Settings page and do this manually?")) {
                        cordova.plugins.diagnostic.switchToLocationSettings();
                      }
                    }
                  },
                  cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY
                );
              }
            });

            cordova.plugins.diagnostic.isLocationAvailable(
              function (available) {
                console.log("Location is " + (available ? "available" : "not available"));
              },
              function (error) {
                console.error("The following error occurred: " + error);
              }
            );
          }
          break;
      }
    },
    function (error) {
      console.error("The following error occurred: " + error);
    }
  );

  cordova.plugins.diagnostic.isLocationEnabled(
    function (enabled) {
      console.log("Location setting is " + (enabled ? "enabled" : "disabled"));
    },
    function (error) {
      console.error("The following error occurred: " + error);
    }
  );
}


  function checklocationServiceIOS() {
    cordova.plugins.diagnostic.isLocationAuthorized(function (authorized) {
      if (!authorized) {
        cordova.plugins.diagnostic.requestLocationAuthorization(
          function (status) {
            console.log(status);
          },
          function (error) {
            console.error(error);
          },
          cordova.plugins.diagnostic.locationAuthorizationMode.WHEN_IN_USE
        );
      }
    }, function (error) {
      console.error("The following error occurred: " + error);
    });
    cordova.plugins.diagnostic.getLocationAuthorizationStatus(function (status) {
      switch (status) {
        case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
          console.log("Permission not requested");
          break;
        case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
          console.log("Permission denied");
          checklocationServiceIOS()
          break;
        case cordova.plugins.diagnostic.permissionStatus.GRANTED:
          console.log("Permission granted always");
          break;
        case cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
          console.log("Permission granted only when in use");
          break;
      }
    }, function (error) {
      console.error("The following error occurred: " + error);
    });

  }
  // Variable to store the last known position
  let lastPosition = null;
  let geoLocationTimeout = null; // Store timeout reference

  let previousSpeed = 0;
  // Function to handle position updates
  function handlePosition(position) {
    const { latitude, longitude ,speed  } = position.coords;
    const currentPosition = `${latitude},${longitude}`;


    if (speed !== null) {
      const speedInKmH = Math.round(speed * 3.6); // Convert to km/h and remove decimal
  
      if (Math.abs(speedInKmH - previousSpeed) >= 1) {  // Check if change is greater than 2
        previousSpeed = speedInKmH;
  
        $scope.$apply(function() {
          $scope.currentSpeed = speedInKmH; // Only number, no "km/h" text
        });
  
        // Also update speedometer gauge if present
        if (document.gauges && document.gauges.get('speedometer')) {
          document.gauges.get('speedometer').value = speedInKmH;
        }
      }
    } else {
      $scope.$apply(function() {
        $scope.currentSpeed = 0;
      });
    }

    
    // Calculate distance from the last known position (if exists)
    if (lastPosition) {
      const [lastLat, lastLong] = lastPosition.split(',').map(parseFloat);
      const [currentLat, currentLong] = currentPosition.split(',').map(parseFloat);

      // Calculate distance using Haversine formula
      const distance = calculateDistance(lastLat, lastLong, currentLat, currentLong);

      // Check if distance is greater than 20 meters (adjusted as requested)
      if (distance > $rootScope.driverLocationUpdateDistanceThreshold) {
        // Update the last known position
        lastPosition = currentPosition;

        // Send HTTP request to update user's geolocation
        updateGeoLocation(currentPosition);
      } else {
        // Schedule the next update
        scheduleNextUpdate();
      }
    } else {
      // First time capturing position, set lastPosition
      lastPosition = currentPosition;
      updateGeoLocation(currentPosition);
    }
  }

  // Function to update user's geolocation via HTTP request
  function updateGeoLocation(currentPosition) {
    // Clear existing timeout to avoid stacking timeouts
    clearTimeout(geoLocationTimeout);

    $http({
      url: `${dataService}/UpdateUserGeoLocation?geoLocation=${currentPosition}`,
      method: 'GET',
      headers: {
        Accept: 'application/json;charset=UTF-8',
        'Content-Type': 'application/json; charset=utf-8',
        CallContext: JSON.stringify(context),
      },
    }).then(scheduleNextUpdate, scheduleNextUpdate);
  }

  // Function to calculate distance between two points using Haversine formula
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in meters

    return distance;
  }

  // Function to schedule the next update
  function scheduleNextUpdate() {
    clearTimeout(geoLocationTimeout);  // Clear any existing timeout
    geoLocationTimeout = setTimeout(logGeoLocation, 10000); // Adjust time as needed
  }

  // Function to handle errors
  function errorCallback() {
    scheduleNextUpdate();
  }

  // Main function to start geolocation tracking
  function logGeoLocation() {

    navigator.geolocation.watchPosition(handlePosition, errorCallback, {
      timeout: 10000, // Adjusted timeout for high frequency updates
      enableHighAccuracy: true,
    });
  }


  logGeoLocation();



  $scope.CloseAttendanceCard = function () {
    document.getElementById("attendanceCard").style.display = "none";
  }

  $scope.GetTodaysAttendance = function () {

    $scope.TodaysAttendanceData = null;
    $scope.attendanceCardSpinner = true;

    $http({
      method: 'GET',
      url: dataService + '/GetTodayStaffAttendanceByLoginID',
      data: $scope.user,
      headers: {
        "Accept": "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        "CallContext": JSON.stringify(context)
      }
    }).success(function (result) {
      $scope.TodaysAttendanceData = result;

      const timestamp = $scope.TodaysAttendanceData?.AttendenceDate;
      if (timestamp) {
        const date = new Date(timestamp);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', options);
        $scope.TodaysAttendanceData.AttendenceDate = formattedDate;
      } else {
        console.log("Timestamp is not available");
      }

      $scope.attendanceCardSpinner = false;
    })
      .error(function () {
        // $rootScope.ShowLoader = false;
        $scope.attendanceCardSpinner = false;
      });
  }

  $scope.LoadProfileInfo = function () {

    $http({
      method: 'GET',
      url: dataService + '/GetStaffDetailForHome',
      headers: {
        "Accept": "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        "CallContext": JSON.stringify(context)
      }
    }).success(function (result) {
      $scope.Profile = result;

      if ($scope.Profile == null) {
        $scope.onProfileFilling = false;
      }

    }).error(function (err) {
    });

  }

  $scope.GetMyClassCount = function () {

    $http({
      method: 'GET',
      url: dataService + '/GetMyClassCount',
      data: $scope.user,
      headers: {
        "Accept": "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        "CallContext": JSON.stringify(context)
      }
    }).success(function (result) {
      $scope.MyClassCount = result;
    })
      .error(function () {
        // $rootScope.ShowLoader = false;
      });
  }

  $scope.GetLatestStaffCircularCount = function () {
    $http({
      method: 'GET',
      url: dataService + '/GetLatestStaffCircularCount',
      data: $scope.user,
      headers: {
        "Accept": "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        "CallContext": JSON.stringify(context)
      }
    }).success(function (result) {
      $scope.GetLatestStaffCircularCount = result;
    })
      .error(function () {
      });
  }

  $scope.GetEmployeeAssignmentsCount = function () {

    $http({
      method: 'GET',
      url: dataService + '/GetEmployeeAssignmentsCount',
      data: $scope.user,
      headers: {
        "Accept": "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        "CallContext": JSON.stringify(context)
      }
    }).success(function (result) {
      $scope.NewAssignmentCount = result;
    })
      .error(function () {
      });
  }

  $scope.GetMyLessonPlanCount = function () {

    $http({
      method: 'GET',
      url: dataService + '/GetMyLessonPlanCount',
      data: $scope.user,
      headers: {
        "Accept": "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        "CallContext": JSON.stringify(context)
      }
    }).success(function (result) {
      $scope.LessonPlanCount = result;
    })
      .error(function () {
        // $rootScope.ShowLoader = false;
      });
  }

  $scope.GetMyNotificationCount = function () {
    $http({
      method: 'GET',
      url: dataService + '/GetMyNotificationCount',
      data: $scope.user,
      headers: {
        "Accept": "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        "CallContext": JSON.stringify(context)
      }
    }).success(function (result) {
      $scope.NotificationCount = result;
    })
      .error(function () {
        // $rootScope.ShowLoader = false;
      });
  }
  
  $scope.DriverLocationClick = function () {
    $state.go("driverlocation", { employeeID: $scope.employeeID });
  }

  $scope.init();

}]);