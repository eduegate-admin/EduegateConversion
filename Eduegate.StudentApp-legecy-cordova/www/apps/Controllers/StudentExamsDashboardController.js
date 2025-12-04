app.controller("StudentExamsDashboardController", ["$scope", "$http", "$state", "rootUrl", "$location", "$rootScope", "$stateParams", "GetContext", "$sce", function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce) {
  console.log("StudentExamsDashboardController loaded.");

  var dataService = rootUrl.SchoolServiceUrl;
  var appDataUrl = rootUrl.RootUrl;

  var context = GetContext.Context();
  $scope.ExamLists = [];

  $rootScope.ShowPreLoader = true;
  $rootScope.ShowLoader = true;

  $scope.CandidateID = $stateParams.candidateID;

  $scope.Init = function () {
    // $scope.ExamList($scope.StudentID);
    $scope.GetSettingValues();
    $scope.CandidateDetails($scope.CandidateID);
    $scope.GetDashboardCounts($scope.CandidateID);
    $scope.GetExamDetails($scope.CandidateID);
  };
    $scope.GetSettingValues = function () {
        $http({
            method: 'GET',
            url: appDataUrl + '/GetSettingValueByKey?settingKey=' + 'ONLINE_EXAM_STATUSID_COMPLETE',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {

            $scope.ExamCompleteStatusID = result;
        }).error(function () {
        });

        $http({
            method: 'GET',
            url: appDataUrl + '/GetSettingValueByKey?settingKey=' + 'ONLINE_EXAM_STATUSID_START',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {

            $scope.ExamStartedStatusID = result;
        }).error(function () {
        });

     
      
    }
    $scope.CandidateDetails = function (candidateID) {
    $scope.ExamLists = [];

    $http({
      method: 'GET',
      url: dataService + '/GetCandidateDetails?candidateID=' + candidateID,
      headers: {
        "Accept": "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        "CallContext": JSON.stringify(context)
      }
    }).success(function (result) {
      $scope.CandidateDetails = result;

      $rootScope.ShowLoader = false;
      $rootScope.ShowPreLoader = false;
    }).error(function (err) {
      $rootScope.ShowLoader = false;
    });

  };
  $scope.GetDashboardCounts = function (candidateID) {
    $scope.ExamLists = [];

    $http({
      method: 'GET',
      url: dataService + '/GetDashboardCounts?candidateID=' + candidateID,
      headers: {
        "Accept": "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        "CallContext": JSON.stringify(context)
      }
    }).success(function (result) {
      $scope.DashBoardDetails = result;

      $rootScope.ShowLoader = false;
      $rootScope.ShowPreLoader = false;
    }).error(function (err) {
      $rootScope.ShowLoader = false;
    });

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
   $scope.ExamListViewClick = function () {
        $state.go("examlist", {  candidateID: $scope.CandidateID });
    }

      $scope.UpcomingExamListViewClick = function () {
        $state.go("upcomingexamlist", {  candidateID: $scope.CandidateID });
    }

}]);