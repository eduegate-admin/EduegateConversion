app.controller("ExamListController", [
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
        $scope.CandidateOnlineExams = [];
        $scope.ExamCompleteStatusID = null;
        $scope.ExamStartedStatusID = null;


    $scope.Init = function () {
      // $scope.ExamList($scope.StudentID);
      $scope.GetSettingValues();
      $scope.GetScheduledExams($scope.CandidateID);
    };
    $scope.GetSettingValues = function () {
      $http({
        method: "GET",
        url:
          appDataUrl +
          "/GetSettingValueByKey?settingKey=" +
          "ONLINE_EXAM_STATUSID_COMPLETE",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      })
        .success(function (result) {
          $scope.ExamCompleteStatusID = result;
        })
        .error(function () {});

      $http({
        method: "GET",
        url:
          appDataUrl +
          "/GetSettingValueByKey?settingKey=" +
          "ONLINE_EXAM_STATUSID_START",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      })
        .success(function (result) {
          $scope.ExamStartedStatusID = result;
        })
        .error(function () {});
    };

    $scope.GetScheduledExams = function (candidateID) {
      $scope.ExamLists = [];

      $http({
        method: "GET",
        url: dataService + "/GetScheduledExams?candidateID=" + candidateID,
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      })
        .success(function (result) {
          $scope.CandidateOnlineExams = result;

          $rootScope.ShowLoader = false;
          $rootScope.ShowPreLoader = false;
        })
        .error(function (err) {
          $rootScope.ShowLoader = false;
        });
    };

    $scope.ExamList = function (studentID) {
      $scope.ExamLists = [];

      $http({
        method: "GET",
        url: dataService + "/GetExamLists?studentID=" + studentID,
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      })
        .success(function (result) {
          $scope.ExamLists = result;

          $rootScope.ShowLoader = false;
          $rootScope.ShowPreLoader = false;
        })
        .error(function (err) {
          $rootScope.ShowLoader = false;
        });
    };

    $scope.StartExam = function (examData) {
      $scope.ExamLists = [];

      $http({
        method: "GET",
        url:
          dataService +
          "/CheckExamQuestionAvailability?candidateID=" +
          examData.CandidateID +
          "&examID" +
          examData.OnlineExamID +
          "&candidateOnlinExamMapID" +
          examData.CandidateOnlinExamMapIID,
        params: {
          candidateID: examData.CandidateID,
          examID: examData.OnlineExamID,
          candidateOnlinExamMapID: examData.CandidateOnlinExamMapIID,
        },
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      })
        .success(function (result) {
          $scope.totalDuration = examData.Duration + examData.AdditionalTime;
          $scope.SaveExamTimes(
            examData.OnlineExamID,
            examData.CandidateOnlinExamMapIID,
            $scope.totalDuration
          );
        })
        .error(function (err) {
          $rootScope.ShowLoader = false;
        });
    };
    $scope.SaveExamTimes = function (
      onlineExamID,
      candidateOnlinExamMapID,
      totalDuration
    ) {

      $http({
        method: "GET",
        url: dataService + "/InsertExamMapStartEndTime",
        params: {
          candidateOnlinExamMapID: candidateOnlinExamMapID,
          durationInMinutes: totalDuration,
          
        },
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      })
        .success(function (result) {
          $state.go("questions", {
            candidateID:   $scope.CandidateID,
            examID: onlineExamID,
            candidateOnlinExamMapID: candidateOnlinExamMapID,
          });
        })
        .error(function (err) {
          $rootScope.ShowLoader = false;
        });
    };
  },
]);
