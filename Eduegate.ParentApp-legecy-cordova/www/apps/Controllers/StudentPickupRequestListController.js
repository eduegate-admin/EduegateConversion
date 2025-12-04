app.controller("StudentPickupRequestListController", ["$scope", "$http", "$state", "rootUrl", "$location", "$rootScope", "$stateParams", "GetContext", "$sce", "$timeout", function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
  console.log("Student pickup request list controller loaded.");

  var dataService = rootUrl.SchoolServiceUrl;
  var context = GetContext.Context();

  $scope.StudentsPickupRequests = [];

  $scope.init = function () {

    $rootScope.ShowLoader = true;
    $scope.ShowPreLoader = true;

    $scope.GetPickupRequestList();
  };

  $scope.GetPickupRequestList = function () {
    $scope.StudentsPickupRequests = [];

    $http({
      method: "GET",
      url: dataService + "/GetStudentPickupRequests",
      headers: {
        Accept: "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        CallContext: JSON.stringify(context),
      },
    }).success(function (result) {

      $scope.StudentsPickupRequests = result;

      $rootScope.ShowLoader = false;
      $scope.ShowPreLoader = false;

    }).error(function () {
      $rootScope.ShowLoader = false;
      $scope.ShowPreLoader = false;
    });

  };

  $scope.CancelPickupRequestClick = function (pickupData) {

      $rootScope.ShowLoader = true;

    $http({
      method: 'POST',
      url: dataService + "/CancelStudentPickupRequestByID?pickupRequestID=" + pickupData.StudentPickupRequestIID,
      headers: {
        Accept: "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        CallContext: JSON.stringify(context),
      },
    }).success(function (result) {

      if (result.operationResult == 1) {

        $rootScope.ShowToastMessage(result.Message, 'success');

        $timeout(function () {
          $scope.$apply(function () {
            $scope.GetPickupRequestList();
          });
        });

      } else if (result.operationResult == 2) {

        $rootScope.ShowToastMessage(result.Message, 'error');

      }

      $rootScope.ShowLoader = false;

    }).error(function () {
      $rootScope.ShowToastMessage("Something went wrong, try again later!", 'error');
      $rootScope.ShowLoader = false;
      return false;
    });
  };

  $scope.NewStudentPickupRequestClick = function () {
    $state.go("studentpickuprequest");
  };

}]);