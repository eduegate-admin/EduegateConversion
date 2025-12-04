app.controller("InspectionController", ["$scope", "$http", "$state", "rootUrl", "$location", "$rootScope", "$stateParams", "GetContext", "$sce", "$timeout", function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
  console.log("Inspection controller loaded.");

  var dataService = rootUrl.SchoolServiceUrl;
  var parentPortal = rootUrl.ParentUrl;
  $scope.ContentService = rootUrl.ContentServiceUrl;
  var context = GetContext.Context();

  $scope.ActiveStudentPickLogs = null;
  $scope.CurrentLoginID = context.LoginID;
  $scope.ShowResultMsg = false;
  $scope.InspectionColor = null;

  $scope.init = function () {
    // this is the complete list of currently supported params you can pass to the plugin (all optional)
    $scope.spinner= false;
    $scope.GetTodayStudentPickLogsforInspection();
    $scope.GetTodayInspectionColour();
  };


  Fancybox.bind("[data-fancybox]", {
    // Your custom options
  });

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

}]);