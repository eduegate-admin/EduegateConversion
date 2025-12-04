app.controller('VehicleTrackingController', ['$scope', '$http', '$state', 'loggedIn', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', "$timeout", function ($scope, $http, $state, loggedIn, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
    console.log('VehicleTrackingController loaded.');
    $scope.PageName = "Vehicle Tracking";

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();
    $rootScope.EmployeeID = context.EmployeeID;
    var loginID = context.LoginID;

    $scope.StaffLeaveApplication = null;
    $scope.AttachmentID1 = null;
    $scope.AttachmentID2 = null;

    // $rootScope.ShowLoader = true;

    $scope.init = function () {
        $scope.GetVehicles();
        $scope.LoadVehicleInfo();

    };

    // $scope.DateChange = function() {
    //   var FromDateStringblock = moment($scope.StaffLeaveApplication.FromDateString).format("YYYY-MM-DD");
    //   document.getElementsByName("ToDateString")[0].setAttribute('min', FromDateStringblock);
    // };

    $scope.SubmitVehicleTracking = function () {
        $rootScope.SuccessMessage = "";
        $rootScope.ErrorMessage = "";

        var vehicleTracking = $scope.DriverVehicleTracking;

        if (!vehicleTracking) {
            $rootScope.ToastMessage = "Fill all fields!";
            $rootScope.ShowLoader = false;
            $('.toast').toast('show');
            return false;
        }

        if (!vehicleTracking.VehicleID) {
            $rootScope.ToastMessage = "Vehicle is required";
            $rootScope.ShowLoader = false;
            $('.toast').toast('show');
            return false;
        }

        if (!vehicleTracking.RouteID) {
            $rootScope.ToastMessage = "Route is required";
            $rootScope.ShowLoader = false;
            $('.toast').toast('show');
            return false;
        }
        const journeyPoint = $scope.journeyPoint === 'start' ? 'RouteStartKM' : 'RouteEndKM';



        if (!vehicleTracking.EmployeeID) {
            vehicleTracking.EmployeeID = $scope.EmployeeID;
        }

        const currentDateTime = new Date().toISOString();

        const data = {
            'VehicleTrackingIID': vehicleTracking.VehicleTrackingIID || 0,
            'VehicleID': vehicleTracking.VehicleID,
            'RouteID': vehicleTracking.RouteID,
            'RouteStartKM': vehicleTracking.RouteStartKM,
            'RouteEndKM': vehicleTracking.RouteEndKM,
            'EmployeeID': vehicleTracking.EmployeeID,
        };
        // Set RouteKM and AttachmentID based on the journey point
        if ($scope.journeyPoint === 'start') {
            data['RouteStartKM'] = vehicleTracking.RouteKM;
            // data['StartTime'] = new Date().toISOString(); // Set StartTime when starting the journey
            data['AttachmentID1'] = $scope.AttachmentID; // Set AttachmentID1 for the start
            data['AttachmentID2'] = null; // Clear AttachmentID2 for the start
        } else if ($scope.journeyPoint === 'end') {
            data['RouteEndKM'] = vehicleTracking.RouteKM;
            // data['EndTime'] = new Date().toISOString(); // Set EndTime when ending the journey
            data['AttachmentID2'] = $scope.AttachmentID; // Set AttachmentID2 for the end
            data['AttachmentID1'] = null; // Clear AttachmentID1 for the end
        }



        $http({
            method: 'POST',
            url: dataService + '/SubmitDriverVehicleTracking',
            data: data,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            },
        }).then(function (response) {
            var result = response.data;
            if (result.operationResult == 2 || result.operationResult == 1) {
                $rootScope.ToastMessage = result.Message;
                $('.toast').toast('show');
                $rootScope.ShowLoader = false;
                $scope.MarkDriverAttendanceOnPickupStart();
                $timeout(function () {
                    // $scope.DriverVehicleTracking = null;
                    $rootScope.SuccessMessage = "";
                }, 1000);
            }
        }).catch(function (error) {
            $rootScope.ErrorMessage = "Something went wrong, please try again later!";
            $rootScope.ShowLoader = false;
        });
    };

    document.addEventListener('deviceready', () => {
        document.getElementById("cameraTakePicture").addEventListener("click", handleTakePicture);
        restoreAppState(); // Restore state if needed
    }, false);

    async function handleTakePicture() {
        appState.takingPicture = true;
        saveAppState(); // Save state before attempting to take picture

        try {
            await attemptTakePicture(3);
        } catch (error) {
            console.error("Failed to take picture:", error);
        } finally {
            appState.takingPicture = false;
            saveAppState(); // Save state after taking picture
        }
    }

    async function attemptTakePicture(retries) {
        while (retries > 0) {
            try {
                const imageData = await takePicture();
                await processImage(imageData);
                return; // Exit loop on success
            } catch (error) {
                retries--;
                console.warn(`Retrying... attempts left: ${retries}`, error);
                if (retries > 0) await delay(3000); // Delay before retrying
            }
        }
        throw new Error("Failed to take picture after multiple attempts.");
    }

    function takePicture() {
        return new Promise((resolve, reject) => {
            navigator.camera.getPicture((imageData) => {
                appState.imageUri = "data:image/jpeg;base64," + imageData;
                saveAppState(); // Save state with image data
                resolve(imageData);
            }, reject, {
                quality: 50,
                encodingType: Camera.EncodingType.JPG,
                destinationType: Camera.DestinationType.DATA_URL,
                correctOrientation: true
            });
        });
    }



    // Utility Functions
    function saveAppState() {
        window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(appState));
    }

    function restoreAppState() {
        var storedState = window.localStorage.getItem(APP_STORAGE_KEY);
        if (storedState) {
            appState = JSON.parse(storedState);
            if (appState.imageUri) {
                document.getElementById("myImage").src = appState.imageUri;
            }
        }
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    async function processImage(imageData) {
        const fileName = `visitor_${$scope.VisitorRegistration.FirstName}.jpg`;
        document.getElementById('myImage').src = `data:image/jpeg;base64,${imageData}`;
        await saveUploadedDocument(imageData, fileName);
    }

    async function saveUploadedDocument(data, fileName) {
        const TIMEOUT = 15000;

        try {
            const response = await Promise.race([
                $http.post(`${dataService}/UploadContentAsString`, {
                    "ContentDataString": data,
                    "ContentFileName": fileName,
                }, {
                    headers: {
                        Accept: "application/json;charset=UTF-8",
                        "Content-Type": "application/json; charset=utf-8",
                        "CallContext": JSON.stringify(context)
                    }
                }),
                timeoutPromise(TIMEOUT, "Upload timed out")
            ]);

            $scope.AttachmentID1 = response.data;
            console.log("Document uploaded successfully at", new Date().toISOString());
        } catch (error) {
            console.error("Failed to upload document:", error);
            throw new Error("Failed to upload document");
        }
    }

    function timeoutPromise(ms, message) {
        return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    $scope.GetVehicles = function () {
        $http({
            method: 'GET',
            url: dataService + '/GetVehicles',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            $scope.Vehicles = result;
            $rootScope.ShowLoader = false;
        }).error(function () {
            $rootScope.ShowLoader = false;
        });
    };

    $scope.LoadVehicleInfo = function () {
        $http({
            method: 'GET',
            url: dataService + '/GetVehicleDetailsByEmployeeLoginID',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            $scope.VehiclesDetails = result;
            $rootScope.ShowLoader = false;
        }).error(function () {
            $rootScope.ShowLoader = false;
        });
    }

    $scope.getRoutesByVehicleID = function (vehicleID) {
        $http({
            method: 'GET',
            url: dataService + '/GetRoutesByVehicleID?vehicleID=' + vehicleID,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).then(function (response) {
            $scope.RoutesDetails = response.data;
        }).catch(function (error) {
            console.error('Error fetching routes:', error);
        });
    };

    $scope.MarkDriverAttendanceOnPickupStart = function (vehicleID) {
        $http({
            method: 'GET',
            url: dataService + '/MarkDriverAttendanceOnPickupStart',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).then(function (response) {

        }).catch(function (error) {
            console.error('Error fetching routes:', error);
        });
    };



    $scope.init();
}]);