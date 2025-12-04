app.controller("StudentDailyPickupRequestController", ["$scope", "$http", "$state", "rootUrl", "$location", "$rootScope", "$stateParams", "GetContext", "$sce", "$timeout", "$q", "$compile", "$translate" , function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout, $q, $compile, $translate) {
  console.log("Student pickup request controller loaded.");

  var dataService = rootUrl.SchoolServiceUrl;
  $scope.ContentService = rootUrl.ContentServiceUrl;
  var context = GetContext.Context();

  $scope.StudentDailyPickupRequest = {};
  $scope.SelectedDocument = null;
  $scope.Students = [];
  $scope.StudentPickedBy = [];
  $scope.spinner = false;
  $scope.PickUpLoginID = context.LoginID;

  $scope.init = function () {

    $scope.parentRadioButtons = [
      {
        'Value': 'Father'
      },
      {
        'Value': 'Mother'
      },
      {
        'Value': 'Gurdian'
      }
    ];


    $rootScope.ShowLoader = true;
    $scope.ShowPreLoader = true;

    $q.all([
      GetStudentsList(),
      GetPickedByList(),
      GetParentDetails(),
    ]).then(function () {
      $rootScope.ShowLoader = false;
      $scope.ShowPreLoader = false;
    });

  };

  function GetStudentsList() {
    return $q(function (resolve, reject) {

      $http({
        method: "GET",
        url: dataService + "/GetParentStudents",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).success(function (result) {

        $timeout(function () {
          result.forEach(x => {
            $scope.Students.push({
              "Key": x.StudentIID,
              "Value": x.AdmissionNumber + " - " + x.FirstName + " " + (x.MiddleName != null ? (x.MiddleName + " ") : "") + x.LastName,
            });
            $scope.StudentDailyPickupRequest.ParentID = x.ParentID;
          })

          if ($scope.Students.length > 1) {
            $scope.Students.push({
              "Key": 0,
              "Value": "ALL",
            })
          }

          // Sort the numbers in ascending order
          $scope.Students.sort((a, b) => Number(a.Key) - Number(b.Key));

          resolve();
        }, 1000);

      }).error(function () {
        $rootScope.ShowLoader = false;
        $scope.ShowPreLoader = false;
      });

    });
  };

  function GetPickedByList() {
    return $q(function (resolve, reject) {

      $http({
        method: "GET",
        url: dataService + '/GetDynamicLookUpDataForMobileApp?lookType=StudentPickedBy&defaultBlank=false',
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).success(function (result) {

        $timeout(function () {
          $scope.StudentPickedBy = result;

          const specificObject = {
            "Key": "5",
            "Value": "Visitor"
          };

          $scope.StudentPickedBy.sort((a, b) => {
            if (a.Key === specificObject.Key && b.Key !== specificObject.Key) {
              return -1; // Place specific object first
            } else if (a.Key !== specificObject.Key && b.Key === specificObject.Key) {
              return 1; // Place specific object last
            } else {
              return parseInt(a.Key) - parseInt(b.Key); // Sort by Key in ascending order for other objects
            }
          });

          resolve();
        }, 1000);

      }).error(function () {
        $rootScope.ShowLoader = false;
        $scope.ShowPreLoader = false;
      });

    });
  };

  function GetParentDetails() {
    return $q(function (resolve, reject) {

      $http({
        method: "GET",
        url: dataService + '/GetGuardianDetails',
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).success(function (result) {

        $timeout(function () {
          $scope.$apply(function () {
            $scope.ParentDetails = result;
          });

          resolve();
        }, 1000);

      }).error(function () {
        $rootScope.ShowLoader = false;
        $scope.ShowPreLoader = false;
      });

    });
  };

  $scope.PickedByChanges = function (pickupRequest) {

    $scope.StudentDailyPickupRequest.ParentCode = null;
    $scope.StudentDailyPickupRequest.VisitorCode = null;
    $scope.OtherParentDetails = null;
    $scope.VistitorDetails = null;
    $scope.PickUpLoginID = context.LoginID;
    $scope.StudentDailyPickupRequest.VisitorProfileID = null;

    $scope.StudentDailyPickupRequest.PickedByID = pickupRequest.PickedByID;

    var pickedBy = $scope.StudentPickedBy.find(p => p.Key == pickupRequest.PickedByID);

    pickupRequest.PickedBy = {
      "Key": pickedBy.Key,
      "Value": pickedBy.Value,
    }

    if (pickupRequest.PickedBy.Value == "Father") {
      pickupRequest.FirstName = $scope.ParentDetails.FatherFirstName;
      pickupRequest.MiddleName = $scope.ParentDetails.FatherMiddleName;
      pickupRequest.LastName = $scope.ParentDetails.FatherLastName;
    }
    else if (pickupRequest.PickedBy.Value == "Mother") {
      pickupRequest.FirstName = $scope.ParentDetails.MotherFirstName;
      pickupRequest.MiddleName = $scope.ParentDetails.MotherMiddleName;
      pickupRequest.LastName = $scope.ParentDetails.MotherLastName;
    }
    else if (pickupRequest.PickedBy.Value == "Guardian") {
      pickupRequest.FirstName = $scope.ParentDetails.GuardianFirstName;
      pickupRequest.MiddleName = $scope.ParentDetails.GuardianMiddleName;
      pickupRequest.LastName = $scope.ParentDetails.GuardianLastName;
    }
    else {
      pickupRequest.FirstName = null;
      pickupRequest.MiddleName = null;
      pickupRequest.LastName = null;
    }

    $scope.SelectedPicker = pickupRequest.PickedBy.Value;
  };

  $scope.SubmitStudentDailyPickupRequest = function () {

    $rootScope.ShowLoader = true;

    var pickupRequest = $scope.StudentDailyPickupRequest;

    if (pickupRequest != null) {

      if (pickupRequest.StudentID == undefined || pickupRequest.StudentID == null) {
        $rootScope.ShowToastMessage("Student is required", 'error');
        $rootScope.ShowLoader = false;
        return false;
      }
      else if (pickupRequest.PickedByID == undefined || pickupRequest.PickedByID == null) {
        $rootScope.ShowToastMessage("Picked by is required", 'error');
        $rootScope.ShowLoader = false;
        return false;
      }
      else if (pickupRequest.FirstName == undefined || pickupRequest.FirstName == null) {
        $rootScope.ShowToastMessage("First name is required", 'error');
        $rootScope.ShowLoader = false;
        return false;
      }

      var studName = $scope.Students.find(s => s.Key == $scope.StudentDailyPickupRequest.StudentID);

      selectedStudent = {
        "Key": studName.Key,
        "Value": studName.Value,
      }


      $http({
        method: 'POST',
        url: dataService + '/SubmitStudentDailyPickupRequest',
        data: {
          'StudentPickerStudentMapIID': pickupRequest.StudentPickerStudentMapIID != undefined || pickupRequest.StudentPickerStudentMapIID != null ? pickupRequest.StudentPickerStudentMapIID : 0,
          'StudentPickerIID': pickupRequest.StudentPickerIID,
          'StudentPickLogIID': pickupRequest.StudentPickLogIID,
          'StudentID': pickupRequest.StudentID,
          'ParentID': pickupRequest.ParentID,
          'PickedByID': pickupRequest.PickedByID,
          'FirstName': pickupRequest.FirstName,
          'MiddleName': pickupRequest.MiddleName,
          'LastName': pickupRequest.LastName,
          'AdditionalInfo': pickupRequest.AdditionalInfo,
          'RequestStatusID': pickupRequest.RequestStatusID,
          'PhotoContentID': $scope.StudentDailyPickupRequest.VisitorProfileID ? $scope.StudentDailyPickupRequest.VisitorProfileID : $scope.StudentDailyPickupRequest.PhotoContentIID,
          'QRCODE': selectedStudent.Value + "-" + $scope.SelectedPicker + "-" + pickupRequest.FirstName,
          'VisitorCode': pickupRequest.VisitorCode,
          'PickUpLoginID': $scope.PickUpLoginID,
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
          $scope.StudentDailyPickupRequest = {};
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

    $scope.StudentDailyPickupRequest = null
    var image = document.getElementById('myImage');
    image.src =  'images/Profile_avatar_placeholder_large.png';

  };

  document.getElementById("cameraTakePicture").addEventListener
    ("click", cameraTakePicture);

  document.getElementById("UploadPicture").addEventListener
    ("click", uploadFromGallery);


  function cameraTakePicture() {
    var str = "? undefined:undefined ?";

    if ($("#SelectedStudent").val() == null || $("#SelectedStudent").val() == "" || $("#SelectedStudent").val() == str) {
      $timeout(function () {
        $rootScope.ShowToastMessage("Please select student first", 'error');
      }, 300);
      return false;
    }
    else if ($("#SelectedPickedBy").val() == null || $("#SelectedPickedBy").val() == "" || $("#SelectedPickedBy").val() == str) {
      $timeout(function () {
        $rootScope.ShowToastMessage("Please select PickedBy", 'error');
      }, 300);
      return false;
    }

    navigator.camera.getPicture(onSuccess, onFail, {
      quality: 40,
      destinationType: Camera.DestinationType.DATA_URL
    });

    function onSuccess(imageData) {

      var image = document.getElementById('myImage');
      image.src =  imageData;

      var selectedStudent = $scope.Students.find(s => s.Key == $scope.StudentDailyPickupRequest.StudentID);

      selectedStudent = {
        "Key": selectedStudent.Key,
        "Value": selectedStudent.Value,
      }

      var fileName = selectedStudent.Value + "_" + $scope.SelectedPicker + "_" + $scope.StudentDailyPickupRequest.FirstName + ".jpg";
      saveUploadedDocument(imageData, fileName);
    }

    function onFail(message) {
      return false;
      alert('Failed because: ' + message);
    }
  }

  function uploadFromGallery() {

    var str = "? undefined:undefined ?";

    if ($("#SelectedStudent").val() == null || $("#SelectedStudent").val() == "" || $("#SelectedStudent").val() == str) {
      $timeout(function () {
        $rootScope.ShowToastMessage("Please select student first", 'error');
      }, 300);
      return false;
    }
    else if ($("#SelectedPickedBy").val() == null || $("#SelectedPickedBy").val() == "" || $("#SelectedPickedBy").val() == str) {
      $timeout(function () {
        $rootScope.ShowToastMessage("Please select PickedBy", 'error');
      }, 300);
      return false;
    }

    navigator.camera.getPicture(onSuccess, onFail, {
      quality: 40,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY
    });

    function onSuccess(imageURL) {
      var image = document.getElementById('myImage');
      image.src = imageURL;

      var selectedStudent = $scope.Students.find(s => s.Key == $scope.StudentDailyPickupRequest.StudentID);

      selectedStudent = {
        "Key": selectedStudent.Key,
        "Value": selectedStudent.Value,
      }

      var fileName = selectedStudent.Value + "_" + $scope.SelectedPicker + "_" + $scope.StudentDailyPickupRequest.FirstName + ".jpg";

      saveUploadedDocument(imageURL, fileName);
    }

    function onFail(message) {
      return false;
      alert('Failed because: ' + message);
    }
  }


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
              $scope.StudentDailyPickupRequest.PhotoContentIID = result;
            });

            resolve();
          }, 1000);

        }).error(function () {
          $rootScope.ShowLoader = false;
          $scope.ShowPreLoader = false;
        });
    });
  }

  $scope.VisitorTextBoxChanges = function (data) {
    if (data.length == 7) {
      $scope.spinner = true;

      GetVisitorDetailsByVisitorCode(data);

    }
  }

  function GetVisitorDetailsByVisitorCode(data) {
    return $q(function (resolve, reject) {

        $http({
            method: "GET",
            url: dataService + "/GetVisitorDetailsByVisitorCode?visitorCode=" + data,
            headers: {
                Accept: "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                CallContext: JSON.stringify(context),
            },
        }).success(function (result) {

            $timeout(function () {
                $scope.$apply(function () {
                    if (result && result.VisitorIID) { // Check if result is not null and has a valid ID
                        $scope.VistitorDetails = result;

                        $scope.StudentDailyPickupRequest.FirstName = $scope.VistitorDetails.FirstName;
                        $scope.StudentDailyPickupRequest.MiddleName = $scope.VistitorDetails.MiddleName;
                        $scope.StudentDailyPickupRequest.LastName = $scope.VistitorDetails.LastName;
                        $scope.StudentDailyPickupRequest.VisitorProfileID = $scope.VistitorDetails.VisitorProfileID;
                        $scope.spinner = false;

                        if ($scope.VistitorDetails.LoginID) {
                            $scope.PickUpLoginID = $scope.VistitorDetails.LoginID;
                        }
                    } else {
                        $translate(['VISITORNOTFOUNDORINVALIDVISITORCODE']).then(function (translation) {
                          $rootScope.ShowToastMessage(translation.VISITORNOTFOUNDORINVALIDVISITORCODE);

                      });
                      $scope.spinner = false;

                    }
                });

                resolve();
            }, 1000);

        }).error(function () {
            $rootScope.ShowLoader = false;
            $scope.ShowPreLoader = false;
            $scope.spinner = false;
            $scope.errorMessage = "An error occurred while fetching visitor details.";
            reject();
        });
    });
};

  $scope.ParentCodeTextBoxChanges = function (parentCode) {
    if (parentCode.length >= 6) {
      $scope.spinner = true;
      GetParentDetailsByParentCode(parentCode);
    }
  }

  function GetParentDetailsByParentCode(parentCode) {
    return $q(function (resolve, reject) {

      $http({
        method: "GET",
        url: dataService + "/GetParentDetailsByParentCode?parentCode=" + parentCode,
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).success(function (result) {

        $timeout(function () {
          $scope.$apply(function () {
            $scope.OtherParentDetails = result;
            $scope.spinner = false;

            if ($scope.OtherParentDetails.LoginID) {
              $scope.PickUpLoginID = $scope.OtherParentDetails.LoginID;
            }

          });

          resolve();
        }, 1000);

      }).error(function () {
        $rootScope.ShowLoader = false;
        $scope.ShowPreLoader = false;
        $scope.spinner = false;
      });
    });
  };



  $scope.RadioButtonClick = function () {
    const radioButtons = document.getElementsByName("RadioValue");

    for (let i = 0; i < radioButtons.length; i++) {
      if (radioButtons[i].checked) {
        const selectedValue = radioButtons[i].value;
        $scope.SelectedRadio = selectedValue;
        break;
      }
    }

    if ($scope.SelectedRadio == "Father") {
      $scope.StudentDailyPickupRequest.FirstName = $scope.OtherParentDetails.FatherFirstName;
      $scope.StudentDailyPickupRequest.MiddleName = $scope.OtherParentDetails.FatherMiddleName;
      $scope.StudentDailyPickupRequest.LastName = $scope.OtherParentDetails.FatherLastName;
    }
    else if ($scope.SelectedRadio == "Mother") {
      $scope.StudentDailyPickupRequest.FirstName = $scope.OtherParentDetails.MotherFirstName;
      $scope.StudentDailyPickupRequest.MiddleName = $scope.OtherParentDetails.MotherMiddleName;
      $scope.StudentDailyPickupRequest.LastName = $scope.OtherParentDetails.MotherLastName;
    }
    else {
      $scope.StudentDailyPickupRequest.FirstName = $scope.OtherParentDetails.GuardianFirstName;
      $scope.StudentDailyPickupRequest.MiddleName = $scope.OtherParentDetails.GuardianMiddleName;
      $scope.StudentDailyPickupRequest.LastName = $scope.OtherParentDetails.GuardianLastName;
    }

  }
  $scope.init()

}]);