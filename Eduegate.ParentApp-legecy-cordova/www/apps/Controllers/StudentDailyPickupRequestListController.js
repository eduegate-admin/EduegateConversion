app.controller("StudentDailyPickupRequestListController", ["$scope", "$http", "$state", "rootUrl", "$location", "$rootScope", "$stateParams", "GetContext", "$sce", "$timeout", function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
  console.log("Student daily pickup request list controller loaded.");

  var dataService = rootUrl.SchoolServiceUrl;
  //var parentPortal = rootUrl.ParentUrl;
  $scope.ContentService = rootUrl.ContentServiceUrl;
  var context = GetContext.Context();

  $scope.CurrentLoginID = context.LoginID;
  $scope.StudPickerIID = null;
  $scope.RegisteredPickupRequests = [];
  $scope.PassData = [];

  $scope.init = function () {
    // this is the complete list of currently supported params you can pass to the plugin (all optional)

    $scope.SelectedData = null;
    $scope.ShareUrl = null;
    $rootScope.ShowLoader = true;
    $scope.ShowPreLoader = true;
    $scope.ShowShareButton = false;
    $scope.GetRegisteredPickupRequests();
    $scope.GetTodayStudentPickLogs();
  };

  $scope.GetRegisteredPickupRequests = function () {
    $scope.RegisteredPickupRequests = [];

    var loginID = $scope.CurrentLoginID;
    var barCode = null;

    $http({
      method: "GET",
      url: dataService + "/GetRegisteredPickupRequests?loginID=" + loginID + "&barCodeValue=" + barCode,
      headers: {
        Accept: "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        CallContext: JSON.stringify(context),
      },
    }).success(function (result) {

      $scope.RegisteredPickupRequests = result;

      $scope.RegisteredPickupRequests.forEach(x => {
        if (x.IsActive == true) {
          x.ButtonName = "Cancel";
        }
        else {
          x.ButtonName = "Active";
        }

        if (x.Student.Key == null) {
          x.Student.Value = "All";
        }
      });

      $rootScope.ShowLoader = false;
      $scope.ShowPreLoader = false;

    }).error(function () {
      $rootScope.ShowLoader = false;
      $scope.ShowPreLoader = false;
    });

  };

  $scope.Share = function (selectedData) {

    var Message = "Student Pickup QR code";
    var student = encodeURIComponent(selectedData.Student.Value.trim());
    var className = encodeURIComponent(selectedData.ClassSection.trim());
    const sharedDate = moment(new Date()).format('YYYY-MM-DDTHH:mm:ss');

    var url = $rootScope.ParentPortalUrl + "External/QRCode?iid=" + selectedData.StudentPickerStudentMapIID + "&qr=" + selectedData.QRCODE + "&time=" + sharedDate + "&student=" + student + "&className=" + className;
    ShareUrl = url;

    window.plugins.socialsharing.share(Message, 'View QRCode', null, ShareUrl);

    //UpdateQRSharedDateTime(selectedData,sharedDate);
  }

  $scope.Copy = function (selectedData) {

    var student = encodeURIComponent(selectedData.Student.Value.trim());
    var className = encodeURIComponent(selectedData.ClassSection.trim());
    const sharedDate = moment(new Date()).format('YYYY-MM-DDTHH:mm:ss');

    var url = $rootScope.ParentPortalUrl + "External/QRCode?iid=" + selectedData.StudentPickerStudentMapIID + "&qr=" + selectedData.QRCODE + "&time=" + sharedDate + "&student=" + student + "&className=" + className;
    ShareUrl = url;

    cordova.plugins.clipboard.copy(ShareUrl);

    $rootScope.SuccessMessage = "Copied to Clipboard!";

    const toastLiveExample = document.getElementById('liveToast')
    const toast = new bootstrap.Toast(toastLiveExample , {
        delay:2000,
    })

    toast.show()
  }

  $scope.CancelorActivePickupRegistration = function (regData) {
    $scope.ShowShareButton = false;
    let qrcodeContainer = document.getElementById("qrcode");
    qrcodeContainer.innerHTML = "";

    $rootScope.ShowLoader = true;

    $http({
      method: 'POST',
      url: dataService + "/CancelorActiveStudentPickupRegistration?studentPickerStudentMapIID=" + regData.StudentPickerStudentMapIID,
      headers: {
        Accept: "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        CallContext: JSON.stringify(context),
      },
    }).success(function (result) {

      if (result.operationResult == 1) {

        $rootScope.ShowToastMessage(result.Message, 'success');

        $timeout(function () {
          $scope.$apply(function () {
            $scope.GetRegisteredPickupRequests();
          });
        });

      } else if (result.operationResult == 2) {

        $rootScope.ShowToastMessage(result.Message, 'error');

      }

      $rootScope.ShowLoader = false;

    }).error(function () {
      $rootScope.ShowToastMessage("Something went wrong, try again later!", 'error');
      $rootScope.ShowLoader = false;
      return false;
    });
  };

  $scope.RegisterDailyPickup = function () {
    $state.go("studentdailypickuprequest");
  };

  $scope.generateQRCode = function (data) {
    $scope.ShareUrl = null;

    if (data.QRCODE && data.IsActive == true) {
      let qrcodeContainer = document.getElementById("qrcode");
      qrcodeContainer.innerHTML = "";
      new QRCode(qrcodeContainer, data.QRCODE);
      $scope.ShowShareButton = true;
      $scope.SelectedData = data;
    }
    else {
      let qrcodeContainer = document.getElementById("qrcode");
      qrcodeContainer.innerHTML = "";
      $scope.ShowShareButton = false;
      return false;
    }
  }

  Fancybox.bind("[data-fancybox]", {
    // Your custom options
  });

  $scope.SelfScan = function () {
    $scope.BarCodeValue = null;

    if (device.platform.toLowerCase() == "android") {
      // The below code is for android only
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
    }
    else {
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
    // $scope.GetAndValidateScanedData($scope.CurrentLoginID,"P0079");
  };

  $scope.GetAndValidateScanedData = function (loginID, barCode) {

    $http({
      method: "GET",
      url: dataService + "/GetRegisteredPickupRequests?loginID=" + loginID + "&barCodeValue=" + barCode,
      headers: {
        Accept: "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        CallContext: JSON.stringify(context),
      },
    }).success(function (result) {

      $scope.BarcodeScannedData = result.filter(x => !x.VisitorCode);

      if ($scope.BarcodeScannedData.length == 0) {
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

      if ($scope.PickersList.length > 1) {
        $('#myModal').modal('show');
        return false;
      }
      else {
        $scope.PassData = $scope.BarcodeScannedData[0];

        $scope.PassData.StudentsList.push({
          StudentID: $scope.PassData.StudentID,
          StudentPickerIID: $scope.PassData.StudentPickerIID
        });

        $scope.PassData.LogStatus = true;
        $scope.PassData.Remarks = "self scan pickuped by " + $scope.PassData.PickUpBy;
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
    if ($scope.StudPickerIID) {
      $scope.PassData = $scope.BarcodeScannedData.filter(f => f.StudentPickerIID == $scope.StudPickerIID);

      $scope.PassData[0].StudentsList.push({
        StudentID: $scope.PassData[0].StudentID,
        StudentPickerIID: $scope.PassData[0].StudentPickerIID
      });

      $scope.PassData[0].LogStatus = true;
      $scope.PassData[0].Remarks = "self scan pickuped by " + $scope.PassData[0].PickUpBy;
      $scope.PassData[0].PickDate = new Date();
      $scope.SelfScanAndSubmitLog($scope.PassData[0]);
    }
    else {
      return false;
    }
  }

  $scope.SelfScanAndSubmitLog = function (datas) {
    $rootScope.ShowLoader = true;
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
            $scope.GetTodayStudentPickLogs();
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
  };

  $scope.GetTodayStudentPickLogs = function () {
    $scope.StudentPickLogs = null;

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

      // if ($scope.StudentPickLogs.length > 0) {

      //   $scope.InitiateTimeChecking($scope.StudentPickLogs);
      // }

    });
  }

  $scope.InitiateTimeChecking = function (todayPickLogs) {

    var activatedPickList = todayPickLogs.filter(x => x.LogStatus == true);
    if (activatedPickList.length > 0) {
      var firstActivatedPickData = activatedPickList[0];

      startTimerChecking(firstActivatedPickData);
    }
  };

  function startTimerChecking(activatedPickData) {

    var startTime = new Date();
    var currentTimeString = startTime.toLocaleTimeString();

    var endTime = new Date(activatedPickData.PickDateEndTime.match(/\d+/)[0] * 1);
    var endTimeString = endTime.toLocaleTimeString();

    if (endTimeString < currentTimeString) {
      $scope.UpdatePickDataStatus(activatedPickData);
      return true;
    }
    else {
      $scope.CheckTimes = setTimeout(function () {
        startTimerChecking(activatedPickData);
      }, 1 * 1000);
    }
  };
  //To get exam end time(countdown time) end

  $scope.UpdatePickDataStatus = function (pickLog) {

    $http({
      method: "POST",
      url: dataService + "/UpdateStudentPickLogStatus?picklogID=" + pickLog.StudentPickLogIID,
      headers: {
        Accept: "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        CallContext: null,
      },
    }).success(function (result) {
      if (result) {
        $timeout(function () {
          $scope.$apply(function () {
            $scope.GetTodayStudentPickLogs();
          });

          resolve();
        }, 1000);
      }
    }).error(function (err) {
      $rootScope.ErrorMessage = "Please try later";
      $scope.Message = "Please try later";
      $rootScope.ShowButtonLoader = false;
    });
  };

}]);