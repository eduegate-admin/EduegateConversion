app.controller("CircularController", ["$scope", "$http", "$state", "rootUrl", "$location", "$rootScope", "$stateParams", "GetContext", "$sce", "$timeout", function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
    console.log("Circular controller loaded.");

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();

    $scope.CircularList = [];

    // $rootScope.ShowPreLoader = true;
    $rootScope.ShowLoader = true;

    $scope.ErpUrl = rootUrl.ErpUrl;
    $scope.ContentService = rootUrl.ContentServiceUrl;

    $scope.init = function () {
        $scope.FillCirculars();
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

    //To Get Circulars
    $scope.FillCirculars = function () {
        $scope.CircularList = [];

 var url = dataService + "/GetLatestCirculars";

$http({
    method: 'GET',
    url: url,
    headers: {
        "Accept": "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        "CallContext": JSON.stringify(context)
    }
}).then(function (response) {
    // success
    var result = response.data;
    if (!result.IsError && result !== null) {
        $scope.CircularList = result;
        $rootScope.ShowLoader = false;
    }
}, function (error) {
    // error (you can add error handling if needed)
}).finally(function () {
    // complete
    $timeout(function () {
        // Optional cleanup logic, uncomment if needed
        // $rootScope.ShowPreLoader = false;
        // $rootScope.ShowLoader = false;
    });
});

    };
    //End To Get Circulars

    //   $scope.DownloadURL = function (url) {
    //     var link = document.createElement("a");
    //     link.href = $scope.ContentService + url;
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    //     delete link;
    // };

    var downLoadFile;
    var permissions;

    $scope.DownloadURL = function (referenceID) {

        $rootScope.ShowLoader = true;
        $scope.pendingDownloadID = referenceID;

        permissions = cordova.plugins.permissions;

        if (device.platform.toLowerCase() === "android" && device.version < 13) {
            permissions.checkPermission(permissions.READ_EXTERNAL_STORAGE, checkPermissionCallback, null);
        } else {
            permissions.checkPermission(permissions.READ_MEDIA_IMAGES, checkPermissionCallback, null);
        }
        $rootScope.ShowLoader = false;
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
        if (!status.hasPermission) {
            var errorCallback = function () {
                console.warn("Permission denied");
                $rootScope.ShowLoader = false;
            };

            var perm = (device.platform.toLowerCase() === "android" && device.version < 13)
                ? permissions.READ_EXTERNAL_STORAGE
                : permissions.READ_MEDIA_IMAGES;

            permissions.requestPermission(perm, function (newStatus) {
                if (newStatus.hasPermission) {
                    downloadFile($scope.pendingDownloadID);
                } else {
                    errorCallback();
                }
            }, errorCallback);
        } else {
            downloadFile($scope.pendingDownloadID);
        }
    }

    function downloadFile(referenceID) {
        $http({
            url: $scope.ContentService + "/DirectReadContentsByID?contentID=" + referenceID,
            method: 'GET',
            responseType: 'arraybuffer',
            headers: {
                'Accept': '*/*',
                'CallContext': JSON.stringify(context)
            }
        }).then(function (response) {
            const contentType = response.headers('Content-Type') || 'application/octet-stream';
            const disposition = response.headers('Content-Disposition');
            let filename = "DownloadedFile";

            if (disposition && disposition.indexOf("filename=") !== -1) {
                filename = disposition.split("filename=")[1].replace(/"/g, "");
            }

            const blob = new Blob([response.data], { type: contentType });

            // Save to device using cordova-plugin-file
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
                dir.getFile(filename, { create: true, exclusive: false }, function (fileEntry) {
                    fileEntry.createWriter(function (writer) {
                        writer.write(blob);

                        writer.onwriteend = function () {
                            // ✅ Open file using cordova.plugins.fileOpener2
                            cordova.plugins.fileOpener2.open(
                                fileEntry.nativeURL,
                                contentType,
                                {
                                    error: function (e) {
                                        console.error("Failed to open file", e);
                                        alert("Unable to open file. Please check if an appropriate app is installed.");
                                    },
                                    success: function () {
                                        console.log("File opened successfully");
                                    }
                                }
                            );

                            $rootScope.ShowLoader = false;
                        };

                        writer.onerror = function (err) {
                            console.error("File write failed", err);
                            $rootScope.ShowLoader = false;
                        };
                    }, function (err) {
                        console.error("Could not create file writer", err);
                        $rootScope.ShowLoader = false;
                    });
                }, function (err) {
                    console.error("Could not get file", err);
                    $rootScope.ShowLoader = false;
                });
            }, function (err) {
                console.error("Could not resolve filesystem", err);
                $rootScope.ShowLoader = false;
            });
        }, function (error) {
            console.error("Download failed", error);
            $rootScope.ShowLoader = false;
        });
    }

    // $scope.init();
}]);
