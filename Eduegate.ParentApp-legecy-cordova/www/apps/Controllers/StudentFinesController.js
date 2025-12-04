app.controller("StudentFinesController", ["$scope", "$http", "$state", "rootUrl", "$location", "$rootScope", "$stateParams", "GetContext", "$sce", "$timeout", function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
  console.log("Student Fines Controller loaded.");

  var dataService = rootUrl.SchoolServiceUrl;
  var context = GetContext.Context();

  $rootScope.ShowLoader = true;
  $rootScope.ShowPreLoader = true;

  $scope.ContentService = rootUrl.ContentServiceUrl;

  $scope.StudentID = $stateParams.studentID;

  $scope.Init = function () {

    $scope.FillFines();
  };

  $scope.FillFines = function (studentId) {
    $scope.FeeFines = [];

    $http({
      method: 'GET',
      url: dataService + '/FillFineDue?studentID=' + $scope.StudentID,
      headers: {
        "Accept": "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        "CallContext": JSON.stringify(context)
      }
    }).success(function (result) {
      $scope.FeeFines = result;

      $rootScope.ShowLoader = false;
      $rootScope.ShowPreLoader = false;
    }).error(function (err) {
      $rootScope.ShowLoader = false;
    });
  };

}]);