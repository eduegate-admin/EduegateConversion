app.controller('DriverDetailsController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce) {
    console.log('DriverDetailsController loaded.');

  var dataService = rootUrl.SchoolServiceUrl;

    var context = GetContext.Context();

    $scope.ContentService = rootUrl.ContentServiceUrl;

    $scope.DriverDetail = {};
  $scope.StudentID = $stateParams.studentID;


    $scope.init = function() {
        $scope.GetDriverDetails();
    }

    $scope.GetDriverDetails = function () {
        $http({
          url:
          dataService +
          '/GetDriverDetailsByStudent?studentID=' + $scope.StudentID,
          method: "GET",
          headers: {
            Accept: "application/json;charset=UTF-8",
            "Content-type": "application/json; charset=utf-8",
            CallContext: JSON.stringify(context),
          },
        }).then(function (result) {
          if (result) {
            result = result.data;
            $scope.DriverDetails = result;
          }
        });
      };


    $scope.init();
}]);