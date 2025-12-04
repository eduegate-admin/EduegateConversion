app.controller("StudentDailyPickupRequestListController", ["$scope", "$http", "$state", "rootUrl", "$location", "$rootScope", "$stateParams", "GetContext", "$sce", "$timeout", "$q" ,  function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout , $q) {
  console.log("Student daily pickup request list controller loaded.");

  var dataService = rootUrl.SchoolServiceUrl;
  var parentPortal = rootUrl.ParentUrl;
   $scope.ContentService = rootUrl.ContentServiceUrl;
  var context = GetContext.Context();

  $scope.CurrentLoginID = context.LoginID;
  $scope.StudPickerIID = null;
  $scope.RegisteredPickupRequests = [];
  $scope.PassData = [];
  $scope.VisitorNumber = null;
  $scope.QID = $stateParams.QID;
  $scope.PassportNumber = $stateParams.PassportNumber;


  $scope.init = function () {
// this is the complete list of currently supported params you can pass to the plugin (all optional)

    $scope.SelectedData = null;
    $scope.ShareUrl = null;
    $rootScope.ShowLoader = true;
    $scope.ShowPreLoader = true;
    $scope.ShowShareButton = false;
    $scope.FillUserDetails().then(function () {
      // After FillUserDetails completes, call GetUnverifiedStudentsAssignedToVisitor
      return $scope.GetUnverifiedStudentsAssignedToVisitor();
  }).then(function () {
      // After GetUnverifiedStudentsAssignedToVisitor completes, call GetTodayStudentPickLogs
      $scope.GetTodayStudentPickLogs();
  }).catch(function (error) {
      console.error("An error occurred during initialization:", error);
  });

    // $scope.GetRegisteredPickupRequests();
  };



  $scope.FillUserDetails = function () {
    return $q(function (resolve, reject) {
        $http({
            method: "GET",
            url: dataService + "/GetVisitorDetailsByLoginID?loginID=" + context.LoginID,
            headers: {
                Accept: "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                CallContext: null,
            },
        }).then(function (response) {
            if (response.data) {
                $scope.UserDetails = response.data;
                resolve(); // Resolve the promise if data is found
            } else {
                $state.go("login", null, { reload: true });
                $rootScope.ShowButtonLoader = false;
                $scope.IsLoggedIn = false;
                reject("User not logged in"); // Reject if no user details are found
            }
        }).catch(function (err) {
            $rootScope.ErrorMessage = "Please try later";
            $scope.Message = "Please try later";
            $rootScope.ShowButtonLoader = false;
            $scope.IsLoggedIn = false;
            reject(err); // Reject the promise on error
        });
    });
};




  $scope.SelfScan = function () {
    $scope.BarCodeValue = null;
    if (device.platform.toLowerCase() == "android") {
      $timeout(function () {
        var settings = cordova.plugins.scanner.getDefaultSettings();
 
        cordova.plugins.scanner.startScanning(
          function (result) {
            var notifySound = "./sounds/beep.wav";
            var audio = new Audio(notifySound);
            audio.play();
 
            $scope.BarCodeValue = result;
 
            if ($scope.BarCodeValue) {
              $scope.$apply(function () {
                $scope.GetAndValidateScanedData(
                  $scope.CurrentLoginID,
                  $scope.BarCodeValue
                );
              });
            }
          },
          function (error) {
            alert("Scanning failed: " + error);
          },
 
          settings
        );
      });
    } else {
      // The below code is for ios only
      $timeout(function () {
        cordova.plugins.barcodeScanner.scan(
          function (result) {
            var notifySound = "./sounds/beep.wav";
            var audio = new Audio(notifySound);
            audio.play();
 
            $scope.BarCodeValue = result.text;
 
            if ($scope.BarCodeValue) {
              $scope.$apply(function () {
                $scope.GetAndValidateScanedData(
                  $scope.CurrentLoginID,
                  $scope.BarCodeValue
                );
              });
            }
          },
          function (error) {
            alert("Scanning failed: " + error);
          }
        );
      });
    }
   //$scope.GetAndValidateScanedData(context.LoginID,"P0100");
  };

    $scope.GetAndValidateScanedData = function (loginID, barCode) {

    $http({
      method: "GET",
      url: dataService + "/GetRegisteredPickupRequests?loginID=" +loginID +"&barCodeValue="+barCode,
      headers: {
        Accept: "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        CallContext: JSON.stringify(context),
      },
    }).success(function (result) {

      //temporary--
      $scope.BarcodeScannedData = result.filter(x => x.VisitorCode == $scope.UserDetails.VisitorNumber);

      if($scope.BarcodeScannedData.length == 0)
      {
        $rootScope.ShowToastMessage("There is no registration against this student!", 'error');
        return false;
      }

      if ($scope.BarcodeScannedData.length > 0) {
        $scope.PickersList = [];
        $scope.BarcodeScannedData.forEach(x => {
          const exists = $scope.PickersList.some(picker => picker.Value === x.PickUpBy);
          // If it doesn't exist, push the new item to PickersList
          if (!exists) {
            $scope.PickersList.push({
              "Key": x.StudentPickerIID,
              "Value": x.PickUpBy,
            });
          }
        });
      }

      if($scope.PickersList > 1){
        $('#myModal').modal('show');
        return false;
      }
      else{
        $scope.PassData = $scope.BarcodeScannedData[0];

        $scope.PassData.StudentsList.push({
          StudentID: $scope.PassData.StudentID,
          StudentPickerIID: $scope.PassData.StudentPickerIID
        });

        $scope.PassData.LogStatus = true;
        $scope.PassData.Remarks = "self scan pickuped by "+ $scope.PassData.PickUpBy;
        $scope.PassData.PickDate = new Date();

        $scope.SelfScanAndSubmitLog($scope.PassData);
      }
      $rootScope.ShowLoader = false;
      $scope.ShowPreLoader = false;

    }).error(function () {
      $rootScope.ShowLoader = false;
      $scope.ShowPreLoader = false;
    });

  };

  $scope.ModalSaveChanges = function () {
    const radioButtons = document.getElementsByName("inlineRadioOptions");

    for (let i = 0; i < radioButtons.length; i++) {
      if (radioButtons[i].checked) {
        const selectedValue = radioButtons[i].value;
        $scope.StudPickerIID = selectedValue;
        break;
      }
    }
    $('#myModal').modal('hide');
    if($scope.StudPickerIID){
      $scope.PassData = $scope.BarcodeScannedData.filter(f => f.StudentPickerIID == $scope.StudPickerIID);

      $scope.PassData[0].StudentsList.push({
        StudentID: $scope.PassData[0].StudentID,
        StudentPickerIID: $scope.PassData[0].StudentPickerIID,
        PickDate: new Date()
      });

      $scope.PassData[0].LogStatus = true;
      $scope.PassData[0].Remarks = "pickedup self scan by "+ $scope.PassData[0].PickUpBy;
      $scope.PassData[0].PickDate = new Date();
      $scope.SelfScanAndSubmitLog($scope.PassData[0]);
    }
    else{
      return false;
    }
  }

  $scope.SelfScanAndSubmitLog = function (datas) {

    $http({
      method: 'POST',
      url: dataService + "/SubmitStudentPickLogs",
      data: datas,
      headers: {
        Accept: "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        CallContext: JSON.stringify(context),
      },
    }).success(function (result) {

      if (result.operationResult == 1) {

        $rootScope.SuccessMessage = result.Message;
        $(".success-msg")
          .addClass("showMsg")
          .delay(2000)
          .queue(function () {
            $(this).removeClass("showMsg");
            $(this).dequeue();
          });

        $rootScope.ShowLoader = false;

        $timeout(function () {
          $scope.$apply(function () {

          });
        });

      } else if (result.operationResult == 2) {
        $rootScope.ErrorMessage = "Something went wrong, try again later!";
        $(".error-msg")
          .addClass("showMsg")
          .delay(2000)
          .queue(function () {
            $(this).removeClass("showMsg");
            $(this).dequeue();
          });
        $rootScope.ShowLoader = false;

        return false;
      }

      $rootScope.ShowLoader = false;

    }).error(function () {
      $rootScope.ErrorMessage = "Something went wrong, try again later!";
      $(".error-msg")
        .addClass("showMsg")
        .delay(2000)
        .queue(function () {
          $(this).removeClass("showMsg");
          $(this).dequeue();
        });
      return false;
    });
    $scope.GetTodayStudentPickLogs();
    location.reload();
  };

  $scope.GetTodayStudentPickLogs = function() {

    $http({
      method: "GET",
      url: dataService + "/GetTodayStudentPickLogs?",
      headers: {
        Accept: "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        CallContext: JSON.stringify(context),
      },
    }).success(function (result) {
      $scope.StudentPickLogs = result;

      if ($scope.StudentPickLogs.length <= 0) {
        $scope.ShowResultMsg = true;
      }
      $scope.ProceedCount = $scope.StudentPickLogs.filter(x => x.LogStatus == true).length;
      $scope.CancelCount = $scope.StudentPickLogs.filter(x => x.LogStatus == false).length;

    });
  }

  $scope.GetUnverifiedStudentsAssignedToVisitor = function() {
    $scope.visitorCode = $scope.UserDetails.VisitorNumber;
    $http({
      method: "GET",
      url: dataService + "/GetUnverifiedStudentsAssignedToVisitor?visitorCode=" + $scope.visitorCode,
      headers: {
        Accept: "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        CallContext: JSON.stringify(context),
      },
    }).success(function (result) {

      $scope.UnverifiedStudentsAssignedToVisitor = result;

    });
  }




  Fancybox.bind("[data-fancybox]", {
    // Your custom options
  });

}]);