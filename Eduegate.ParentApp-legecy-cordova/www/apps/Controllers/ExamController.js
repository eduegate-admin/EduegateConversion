app.controller("ExamController", ["$scope", "$http", "$state", "rootUrl", "$location", "$rootScope", "$stateParams", "GetContext", "$sce", function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce) {
  console.log("Exam Controller loaded.");

  var dataService = rootUrl.SchoolServiceUrl;
  var context = GetContext.Context();
  $scope.ExamLists = [];

  $rootScope.ShowPreLoader = true;
  $rootScope.ShowLoader = true;

  $scope.StudentID = $stateParams.studentID;

  $scope.Init = function () {
    $scope.ExamList($scope.StudentID);
  };

  $scope.ExamList = function (studentID) {
    $scope.ExamLists = [];

    $http({
      method: 'GET',
      url: dataService + '/GetExamLists?studentID=' + studentID,
      headers: {
        "Accept": "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        "CallContext": JSON.stringify(context)
      }
    }).success(function (result) {
      $scope.ExamLists = result;

      $rootScope.ShowLoader = false;
      $rootScope.ShowPreLoader = false;
    }).error(function (err) {
      $rootScope.ShowLoader = false;
    });

  };

}]);