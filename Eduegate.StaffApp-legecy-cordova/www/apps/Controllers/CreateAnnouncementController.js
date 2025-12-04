app.controller('CreateAnnouncementController', ['$scope', '$http', '$state', 'loggedIn', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', "$timeout",function ($scope, $http, $state, loggedIn, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
    console.log('CreateAnnouncementController loaded.');
    $scope.PageName = "Create Announcement";

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

    $scope.SubmitStaffLeaveApplication = function () {
        // $rootScope.ShowLoader = true;

        $rootScope.SuccessMessage = "";
        $rootScope.ErrorMessage = "";

        var leaveApplication = $scope.StaffLeaveApplication;

        if (leaveApplication != null) {

          if (leaveApplication.LeaveTypeID == undefined || leaveApplication.LeaveTypeID == null) {
            $rootScope.ToastMessage = "Leave Type is required";
            $rootScope.ShowLoader = false;
            $('.toast').toast('show');
            return false;
          }

          else if (leaveApplication.Reason == undefined || leaveApplication.Reason == null) {
            $rootScope.ToastMessage = "Reason is required";
            $rootScope.ShowLoader = false;
            $('.toast').toast('show');
            return false;
          }
          else if (leaveApplication.FromDateString == undefined || leaveApplication.FromDateString == null) {
            $rootScope.ToastMessage = "From date is required";
            $('.toast').toast('show');
            $rootScope.ShowLoader = false;

            return false;
          }
          else if (leaveApplication.ToDateString == undefined || leaveApplication.ToDateString == null) {
            $rootScope.ToastMessage = "To date is required";
            $rootScope.ShowLoader = false;
            $('.toast').toast('show');
            return false;
          }

          var fromDateString = moment(leaveApplication.FromDateString).format("DD/MM/YYYY");

          var toDateString = moment(leaveApplication.ToDateString).format("DD/MM/YYYY");

          if (leaveApplication.EmployeeID == undefined || leaveApplication.EmployeeID == null) {
            leaveApplication.EmployeeID = $scope.EmployeeID;
          }

          $http({
            method: 'POST',
            url: dataService + '/SubmitStaffLeaveApplication',
            data: {

              'LeaveApplicationIID': leaveApplication.LeaveApplicationIID != undefined || leaveApplication.LeaveApplicationIID != null ? leaveApplication.LeaveApplicationIID : 0,
              'EmployeeID': leaveApplication.EmployeeID,
              'LeaveTypeID': leaveApplication.LeaveTypeID.Key,
              'FromDateString':fromDateString,
              'ToDateString': toDateString,
              'OtherReason': leaveApplication.Reason,
              'LeaveStatusID': leaveApplication.LeaveStatusID != undefined || leaveApplication.LeaveStatusID != null ? leaveApplication.LeaveStatusID : 1,
            },
            headers: {
              "Accept": "application/json;charset=UTF-8",
              "Content-type": "application/json; charset=utf-8",
              "CallContext": JSON.stringify(context)
            },
          }).success(function (result) {
            if (result.operationResult == 2) {
              $rootScope.ToastMessage = result.Message;
              $('.toast').toast('show');
              $rootScope.ShowLoader = false;
            } else if (result.operationResult == 1) {
              $rootScope.ToastMessage = result.Message;
              $('.toast').toast('show');
              $rootScope.ShowLoader = false;

              $timeout(function () {
                $scope.$apply(function () {
                  $scope.StaffLeaveApplication = null;
                  console.log(leaveApplication)
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
          $rootScope.ToastMessage = "Fill all fields !";
          $('.toast').toast('show');
          $rootScope.ShowLoader = false;
          return false;
        }

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

    $scope.init();
}]);