app.controller("UpcomingExamListController", [
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
    console.log("ExamListController loaded.");

    var dataService = rootUrl.SchoolServiceUrl;
    var appDataUrl = rootUrl.RootUrl;
    $scope.totalDuration = 0;
    var context = GetContext.Context();
    $scope.ExamLists = [];

    $rootScope.ShowPreLoader = true;
    $rootScope.ShowLoader = true;

    $scope.CandidateID = $stateParams.candidateID;
    

    $scope.Init = function () {
      $scope.GetExamDetails($scope.CandidateID);
    };
    $scope.GetExamDetails = function (candidateID) {
    $scope.ExamLists = [];

    $http({
      method: 'GET',
      url: dataService + '/GetExamDetails?candidateID=' + candidateID,
      headers: {
        "Accept": "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        "CallContext": JSON.stringify(context)
      }
    }).success(function (result) {
      $scope.UpcomingExams = result;

      $rootScope.ShowLoader = false;
      $rootScope.ShowPreLoader = false;
    }).error(function (err) {
      $rootScope.ShowLoader = false;
    });

  };
  },
]);
