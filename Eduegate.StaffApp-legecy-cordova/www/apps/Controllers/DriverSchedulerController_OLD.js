app.controller("DriverSchedulerController_OLD", [
  "$scope",
  "$http",
  "$state",
  "rootUrl",
  "$location",
  "$rootScope",
  "$stateParams",
  "GetContext",
  "$sce",
  function (
    $scope,
    $http,
    $state,
    rootUrl,
    $location,
    $rootScope,
    $stateParams,
    GetContext,
    $sce
  ) {
    console.log("DriverSchedulerController_OLD loaded.");
    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();

    $scope.onRouteDetails = false;
    $scope.ScheduleDetails = [];
    $scope.VehiclesDetails = [];
    $scope.RoutesDetails = [];
    $scope.RouteStopsDetails = [];
    $scope.StopStudentsDetails = [];
    $scope.CurrentDate = new Date();

    $scope.IsStudentDetails = true;
    $scope.IsStaffDetails = true;

    $rootScope.ShowLoader = true;

    $scope.init = function () {
      $scope.IsStudentDetails = true;
    };

    $scope.ValueClick = function (type) {
      var acc = document.getElementsByClassName("accordion");
      var i;
      for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function () {
          this.classList.toggle("active");
          var panel = this.nextElementSibling;
          if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
          } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
          }
        });
      }
    };

    $scope.toggleGrid = function (event) {
      toggleHeader = $(event.currentTarget)
        .closest(".toggleContainer")
        .find(".toggleHeader");
      toggleContent = $(event.currentTarget)
        .closest(".toggleContainer")
        .find(".toggleContent");
      toggleHeader.toggleClass("active");
      if (toggleHeader.hasClass("active")) {
        toggleContent.slideDown("fast");
      } else {
        toggleContent.slideUp("fast");
      }
    };

    $scope.GetDetails = function (type) {
    };

    $scope.LoadVehicleInfo = function () {
      $http({
        method: "GET",
        url: dataService + "/GetVehicleDetailsByEmployeeLoginID",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      })
        .success(function (result) {
          $scope.VehiclesDetails = result;
        })
        .error(function () {
          $rootScope.ShowLoader = false;
        });
    };

    $scope.GetRoutesInfo = function (data) {
      $http({
        method: "GET",
        url: dataService + "/GetRoutesByVehicleID?vehicleID=" + data.VehicleIID,
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      })
        .success(function (result) {
          $scope.RoutesDetails = result;
        })
        .error(function () {
          $rootScope.ShowLoader = false;
        });
    };

    $scope.GetRouteStopsInfo = function (data) {
      $http({
        method: "GET",
        url: dataService + "/GetRouteStopsByRouteID?routeID=" + data.RouteID,
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      })
        .success(function (result) {
          $scope.RouteStopsDetails = result;
        })
        .error(function () {
          $rootScope.ShowLoader = false;
        });
    };

    $scope.GetStudentsInfo = function (data) {
      $http({
        method: "GET",
        url:
          dataService +
          "/GetStudentsDetailsByRouteStopID?routeStopMapID=" +
          data.RouteStopMapIID,
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      })
        .success(function (result) {
          $scope.StopStudentsDetails = result;
        })
        .error(function () {
          $rootScope.ShowLoader = false;
        });
    };

    $scope.ExpandCollapase = function (event, model, field, type) {
      model[field] = !model[field];

      if (model[field] == true) {
        if (type === "Vehicle") {
          $scope.GetRoutesInfo(model);
        }

        if (type === "Route") {
          $scope.GetRouteStopsInfo(model);
        }

        if (type === "Stop") {
          $scope.GetStudentsInfo(model);
        }
      }

      var $groupRow = $(event.currentTarget).closest("tr").next();

      if (model[field]) {
        $groupRow.show();
      } else {
        $groupRow.hide();
      }
    };

    $scope.init();
  },
]);
