app.controller("AssignmentController", ["$scope", "$http", "$state", "rootUrl", "$location", "$rootScope", "$stateParams", "GetContext", "$sce", "$timeout", function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
  console.log("Assignment controller loaded.");

  var dataService = rootUrl.SchoolServiceUrl;
  var context = GetContext.Context();

  $scope.AssignmentList = [];

  $rootScope.ShowPreLoader = true;
  $rootScope.ShowLoader = true;

  $scope.ContentService = rootUrl.ContentServiceUrl;

  $scope.StudentID = $stateParams.studentID;

  $scope.init = function () {
    $scope.FillAssignments($scope.StudentID);
    $scope.StudentSubjectList($scope.StudentID);
  };

  $scope.toggleGrid = function (event) {
    toggleHeader = $(event.currentTarget)
      .closest(".toggleContainer")
      .find(".toggleHeader");
    toggleContent = $(event.currentTarget)
      .closest(".toggleContainer")
      .find(".toggleContent");
    toggleHeader.toggleClass("active");
    if (toggleHeader.hasClass("active")) {
      toggleContent.slideDown("fast");
    } else {
      toggleContent.slideUp("fast");
    }
  };
 $scope.FillAssignments = function (studentID, subjectID) {
    $scope.AssignmentList = [];

    // Use the passed `studentID` parameter instead of `$scope.StudentID`
    let student = studentID || $scope.StudentID;

    // Build the URL dynamically based on whether `subjectID` is provided
    let url = dataService + '/GetAssignments?studentID=' + student;
    if (subjectID) {
        url += '&subjectID=' + subjectID;
    }

    $http({
        method: 'GET',
        url: url,
        headers: {
            "Accept": "application/json;charset=UTF-8",
            "Content-type": "application/json; charset=utf-8",
            "CallContext": JSON.stringify(context)
        }
    }).success(function (result) {
        $scope.AssignmentList = result;

        $scope.AssignmentList.forEach(function (assignment) {
            let daysLeft = calculateDaysLeft(assignment.DateOfSubmission);
            assignment.DaysLeft = daysLeft.text;
            assignment.DaysLeftNum = daysLeft.num;
        });

        $rootScope.ShowLoader = false;
        $rootScope.ShowPreLoader = false;
    }).error(function () {
        $rootScope.ShowLoader = false;
    });
};


function calculateDaysLeft(dueDate) {
    if (!dueDate) return { text: "No due date", num: -1 }; // Handle missing dates

    let due = new Date(dueDate);
    let today = new Date();
    today.setHours(0, 0, 0, 0); // Ensure comparison is only by date
    due.setHours(0, 0, 0, 0);

    let diffTime = due - today;
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days

    let text;
    if (diffDays > 0) {
        text = diffDays + " days left";
    } else if (diffDays === 0) {
        text = "Due today";
    } else {
        text = "Past Due";
    }

    return { text: text, num: diffDays };
}


  //End To Get Assignment

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

                $rootScope.ShowToastMessage('File successfully downloaded to ' + additionalLocalPath, 'success');
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
            };
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
                errorCallback
            );
        } else {
            downloadFile(downLoadFile);
        }
    } else {
        if (!status.hasPermission) { // does not get permission
            var errorCallback = function () {
                console.warn('Storage permission is not turned on');
            };
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
                errorCallback
            );
        } else {
            downloadFile(downLoadFile);
        }
    }
  }

    $scope.StudentSubjectList = function (studentID) {
        $scope.AssignmentList = [];

        $http({
            method: 'GET',
            url: dataService + '/Getstudentsubjectlist?studentID=' + studentID,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            // Assign the result to the scope
            $scope.studentsubjectlist = result;

            $rootScope.ShowLoader = false;
            $rootScope.ShowPreLoader = false;
        }).error(function () {
            $rootScope.ShowLoader = false;
        });
    };

  // $scope.init();
}]);