app.controller("StudentLeaveController", ["$scope", "$http", "$state", "rootUrl", "$location", "$rootScope", "$stateParams", "GetContext", "$sce", "$timeout", function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
  console.log("StudentLeaveController loaded.");
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
  
    if (!leaveApplication) {
      $rootScope.ErrorMessage = "Fill all fields!";
      $rootScope.ShowLoader = false;
      return false;
    }
  
    if (!leaveApplication.Reason) {
      $rootScope.ErrorMessage = "Reason is required";
      $rootScope.ShowLoader = false;
      return false;
    }
  
    if (!leaveApplication.FromDateString || leaveApplication.FromDateString === "?") {
      $rootScope.ErrorMessage = "From date is required";
      $rootScope.ShowLoader = false;
      return false;
    }
  
    if (!leaveApplication.ToDateString || leaveApplication.ToDateString === "?") {
      $rootScope.ErrorMessage = "To date is required";
      $rootScope.ShowLoader = false;
      return false;
    }
  
    const fromDate = moment(leaveApplication.FromDateString, 'DD-MMM-YYYY');
    const toDate = moment(leaveApplication.ToDateString, 'DD-MMM-YYYY');
  
    if (!fromDate.isValid() || !toDate.isValid()) {
      $rootScope.ErrorMessage = "Invalid date format. Please use DD-MMM-YYYY.";
      $rootScope.ShowLoader = false;
      return false;
    }
  
    const duration = toDate.diff(fromDate, 'days') + 1;
  
    if (duration < 0) {
      $rootScope.ErrorMessage = 'The "To" date must be after the "From" date.';
      $rootScope.ShowLoader = false;
      return false;
    }
  
    if (duration > 3) {
      $rootScope.ErrorMessage = "The application could not be submitted. Please contact the class coordinators via email for further assistance.";
      $rootScope.ShowLoader = false;
      return false;
    }
  
    if (!leaveApplication.StudentID) {
      leaveApplication.StudentID = $scope.StudentID;
    }
  
    const fromDateString = fromDate.format("DD/MM/YYYY");
    const toDateString = toDate.format("DD/MM/YYYY");
  
    $http({
      method: 'POST',
      url: dataService + '/SubmitStudentLeaveApplication',
      data: {
        'StudentLeaveApplicationIID': leaveApplication.StudentLeaveApplicationIID || 0,
        'StudentID': leaveApplication.StudentID,
        'FromDateString': fromDateString,
        'ToDateString': toDateString,
        'Reason': leaveApplication.Reason,
        'LeaveStatusID': leaveApplication.LeaveStatusID || 1,
      },
      headers: {
        "Accept": "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        "CallContext": JSON.stringify(context)
      },
    }).success(function (result) {
      $rootScope.ShowLoader = false;
      if (result.operationResult == 2) {
        $rootScope.ErrorMessage = result.Message;
      } else if (result.operationResult == 1) {
        $rootScope.SuccessMessage = result.Message;
  
        $timeout(function () {
          $scope.$apply(function () {
            $scope.StudentLeaveApplication = null;
            $rootScope.SuccessMessage = "";
          });
        }, 1000);
      }
    }).error(function () {
      $rootScope.ErrorMessage = "Something went wrong, please try again later!";
      $rootScope.ShowLoader = false;
    });
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