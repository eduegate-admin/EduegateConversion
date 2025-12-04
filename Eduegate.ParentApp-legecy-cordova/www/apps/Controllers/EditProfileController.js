app.controller("EditProfileController", ["$scope", "$http", "$state", "rootUrl", "$location", "$rootScope", "$stateParams", "GetContext", "$sce", "$timeout", function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
  console.log("Edit Profile Controller loaded.");
  var dataService = rootUrl.SchoolServiceUrl;
  var context = GetContext.Context();

  $scope.StudentLeaveApplication = null;
  $rootScope.SuccessMessage = "";
  $rootScope.ErrorMessage = "";

  $scope.StudentID = $stateParams.studentID;

  $scope.StudentLeaveApplicationIID = $rootScope.StudentLeaveApplicationIID;

  $rootScope.ShowLoader = true;

  $scope.init = function () {

    $scope.GetStudentLeaveApplication();
    $rootScope.ShowLoader = false;
  };

  $scope.GetStudentLeaveApplication = function () {
    if ($scope.StudentLeaveApplicationIID != undefined || $scope.StudentLeaveApplicationIID != null) {
      $rootScope.ShowLoader = true;
      $http({
        method: 'GET',
        url: dataService + "/GetStudentLeaveApplicationByID?leaveApplicationID=" + $scope.StudentLeaveApplicationIID,
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).success(function (result) {
        $scope.StudentLeaveApplication = result;

        $scope.StudentLeaveApplication.FromDateString = new Date(moment($scope.StudentLeaveApplication.FromDate));
        $scope.StudentLeaveApplication.ToDateString = new Date(moment($scope.StudentLeaveApplication.ToDate));

        $rootScope.ShowLoader = false;

      }).error(function () {
        $rootScope.ShowLoader = false;
        return false;
      });
    }
    else {
      return false;
    }
  };

  $scope.SubmitStudentLeaveApplication = function () {
    $rootScope.ShowLoader = true;

    $rootScope.SuccessMessage = "";
    $rootScope.ErrorMessage = "";

    var leaveApplication = $scope.StudentLeaveApplication;

    if (leaveApplication != null) {

      if (leaveApplication.Reason == undefined || leaveApplication.Reason == null) {
        $rootScope.ErrorMessage = "Reason is required";
        $rootScope.ShowLoader = false;
        return false;
      }
      else if (leaveApplication.FromDateString == undefined || leaveApplication.FromDateString == null) {
        $rootScope.ErrorMessage = "From date is required";
        $rootScope.ShowLoader = false;
        return false;
      }
      else if (leaveApplication.ToDateString == undefined || leaveApplication.ToDateString == null) {
        $rootScope.ErrorMessage = "To date is required";
        $rootScope.ShowLoader = false;
        return false;
      }

      var fromDateString = moment(leaveApplication.FromDateString).format("DD/MM/YYYY");

      var toDateString = moment(leaveApplication.ToDateString).format("DD/MM/YYYY");

      if (leaveApplication.StudentID == undefined || leaveApplication.StudentID == null) {
        leaveApplication.StudentID = $scope.StudentID;
      }

      $http({
        method: 'POST',
        url: dataService + '/SubmitStudentLeaveApplication',
        data: {
          'StudentLeaveApplicationIID': leaveApplication.StudentLeaveApplicationIID != undefined || leaveApplication.StudentLeaveApplicationIID != null ? leaveApplication.StudentLeaveApplicationIID : 0,
          'StudentID': leaveApplication.StudentID,
          'FromDateString': fromDateString,
          'ToDateString': toDateString,
          'Reason': leaveApplication.Reason,
          'LeaveStatusID': leaveApplication.LeaveStatusID != undefined || leaveApplication.LeaveStatusID != null ? leaveApplication.LeaveStatusID : 1,
        },
        headers: {
          "Accept": "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          "CallContext": JSON.stringify(context)
        },
      }).success(function (result) {
        if (result.operationResult == 2) {
          $rootScope.ErrorMessage = result.Message;
          $rootScope.ShowLoader = false;
        } else if (result.operationResult == 1) {
          $rootScope.SuccessMessage = result.Message;
          $rootScope.ShowLoader = false;

          $timeout(function () {
            $scope.$apply(function () {
              $scope.StudentLeaveApplication = null;
              $rootScope.SuccessMessage = "";
            });
          }, 1000);
        }
      }).error(function (err) {
        $rootScope.ErrorMessage = "Something went wrong, please try again later!";
        $rootScope.ShowLoader = false;
      });
    }
    else {
      $rootScope.ErrorMessage = "Fill all fields !";
      $rootScope.ShowLoader = false;
      return false;
    }

  };

  $scope.DataChange = function () {
    $rootScope.ErrorMessage = "";
    $rootScope.SuccessMessage = "";
  };

  $scope.ClearClick = function () {
    $rootScope.ErrorMessage = "";
    $rootScope.SuccessMessage = "";
    $scope.StudentLeaveApplication = null;
  };

  // $scope.init();

}]);