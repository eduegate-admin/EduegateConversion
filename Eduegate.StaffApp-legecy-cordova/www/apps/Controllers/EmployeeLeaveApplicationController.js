app.controller('EmployeeLeaveApplicationController', ['$scope', '$http', '$state', 'loggedIn', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', "$timeout",function ($scope, $http, $state, loggedIn, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
    console.log('EmployeeLeaveApplicationController loaded.');
    $scope.PageName = "Employee Leave Request";

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();
    $rootScope.EmployeeID = context.EmployeeID;
    var loginID = context.LoginID;

    $scope.StaffLeaveApplication = null;

    // $rootScope.ShowLoader = true;

    $scope.init = function() {
        $scope.GetLeaveTypes();
    };

    // $scope.DateChange = function() {
    //   var FromDateStringblock = moment($scope.StaffLeaveApplication.FromDateString).format("YYYY-MM-DD");
    //   document.getElementsByName("ToDateString")[0].setAttribute('min', FromDateStringblock);
    // };

    $scope.isSubmitting = false;

    $scope.SubmitStaffLeaveApplication = function () {
        if ($scope.isSubmitting) return;
    
        $scope.isSubmitting = true;
        $rootScope.SuccessMessage = "";
        $rootScope.ErrorMessage = "";
        $rootScope.ToastMessage = "";
    
        const leaveApplication = $scope.StaffLeaveApplication;
    
        // Basic client-side validations
        if (!leaveApplication) {
            $rootScope.ToastMessage = "Fill all fields!";
        } else if (!leaveApplication.LeaveTypeID) {
            $rootScope.ToastMessage = "Leave Type is required";
        } else if (!leaveApplication.Reason) {
            $rootScope.ToastMessage = "Reason is required";
        } else if (!leaveApplication.FromDateString) {
            $rootScope.ToastMessage = "From date is required";
        } else if (!leaveApplication.ToDateString) {
            $rootScope.ToastMessage = "To date is required";
        }
    
        if ($rootScope.ToastMessage) {
            $('.toast').toast('show');
            $scope.isSubmitting = false;
            return;
        }
    
        // Format and assign values
        const fromDate = moment(leaveApplication.FromDateString).format("YYYY-MM-DD");
        const toDate = moment(leaveApplication.ToDateString).format("YYYY-MM-DD");
        const fromDateString = moment(leaveApplication.FromDateString).format("DD/MM/YYYY");
        const toDateString = moment(leaveApplication.ToDateString).format("DD/MM/YYYY");
    
        leaveApplication.EmployeeID = leaveApplication.EmployeeID || $scope.EmployeeID || $rootScope.EmployeeID;
    
        // Check date conflict
        $http({
            method: 'POST',
            url: dataService + '/CheckLeaveDateConflict',
            data: {
                'EmployeeID': leaveApplication.EmployeeID,
                'LeaveApplicationIID': leaveApplication.LeaveApplicationIID || 0,
                'FromDate': fromDate,
                'ToDate': toDate
            },
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).then(function (checkResponse) {
            if (checkResponse.data) {
                $rootScope.ToastMessage = "You already have an approved or rejected leave for the selected date range.";
                $('.toast').toast('show');
                return;
            }
    
            // Proceed with application
            return $http({
                method: 'POST',
                url: dataService + '/SubmitStaffLeaveApplication',
                data: {
                    'LeaveApplicationIID': leaveApplication.LeaveApplicationIID || 0,
                    'EmployeeID': leaveApplication.EmployeeID,
                    'LeaveTypeID': leaveApplication.LeaveTypeID.Key || leaveApplication.LeaveTypeID,
                    'FromDateString': fromDateString,
                    'ToDateString': toDateString,
                    'OtherReason': leaveApplication.Reason,
                    'LeaveStatusID': leaveApplication.LeaveStatusID || 1
                },
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            });
    
        }).then(function (response) {
            if (!response) return;
    
            const result = response.data;
            $rootScope.ToastMessage = result.Message || "Leave application submitted!";
            $('.toast').toast('show');
    
            if (result.operationResult == 1) {
                $timeout(function () {
                    $scope.StaffLeaveApplication = null;
                    $rootScope.SuccessMessage = "";
                }, 1000);
            }
        }).catch(function () {
            $rootScope.ErrorMessage = "Something went wrong, please try again later!";
        }).finally(function () {
            $scope.isSubmitting = false;
        });
    };
    
    
      $scope.GetLeaveTypes = function () {
        $http({
            method: 'GET',
            url: dataService + '/GetLeaveTypes',
            data: $scope.user,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            $scope.LeaveTypes = result;

            $rootScope.ShowLoader = false;
        }).error(function () {
            $rootScope.ShowLoader = false;
        });
    };

    jQuery(function(){
      jQuery('#FromDateString').datetimepicker({
        format:'Y/m/d',
       onShow:function( ct ){
        this.setOptions({
         maxDate:jQuery('#ToDateString').val()?jQuery('#ToDateString').val():false
        })
       },
       timepicker:false
      });
      jQuery('#ToDateString').datetimepicker({
        format:'Y/m/d',
       onShow:function( ct ){
        this.setOptions({
         minDate:jQuery('#FromDateString').val()?jQuery('#FromDateString').val():false
        })
       },
       timepicker:false
      });
     });
}]);