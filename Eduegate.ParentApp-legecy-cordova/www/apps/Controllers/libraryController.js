app.controller("libraryController", ["$scope", "$http", "$state", "rootUrl", "$location", "$rootScope", "$stateParams", "GetContext", "$sce", "$timeout", function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
  console.log("libraryController loaded.");
  var dataService = rootUrl.SchoolServiceUrl;
  var context = GetContext.Context();

  $scope.StudentLeaveApplication = null;
  $rootScope.SuccessMessage = "";
  $rootScope.ErrorMessage = "";

  $scope.StudentID = $stateParams.studentID;


  $rootScope.ShowLoader = true;

  $scope.init = function () {
    $scope.GetLibraryTransactions('Return', 'ReturnTransactions');
    $scope.GetLibraryTransactions('Issue', 'IssueTransactions');
    $rootScope.ShowLoader = false;
  };

$scope.GetLibraryTransactions = function (filter, targetVariable) {
    $rootScope.ShowLoader = true;
    $http({
        method: 'GET',
        url: dataService + "/GetLibraryTransactions?filter=" + filter,
        headers: {
            Accept: "application/json;charset=UTF-8",
            "Content-type": "application/json; charset=utf-8",
            CallContext: JSON.stringify(context),
        },
    }).success(function (result) {
        $scope[targetVariable] = result; // Dynamically assign the result to the specified variable
        $rootScope.ShowLoader = false;
    }).error(function () {
        $rootScope.ShowLoader = false;
        return false;
    });
};


 $scope.init();
}]);