app.controller("RegisterController", ["$scope", "$http", "$state", "rootUrl", "$location", "$rootScope", "$stateParams", "GetContext", "$sce", "$timeout", "$q", "$compile", function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout, $q, $compile) {
  console.log("Register Controller controller loaded.");


  var dataService = rootUrl.SchoolServiceUrl;
   $scope.ContentService = rootUrl.ContentServiceUrl;
  var context = GetContext.Context();
  $scope.regex = '\\d+';

  $scope.VisitorProfileID = null;
  $scope.VisitorRegistration = null;
  $scope.QIDfill = null;
  $scope.PassportNumberfill = null;


  $scope.VisitorRegistration = {
    "QID": $stateParams.QID,
    "PassportNumber": $stateParams.PassportNumber,
  };



  $scope.SelectedDocument = null;

  $scope.init = function () {


  };


  $scope.SubmitVisitorRegistration = function () {

    var visitorRegistration = $scope.VisitorRegistration;

    if (visitorRegistration != null) {

      if (!visitorRegistration.FirstName) {
        $rootScope.ShowToastMessage("First name is required", 'error');
        $rootScope.ShowLoader = false;
        return false;
      }
      else if (!visitorRegistration.LastName) {
        $rootScope.ShowToastMessage("Last name  is required", 'error');
        $rootScope.ShowLoader = false;
        return false;
      }
      else if (!visitorRegistration.MobileNumber) {
        $rootScope.ShowToastMessage("Mobile number is required", 'error');
        $rootScope.ShowLoader = false;
        return false;
      }
      else if (!visitorRegistration.EmailID) {
        $rootScope.ShowToastMessage("Email is required", 'error');
        $rootScope.ShowLoader = false;
        return false;
      }

      else if (!visitorRegistration.PassportNumber) {
        $rootScope.ShowToastMessage("Passport number is required", 'error');
        $rootScope.ShowLoader = false;
        return false;
      }

      // else if (!visitorRegistration.PassportExpiryDate || visitorRegistration.PassportExpiryDate == "?") {
      //   $rootScope.ShowToastMessage("Passport Expiry Date is required", 'error');
      //   $rootScope.ShowLoader = false;
      //   return false;
      // }
      $rootScope.ShowLoader = true;

      $http({
        method: 'POST',
        url: dataService + '/VisitorRegistration',
        data: {
          'FirstName': visitorRegistration.FirstName,
          'MiddleName': visitorRegistration.MiddleName ? visitorRegistration.MiddleName : null,
          'LastName': visitorRegistration.LastName,
          'MobileNumber1': visitorRegistration.MobileNumber,
          'MobileNumber2': visitorRegistration.MobileNumber2 ? visitorRegistration.MobileNumber2 : null,
          'EmailID': visitorRegistration.EmailID ? visitorRegistration.EmailID : null,
          'QID': visitorRegistration.QID,
          'PassportNumber': visitorRegistration.PassportNumber,
          // 'PassportExpiryDate': visitorRegistration.PassportExpiryDate,
          'VisitorProfileID': $scope.VisitorProfileID,
        },
        headers: {
          "Accept": "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          "CallContext": JSON.stringify(context)
        },
      }).success(function (result) {
        if (result.operationResult == 2) {

          $rootScope.ShowToastMessage(result.Message, 'error');

        } else if (result.operationResult == 1) {

          $rootScope.ShowToastMessage(result.Message, 'success');
          $scope.VisitorRegistration = {};
          $rootScope.goBack();

        }
        $rootScope.ShowLoader = false;
      }).error(function (err) {
        $rootScope.ShowToastMessage("Something went wrong, please try again later!", 'error');
        $rootScope.ShowLoader = false;
      });
    }
    else {
      $rootScope.ShowToastMessage("Fill all fields !", 'error');
      $rootScope.ShowLoader = false;
      return false;
    }

  };

  $scope.ClearClick = function () {

    $scope.VisitorRegistration = null

  };


  document.getElementById("cameraTakePicture").addEventListener
    ("click", cameraTakePicture);

  // document.getElementById("UploadPicture").addEventListener
  //   ("click", uploadFromGallery);


  function cameraTakePicture() {
     if ($("#FirstName").val() == null || $("#FirstName").val() == "") {
      $("#FirstName").focus();
      return false;

    }
    appState.takingPicture = true;
        navigator.camera.getPicture(onSuccess, onFail, {
          quality: 40,
          encodingType: Camera.EncodingType.JPG,
          destinationType: Camera.DestinationType.DATA_URL,
          correctOrientation: true
        });

        function onSuccess(imageData) {
          appState.takingPicture = false;
          var image = document.getElementById('myImage');
          image.src =  imageData;
          var fileName = "visitor_" + $scope.VisitorRegistration.FirstName + ".jpg";
          saveUploadedDocument(imageData,fileName);
        }
        function onFail(message) {
          appState.takingPicture = false;
          setTimeout(function () {
            console.log(message);
          }, 0);

      }

  }

    //function uploadFromGallery() {

    //    if ($("#FirstName").val() == null || $("#FirstName").val() == "") {
    //        $("#FirstName").focus();
    //        return false;

    //    }
    //    navigator.camera.getPicture(onSuccess, onFail, {
    //        quality: 50,
    //        destinationType: Camera.DestinationType.DATA_URL,
    //        sourceType: Camera.PictureSourceType.PHOTOLIBRARY
    //    });

    //    function onSuccess(imageURL) {
    //        var image = document.getElementById('myImage');
    //        image.src = "data:image/jpeg;base64," + imageURL;
    //        var fileName = "visitor_" + $scope.VisitorRegistration.FirstName + ".jpg";
    //        saveUploadedDocument(imageURL, fileName);
    //    }

    //    function onFail(message) {
    //        setTimeout(function () {
    //            console.log(message);
    //        }, 0);
    //    }
    //}


  function saveUploadedDocument(data, fileName) {
    var base64Content = data.replace(/^data:image\/[a-z]+;base64,/, "");

    return $q(function (resolve, reject) {
      $http({
        method: 'POST',
        url: dataService + '/UploadContentAsString',
        data:
        {
          "ContentDataString": base64Content,
          "ContentFileName": fileName,
        },
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          "CallContext": JSON.stringify(context)
        },
      })
        .success(function (result) {

          $timeout(function () {
            $scope.$apply(function () {
              $scope.VisitorProfileID = result;
            });

            resolve();
          }, 1000);

        }).error(function () {
          $rootScope.ShowLoader = false;
          $scope.ShowPreLoader = false;
        });
    });
  }

  if ($stateParams.QID != null) {
    $scope.QIDfill = true;
  }
  if ($stateParams.PassportNumber != null) {
    $scope.PassportNumberfill = true;
  }

}]);
