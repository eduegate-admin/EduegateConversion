app.controller("SalarySlipController", ["$scope", "$http", "$state", "rootUrl", "$location", "$rootScope", "$stateParams", "GetContext", "$sce", "$timeout", function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
  console.log("Salary Slip controller loaded.");
  $scope.PageName = "Salary Slip";

    var dataService = rootUrl.SchoolServiceUrl;
  var context = GetContext.Context();

  $scope.ContentService = rootUrl.ContentServiceUrl;

  $scope.init = function () {
    $scope.GetLookUpDatas();

    // $scope.GetSalarySlipList();
  };
  $scope.GetLookUpDatas = function () {
    $http({
        method: 'Get',
        url: dataService + "/GetDynamicLookUpDataForMobileApp?lookType=Months&defaultBlank=false",

        headers: {
            "Accept": "application/json;charset=UTF-8",
            "Content-type": "application/json; charset=utf-8",
            "CallContext": JSON.stringify(context)
        }
    }).success(function (result) {
        $scope.Months = result;
        if (!$scope.StaffSalarySlip) {
            $scope.StaffSalarySlip = {};
        }
        const currentMonth = (new Date().getMonth() + 1).toString();

        // Find the current month in the list
        $scope.StaffSalarySlip.SelectedMonth = $scope.Months.find(month => month.Key === currentMonth);
  
    
    });

    //Classes
    $http({
        method: 'Get',
        url: dataService + "/GetDynamicLookUpDataForMobileApp?lookType=Years&defaultBlank=false",

        headers: {
            "Accept": "application/json;charset=UTF-8",
            "Content-type": "application/json; charset=utf-8",
            "CallContext": JSON.stringify(context)
        }
    }).success(function (result) {
        $scope.Years = result;
        if (!$scope.StaffSalarySlip) {
            $scope.StaffSalarySlip = {};
        }
        // Get current year as a string
        const currentYear = new Date().getFullYear().toString();

        // Find the year matching the current year
        $scope.StaffSalarySlip.SelectedYear = $scope.Years.find(year => year.Key === currentYear);
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

   });



  $scope.StaffSalarySlip = null;

  $scope.GetSalarySlipList = function () {
    var leaveApplication = $scope.StaffSalarySlip

    $scope.SelectedMonth = leaveApplication.SelectedMonth.Key;
    $scope.SelectedYear = leaveApplication.SelectedYear.Value;
    $http({
        method: "GET",
        url: `${dataService}/GetSalarySlipList?Month=${$scope.SelectedMonth}&Year=${$scope.SelectedYear}`,
        headers: {
          "Accept": "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          "CallContext": JSON.stringify(context)
        }
      }).success(function (result) {
            $timeout(function () {
                $scope.$apply(function () {
                    if (!result.IsError && result !== null) {

                        $scope.SalarySlips = result;
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
    const fileName = fileUrl.substr(fileUrl.lastIndexOf('_'))
    var FileLocalPath = cordova.file.externalApplicationStorageDirectory ? cordova.file.externalApplicationStorageDirectory : cordova.file.documentsDirectory;
    var localPath = FileLocalPath + "files/" + fileName;

    // Check if the file name has .html extension, open in a window
    if (fileExtension.includes('.html')) {
        cordova.InAppBrowser.open(fileUrl);
    } else {
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
                } else if (fileExtension == ".doc") {
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
                } else if (fileExtension == ".rtf") {
                    cordova.plugins.fileOpener2.open(
                        localPath,
                        'application/rtf',
                        {
                            error: function (e) {
                                console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                            },
                            success: function () {
                                console.log('file opened successfully');
                            }
                        }
                    );
                } else if (fileExtension == ".docx") {
                    cordova.plugins.fileOpener2.open(
                        localPath,
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        {
                            error: function (e) {
                                console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                            },
                            success: function () {
                                console.log('file opened successfully');
                            }
                        }
                    );
                } else if (fileExtension == ".xls") {
                    cordova.plugins.fileOpener2.open(
                        localPath,
                        'application/vnd.ms-excel',
                        {
                            error: function (e) {
                                console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                            },
                            success: function () {
                                console.log('file opened successfully');
                            }
                        }
                    );
                } else if (fileExtension == ".xlsx") {
                    cordova.plugins.fileOpener2.open(
                        localPath,
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        {
                            error: function (e) {
                                console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                            },
                            success: function () {
                                console.log('file opened successfully');
                            }
                        }
                    );
                } else if (fileExtension == ".gif") {
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
                } else if (fileExtension == ".txt") {
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
                } else if (fileExtension == ".jpeg" || fileExtension == ".jfif" || fileExtension == ".jpg") {
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
                } else if (fileExtension == ".png") {
                    cordova.plugins.fileOpener2.open(
                        localPath,
                        'image/png',
                        {
                            error: function (e) {
                                console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                            },
                            success: function () {
                                console.log('file opened successfully');
                            }
                        }
                    );
                } else if (fileExtension == ".webp") {
                    cordova.plugins.fileOpener2.open(
                        localPath,
                        'image/webp',
                        {
                            error: function (e) {
                                console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                            },
                            success: function () {
                                console.log('file opened successfully');
                            }
                        }
                    );
                } else if (fileExtension == ".avi") {
                    cordova.plugins.fileOpener2.open(
                        localPath,
                        'video/x-msvideo',
                        {
                            error: function (e) {
                                console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                            },
                            success: function () {
                                console.log('file opened successfully');
                            }
                        }
                    );
                } else if (fileExtension == ".mp4") {
                    cordova.plugins.fileOpener2.open(
                        localPath,
                        'video/mp4',
                        {
                            error: function (e) {
                                console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                            },
                            success: function () {
                                console.log('file opened successfully');
                            }
                        }
                    );
                } else if (fileExtension == ".mov") {
                    cordova.plugins.fileOpener2.open(
                        localPath,
                        'video/quicktime',
                        {
                            error: function (e) {
                                console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                            },
                            success: function () {
                                console.log('file opened successfully');
                            }
                        }
                    );
                } else if (fileExtension == ".mp3") {
                    cordova.plugins.fileOpener2.open(
                        localPath,
                        'audio/mpeg',
                        {
                            error: function (e) {
                                console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                            },
                            success: function () {
                                console.log('file opened successfully');
                            }
                        }
                    );
                } else if (fileExtension == ".opus") {
                    cordova.plugins.fileOpener2.open(
                        localPath,
                        'audio/opus',
                        {
                            error: function (e) {
                                console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                            },
                            success: function () {
                                console.log('file opened successfully');
                            }
                        }
                    );
                } else if (fileExtension == ".wav") {
                    cordova.plugins.fileOpener2.open(
                        localPath,
                        'audio/wav',
                        {
                            error: function (e) {
                                console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                            },
                            success: function () {
                                console.log('file opened successfully');
                            }
                        }
                    );
                } else if (fileExtension == ".csv") {
                    cordova.plugins.fileOpener2.open(
                        localPath,
                        'text/csv',
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

                // Additional download logic
                var additionalFileLocalPath = cordova.file.externalRootDirectory ? cordova.file.externalRootDirectory : cordova.file.documentsDirectory;
                var additionalLocalPath = additionalFileLocalPath + "Download/" + fileName;
                fileTransfer.download(
                    uri, additionalLocalPath, function (entry) {
                        console.log('File successfully downloaded to: ' + additionalLocalPath);
                    },
                    function (error) {
                        console.log('Error downloading file to additional location: ' + error.source);
                    }
                );

                $rootScope.ShowToastMessage('File downloaded successfully in ' + additionalLocalPath, 'success');
            },
            function (error) {
                $rootScope.ShowToastMessage("Something went wrong, please try later", 'error');
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