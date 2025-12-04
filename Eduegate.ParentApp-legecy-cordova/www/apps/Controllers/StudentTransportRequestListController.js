app.controller("StudentTransportRequestListController", [
  "$scope",
  "$http",
  "rootUrl",
  "GetContext",
  "$stateParams",
  "$rootScope",
  "$state",
  "$window",
  "$timeout",
  function (
    $scope,
    $http,
    rootUrl,
    GetContext,
    $stateParams,
    $rootScope,
    $state,
    $window,
    $timeout
  ) {
    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();

    $scope.init = function () {
      $scope.StudentSubjectList();
    };

    $scope.StudentSubjectList = function (studentID) {
      $scope.Applications = [];

      $http({
        method: "GET",
        url: dataService + "/GetTransportApplication",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      })
        .success(function (result) {
          // Assign the result to the scope
          $scope.Applications = result;

          $rootScope.ShowLoader = false;
          $rootScope.ShowPreLoader = false;
        })
        .error(function () {
          $rootScope.ShowLoader = false;
        });
    };

    $scope.EditTransportApplicationClick = function (TransportApplctnStudentMapIID) {
      $state.go("studenttransportrequestapplication", {
        TransportApplctnStudentMapIID: TransportApplctnStudentMapIID,
      });
    };
  $scope.CancelTransportApplication = function (application) {
      var mapIID = application.TransportApplctnStudentMapIID;

      if (!mapIID) {
          return false;
      }

$http({
    method: 'POST',
    url: dataService + "/CancelTransportApplication",
    params: { mapIID: mapIID },
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
}).then(function (response) {
    var result = response.data;

    if (typeof result === 'object' && result.IsError) {
        var errorMessage = result.Response || JSON.stringify(result);
        $rootScope.ShowToastMessage(errorMessage, "error");
        return false;
    } else {
        $rootScope.ShowToastMessage(result, "success");
        $timeout(function () {
            $scope.init();
        }, 1000);
    }
}, function (error) {
    $rootScope.ShowToastMessage("Request failed.", "error");
});

  };

    // Initialize controller
    $scope.init();
  },
]);
