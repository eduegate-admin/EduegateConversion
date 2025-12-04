app.controller("StudentLeaveStatusController", ["$scope", "$http", "$state", "rootUrl", "$location", "$rootScope", "$stateParams", "GetContext", "$sce", "$timeout", function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
  console.log("StudentLeaveController loaded.");
  var dataService = rootUrl.SchoolServiceUrl;
  var context = GetContext.Context();

  $scope.StudentLeaveApplications = [];
  $rootScope.ShowLoader = true;

  $scope.StudentID = $stateParams.studentID;

  $rootScope.StudentLeaveApplicationIID = null;

  $scope.init = function () {
      $scope.GetLeaveList();
  };

  $scope.GetLeaveList = function () {
    $scope.StudentLeaveApplications = [];

    $http({
      method: "GET",
      url:
        dataService +
        "/GetLeaveApplication?studentID=" +
        $scope.StudentID,
      headers: {
        Accept: "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        CallContext: JSON.stringify(context),
      },
    }).success(function (result) {

      $scope.StudentLeaveApplications = result;

      $rootScope.ShowLoader = false;
      
    }).error(function () {
      $rootScope.ShowLoader = false;
    });

  };

  $scope.EditLeaveRequestClick = function (leaveData) {
    if (leaveData != undefined || leaveData != null) {
      $rootScope.StudentLeaveApplicationIID = leaveData.StudentLeaveApplicationIID;
      $state.go("studentleave", { leaveApplicationID: leaveData.StudentLeaveApplicationIID });
    }
    else {
      return false;
    }
  };

  $scope.DeleteLeaveRequestClick = function (leaveData) {
    if (leaveData != undefined || leaveData != null) {
      $scope.StudentLeaveApplications = [];
      $rootScope.ShowLoader = true;
      $http({
        method: 'GET',
        url: dataService + "/DeleteStudentLeaveApplicationByID?leaveApplicationID=" + leaveData.StudentLeaveApplicationIID,
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).success(function (result) {

        $timeout(function () {
          $scope.$apply(function () {
            $scope.GetLeaveList();
          });
        });
      }).error(function () {
        $scope.GetLeaveList();
        return false;
      });
    }
    else {
      return false;
    }
  };

  $scope.Applyleave = function (studentID) {
    $state.go("studentleave", { studentID: studentID });
  };

  // $scope.init();

}]);