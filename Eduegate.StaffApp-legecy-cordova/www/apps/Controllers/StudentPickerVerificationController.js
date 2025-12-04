app.controller('StudentPickerVerificationController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$timeout', '$sce', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $timeout, $sce) {
  console.log('StudentPickerVerificationController loaded.');
  $scope.PageName = " Pickup Verification";

  var dataService = rootUrl.SchoolServiceUrl;
  var context = GetContext.Context();
    $scope.ContentService = rootUrl.ContentServiceUrl;
  $scope.QRDetails = {};
  $scope.QRCodeValue = null;

  $scope.init = function () {
      $scope.ScanQRCode();
  }

  $scope.GetStudentImage = function (studentId, fileName) {
    return rootUrl.ErpUrl + "UploadImages/StudentProfile/" + studentId + "/Thumbnail/" + fileName;
  }


  $scope.cameraTakePicture = function () {
    navigator.camera.getPicture(onSuccess, onFail, {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      correctOrientation: true

    });

    function onSuccess(imageData) {

      var image = document.getElementById('uploadImage');
      image.src =  imageData;
      if ($scope.QRDetails.PickByFullName != null || $scope.QRDetails.PickByFullName != undefined) {
        var fileName = PickByFullName + ".jpg";
      }
      else {
        return false;
      }

      saveUploadedDocument(imageData, fileName);
    }

    function onFail(message) {
      return false;
      alert('Failed because: ' + message);
    }
  }

  //Gallery open for photo upload
  function saveUploadedDocument(data, fileName) {
    var base64Content = data.replace(/^data:image\/[a-z]+;base64,/, "");

    return $q(function (resolve, reject) {
      $http({
        method: 'POST',
        url: rootUrl.RootUrl + '/UploadContentAsString',
        data:
        {
          "ContentDataString": base64Content,
          "ContentFileName": fileName,
        },
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      })
        .success(function (result) {

          $timeout(function () {
            $scope.$apply(function () {
              $scope.QRDetails.StudentPickerContentID = result;
            });

            resolve();
          }, 1000);

        }).error(function () {
          $rootScope.ShowLoader = false;
          $scope.ShowPreLoader = false;
        });
    });
  }

  Fancybox.bind("[data-fancybox]", {
    // Your custom options
  });


  $scope.ScanQRCode = function () {
      $scope.QRCodeValue = null;
  
if (device.platform.toLowerCase() == "android") {
          // The below code is for android only
          $timeout(function () {
              var settings = cordova.plugins.scanner.getDefaultSettings();

              cordova.plugins.scanner.startScanning(
                  function (result) {
                      var notifySound = "./sounds/beep.wav";
                      var audio = new Audio(notifySound);
                      audio.play();

                      if (result) {
                          $scope.$apply(function () {
                              $scope.QRCodeValue = result;
                              $scope.GetDetailsByQRCode($scope.QRCodeValue);

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

                      if (result.text) {
                          // Merge the original code block here
                          $scope.$apply(function () {
                              $scope.QRCodeValue = result.text;
                              $scope.GetDetailsByQRCode($scope.QRCodeValue);
                          });
                      }
                  },
                  function (error) {
                      alert("Scanning failed: " + error);
                  }
              );
          });
      }

    //$scope.GetDetailsByQRCode("Cx9QZk0olmLIFv1ShUWJT6978TRyfGa0oSU2D0dGGL3iEMPeP0WKn1pjET4zbM3r");
    //$scope.GetDetailsByQRCode("mwJJjJvNku2TbhYC7mCETWq2nitNwqYM6XlwSDYA5eY=");
     // $scope.GetDetailsByQRCode("P0100");
  };
  $scope.GetDetailsByQRCode = function (QrCode) {
    if(QrCode){
      $scope.QRDetails = null;
      $rootScope.ShowLoader = true;

      $http({
        method: "GET",
        url: dataService + "/GePickupRegisteredDetailsByQR?qrCode=" + QrCode,
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).success(function (result) {

        $rootScope.ShowLoader = false;
        $scope.QRDetails = result;

        DeleteBtnVisible();

      }).error(function () {
        $rootScope.ShowLoader = false;
        $scope.ShowPreLoader = false;
      });
    }

  }

  $scope.submitLog = function (status, selected) {
    $scope.QRDetails.StudentPickersList = $scope.QRDetails.StudentPickersList.filter(item => item.StudentPickerIID == selected)

    $scope.QRDetails.LogStatus = status;

    if ($scope.QRDetails == null || $scope.QRDetails == undefined) {
      return false;
    }

    if ($scope.QRDetails.StudentPickersList.length > 1) {
      $rootScope.ErrorMessage = "Please try with 1 pickup by person";
      $(".error-msg")
        .addClass("showMsg")
        .delay(2000)
        .queue(function () {
          $(this).removeClass("showMsg");
          $(this).dequeue();
        });
      return false;
    }

    $rootScope.ShowLoader = true;

    $http({
      method: 'POST',
      url: dataService + "/SubmitStudentPickLogs",
      data: $scope.QRDetails,
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
    window.location.href = '#/studentpickerverificationHome';
    location.reload();
  };


  $scope.DeletePicker = function (picker) {
    $scope.QRDetails.StudentPickersList = $scope.QRDetails.StudentPickersList.filter(item => item.StudentPickerIID !== picker.StudentPickerIID)
    DeleteBtnVisible();
  }

  $scope.DeleteStudent = function (stud) {
    $scope.QRDetails.StudentsList = $scope.QRDetails.StudentsList.filter(item => item.Student.Key !== stud.Student.Key)
    DeleteBtnVisible();
  }

  function DeleteBtnVisible() {

    if ($scope.QRDetails.StudentsList.length > 1) {
      $scope.StudDeleteBtn = true;
    }
    else {
      $scope.StudDeleteBtn = false;
    }

    if ($scope.QRDetails.StudentPickersList.length > 1) {
      $scope.StaffDeleteBtn = true;
    }
    else {
      $scope.StaffDeleteBtn = false;
    }

  }
  $scope.init();

}]);