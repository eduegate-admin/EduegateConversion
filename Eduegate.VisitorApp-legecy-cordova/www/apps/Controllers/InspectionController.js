app.controller("InspectionController", ["$scope", "$http", "$state", "rootUrl", "$location", "$rootScope", "$stateParams", "GetContext", "$sce", "$timeout","$q" ,  function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout , $q  ) {
    console.log("Inspection controller loaded.");

    var dataService = rootUrl.SchoolServiceUrl;
    var parentPortal = rootUrl.ParentUrl;
     $scope.ContentService = rootUrl.ContentServiceUrl;
    var context = GetContext.Context();

    $scope.ActiveStudentPickLogs = null;
    $scope.CurrentLoginID = context.LoginID;
    $scope.ShowResultMsg = false;
    $scope.InspectionColor  = null;

    $scope.init = function () {
      // this is the complete list of currently supported params you can pass to the plugin (all optional)
      $scope.spinner= false;
      $scope.GetTodayStudentPickLogsforInspection();

      $scope.FillUserDetails().then(function () {
        // After FillUserDetails completes, call GetUnverifiedStudentsAssignedToVisitor
        return     $scope.GetTodayStudentPickLogsByvisitorLoginID();


    }).catch(function (error) {
        console.error("An error occurred during initialization:", error);
    });

      $scope.GetTodayInspectionColour();
    };


    Fancybox.bind("[data-fancybox]", {
      // Your custom options
    });

    $scope.FillUserDetails = function () {
      return $q(function (resolve, reject) {
          $http({
              method: "GET",
              url: dataService + "/GetVisitorDetailsByLoginID?loginID=" + context.LoginID,
              headers: {
                  Accept: "application/json;charset=UTF-8",
                  "Content-type": "application/json; charset=utf-8",
                  CallContext: null,
              },
          }).then(function (response) {
              if (response.data) {
                  $scope.UserDetails = response.data;
                  resolve(); // Resolve the promise if data is found
              } else {
                  $state.go("login", null, { reload: true });
                  $rootScope.ShowButtonLoader = false;
                  $scope.IsLoggedIn = false;
                  reject("User not logged in"); // Reject if no user details are found
              }
          }).catch(function (err) {
              $rootScope.ErrorMessage = "Please try later";
              $scope.Message = "Please try later";
              $rootScope.ShowButtonLoader = false;
              $scope.IsLoggedIn = false;
              reject(err); // Reject the promise on error
          });
      });
  };
    $scope.GetTodayStudentPickLogsforInspection = function () {
      $scope.spinner= true;

      $http({
        method: "GET",
        url: dataService + "/GetAndUpdateActivePickLogsForInspection?",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).success(function (result) {

        $timeout(function () {
          $scope.$apply(function () {
            $scope.ActiveStudentPickLogs = result;

            if ($scope.ActiveStudentPickLogs.length <= 0) {
              $scope.ShowResultMsg = true;
            }
            $scope.ActiveLogCount = $scope.ActiveStudentPickLogs.length;

            $scope.spinner= false;
          });
        }, 1000);
      });
    }

    $scope.GetTodayInspectionColour = function () {
      $http({
        method: "GET",
        url: dataService + "/GetTodayInspectionColour?",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).success(function (result) {
        var bgColour = result;
        $scope.InspectionColor = bgColour;

      });
    }
    $scope.GetTodayStudentPickLogsByvisitorLoginID = function() {
    $scope.visitorCode = $scope.UserDetails.VisitorNumber;

      $http({
        method: "GET",
        url: dataService + "/GetTodayStudentPickLogsByvisitorLoginID?visitorCode=" + $scope.visitorCode,
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).success(function (result) {

        $scope.TodayStudentPickLogsByvisitorLoginID = result;

      });
    }

    $scope.init();

  }]);