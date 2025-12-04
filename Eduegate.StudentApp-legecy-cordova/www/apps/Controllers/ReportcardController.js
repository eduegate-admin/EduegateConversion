app.controller("ReportcardController", ["$scope", "$http", "$state", "rootUrl", "$location", "$rootScope", "$stateParams", "GetContext", "$sce", "$timeout", function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
  console.log("Reportcard controller loaded.");

  var dataService = rootUrl.SchoolServiceUrl;
  var context = GetContext.Context();

  $scope.SelectedAcademicYear = null;

  // $rootScope.ShowLoader = true;
  // $rootScope.ShowPreLoader = true;

  $scope.ContentService = rootUrl.ContentServiceUrl;

  $scope.StudentID = $stateParams.studentID;

  $scope.init = function () {
    $http({
      method: 'GET',
      url: dataService + "/GetStudentDetailsByAdmissionNumber?admissionNumber=" + $rootScope.UserDetails.LoginUserID,
      headers: {
          "Accept": "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          "CallContext": JSON.stringify(context)
      }
  }).success(function (result) {
      $scope.SelectedWard = result;
      $scope.StudentID = $scope.SelectedWard != null ? $scope.SelectedWard.StudentIID : 0;
  }
)
    $scope.FillReportcard($scope.StudentID);
  };



  //To Get LessonPlans
  $scope.FillReportcard = function (studentID) {

    $http({
      method: 'GET',
      url: dataService + '/GetReportcardByStudentID?studentID=' + $scope.StudentID,
      headers: {
        "Accept": "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        "CallContext": JSON.stringify(context)
      }
    }).success(function (result) {
      $scope.AcademicYear = result;
    }).error(function () {

    });

  };

  $scope.GetReportCardDetails = function (ward) {

    // var studentDetail = $scope.StudentFullDetails.find(s => s.StudentIID == $scope.SelectedStudent.Key);
    // var sectionID = studentDetail.SectionID;
    // var classID = studentDetail.ClassID;

    $http({
        method: "GET",
        url: dataService + "/GetReportCardList?studentID=" +
        ward.StudentIID + '&classID=' + ward.ClassID + '&sectionID=' + ward.SectionID + '&academicYearID=' + 23,
        headers: {
          "Accept": "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          "CallContext": JSON.stringify(context)
        }
      }).success(function (result) {
            $timeout(function () {
                $scope.$apply(function () {
                    if (!result.IsError && result !== null) {

                        $scope.ReportCards = result;
                    }
                });
            });
        }).error(function () {
    });
}

// $scope.DownloadURL = function (url) {
//   var link = document.createElement("a");
//   link.href = url;
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   delete link;
// };

  var downLoadFile;
  var permissions;

  $scope.DownloadURL = function (referenceID) {

    $rootScope.ShowLoader = true;
    $http({
      url: $scope.ContentService + "/ReadContentsByIDForMobile?contentID=" + referenceID,
      method: 'GET',
      headers: {
        "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8",
        "CallContext": JSON.stringify(context)
      }
    }).then(function (result) {
      result = result.data;
      downLoadFile = result;
      permissions = cordova.plugins.permissions;
      if(device.platform.toLowerCase() == "android" && device.version < 13)
      {
      permissions.checkPermission(permissions.READ_EXTERNAL_STORAGE, checkPermissionCallback, null);
      }
      else
      {
        permissions.checkPermission(permissions.READ_MEDIA_IMAGES, checkPermissionCallback, null);
      }
      $rootScope.ShowLoader = false;
    }
      , function (err) {
        $rootScope.ShowLoader = false;
      });
  }

  function downloadFile(fileUrl) {
    var fileTransfer = new FileTransfer();
    var uri = encodeURI(fileUrl);
    const fileExtension = fileUrl.substr(fileUrl.lastIndexOf('.'))
    // const fileName = fileUrl.substr(fileUrl.lastIndexOf('_')).replaceAll('_', '')
    const fileName = fileUrl.substr(fileUrl.lastIndexOf('_'))
    var FileLocalPath = cordova.file.externalApplicationStorageDirectory ? cordova.file.externalApplicationStorageDirectory
      : cordova.file.documentsDirectory;
    var localPath = FileLocalPath + 'Podar' + fileName;

    //check the file name has html, open in a window
    if (fileExtension.includes('.html')) {
      cordova.InAppBrowser.open(fileUrl);
    }
    else {
      fileTransfer.download(
        uri, localPath, function (entry) {
          if (fileExtension == ".pdf") {
            cordova.plugins.fileOpener2.open(
              localPath,
              'application/pdf',
              {
                error: function (e) {
                  console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                },
                success: function () {
                  console.log('file opened successfully');
                }
              }
            );
          }

          else if (fileExtension == ".doc" || fileExtension == ".rtf" || fileExtension == ".docx") {
            cordova.plugins.fileOpener2.open(
              localPath,
              'application/msword',
              {
                error: function (e) {
                  console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                },
                success: function () {
                  console.log('file opened successfully');
                }
              }
            );
          }

          else if (fileExtension == ".xls" || fileExtension == ".xlsx") {
            cordova.plugins.fileOpener2.open(
              localPath,
              'application/x-msexcel',
              {
                error: function (e) {
                  console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                },
                success: function () {
                  console.log('file opened successfully');
                }
              }
            );
          }

          else if (fileExtension == ".gif") {
            cordova.plugins.fileOpener2.open(
              localPath,
              'image/GIF',
              {
                error: function (e) {
                  console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                },
                success: function () {
                  console.log('file opened successfully');
                }
              }
            );
          }

          else if (fileExtension == ".txt") {
            cordova.plugins.fileOpener2.open(
              localPath,
              'text/plain',
              {
                error: function (e) {
                  console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                },
                success: function () {
                  console.log('file opened successfully');
                }
              }
            );
          }

          else if (fileExtension == ".jpeg" || fileExtension == ".jfif" || fileExtension == ".webp") {
            cordova.plugins.fileOpener2.open(
              localPath,
              'image/jpeg',
              {
                error: function (e) {
                  console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                },
                success: function () {
                  console.log('file opened successfully');
                }
              }
            );
          }

          $rootScope.ShowToastMessage('File downloaded successfully in' + FileLocalPath , 'success');
        },

        function (error) {
          $rootScope.ShowToastMessage("Something went wrong, please try later" , 'error');
        },

        false
      );
    }
  }


  function checkPermissionCallback(status) {
    if (device.platform.toLowerCase() == "android" && device.version < 13) {
      if (!status.hasPermission) { // does not get permission
        var errorCallback = function () {
          console.warn('Storage permission is not turned on');
        }
        if (!status.hasPermission) {
          permissions.requestPermission(
            permissions.READ_EXTERNAL_STORAGE,
            function (status) {
              if (!status.hasPermission) {
                errorCallback();
              } else {
                // continue with downloading/ Accessing operation
                downloadFile(downLoadFile);
              }
            },
            errorCallback);
        }

      } else {
        downloadFile(downLoadFile);
      }
    }

    else {
      if (!status.hasPermission) { // does not get permission
        var errorCallback = function () {
          console.warn('Storage permission is not turned on');
        }
        if (!status.hasPermission) {
          permissions.requestPermission(
            permissions.READ_MEDIA_IMAGES,
            function (status) {
              if (!status.hasPermission) {
                errorCallback();
              } else {
                // continue with downloading/ Accessing operation
                downloadFile(downLoadFile);
              }
            },
            errorCallback);
        }

      } else {
        downloadFile(downLoadFile);
      }
    }
  }

  // $scope.init();
}]);