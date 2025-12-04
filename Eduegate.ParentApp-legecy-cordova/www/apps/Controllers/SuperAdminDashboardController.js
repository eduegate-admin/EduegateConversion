app.controller('SuperAdminDashboardController', ['$scope', '$http', 'loggedIn', 'rootUrl',
    '$location', 'GetContext', '$state', '$stateParams', '$sce', '$rootScope', '$q', 'clientSettings','FlickityService', '$timeout',
    function ($scope, $http, loggedIn, rootUrl, $location, GetContext, $state, $stateParams, $sce, $rootScope,
        $q, clientSettings, FlickityService , $timeout ) {

        var schoolService = rootUrl.SchoolServiceUrl;
        var appDataService = rootUrl.RootUrl;
        var CommunicationServiceUrl = rootUrl.CommunicationServiceUrl;
        // console.log(CommunicationServiceUrl)

        var context = GetContext.Context();

        $rootScope.ClientSettings = clientSettings;

        $rootScope.ShowLoader = true;
        $rootScope.UserName = context.EmailID;
        $scope.MyWardsCount = 0;
        $scope.NewAssignmentCount = 0;
        $scope.NewAgendaCount = 0;
        $scope.FeeDueAmount = 0;
        $scope.NewCircularCount = 0
        $scope.TotalFee = 0;
        $scope.ExamCount = 0;
        $scope.ApplicationCount = 0;
        $scope.PickupRequestCount = 0;
        $scope.PickupRegisteredCount = 0;
        $rootScope.ShowFilter = true;
        $rootScope.ShowPreLoader = true;
        $scope.NotificationCount = 0;
        $scope.HomeBanners = [];

        $scope.init = function () {
            $rootScope.ShowLoader = false;
            $q.all([
                $scope.GetMyStudents(),
                // GetMyAssignmentsCount(),
                GetPickupRequestCount(),
                GetPickupRegisterCount(),
                // GetMyStudentsSiblingsCount(),
                GetFeeDueAmount(),
                // GetLatestCircularCount(),
                // StudentApplications(),
                // ExamCount(),
                // GetMyAgendaCount(),
                GetNotificationCount(),
            ]).then(function () {
                $rootScope.ShowPreLoader = false;
            });


            const element = angular.element(document.getElementById('demo-slider1'));
            const flickityOptions = {
              cellAlign: 'left',
                                  contain: true,
                                  wrapAround: true,
                                  autoPlay: true,
                                  adaptiveHeight: false,
                                  pageDots: false,
                                  dragThreshold: 10,
                                  imagesLoaded: true,
                                  prevNextButtons: false,
          }
            $timeout(() => {
                // Initialize our Flickity instance
                FlickityService.create(element[0], element[0].id,flickityOptions);
            });
            $scope.HomeBanners = [
                {
                    imageUrl: 'clients/'+ $rootScope.ClientSettings.Client + '/images/homebanner1.png',
                },
                {
                    imageUrl: 'clients/'+ $rootScope.ClientSettings.Client + '/images/homebanner2.png',
                },
                {
                    imageUrl: 'clients/'+ $rootScope.ClientSettings.Client + '/images/homebanner3.png',
                }
            ];
        };

        // function GetMyAssignmentsCount() {
        //     return $q(function (resolve, reject) {
        //         $http({
        //             method: 'GET',
        //             url: schoolService + '/GetMyAssignmentsCount',
        //             data: $scope.user,
        //             headers: {
        //                 "Accept": "application/json;charset=UTF-8",
        //                 "Content-type": "application/json; charset=utf-8",
        //                 "CallContext": JSON.stringify(context)
        //             }
        //         }).success(function (result) {
        //             $scope.NewAssignmentCount = result;
        //         });
        //     });
        // }

        function GetPickupRequestCount() {
            return $q(function (resolve, reject) {
                $http({
                    method: 'GET',
                    url: schoolService + '/GetPickupRequestsCount',
                    data: $scope.user,
                    headers: {
                        "Accept": "application/json;charset=UTF-8",
                        "Content-type": "application/json; charset=utf-8",
                        "CallContext": JSON.stringify(context)
                    }
                }).success(function (result) {
                    $scope.PickupRequestCount = result;
                });
            });
        }

        function GetPickupRegisterCount() {
            return $q(function (resolve, reject) {
                $http({
                    method: 'GET',
                    url: schoolService + '/GetPickupRegisterCount',
                    data: $scope.user,
                    headers: {
                        "Accept": "application/json;charset=UTF-8",
                        "Content-type": "application/json; charset=utf-8",
                        "CallContext": JSON.stringify(context)
                    }
                }).success(function (result) {
                    $scope.PickupRegisteredCount = result;
                });
            });
        }

        function GetMyStudentsSiblingsCount() {
            return $q(function (resolve, reject) {
                $http({
                    method: 'GET',
                    url: schoolService + '/GetMyStudentsSiblingsCount',
                    data: $scope.user,
                    headers: {
                        "Accept": "application/json;charset=UTF-8",
                        "Content-type": "application/json; charset=utf-8",
                        "CallContext": JSON.stringify(context)
                    }
                }).success(function (result) {
                    $scope.MyWardsCount = result;
                    $rootScope.ShowPreLoader = false;
                    resolve();
                });
            });
        }

        function GetFeeDueAmount() {
            return $q(function (resolve, reject) {
                $http({
                    method: 'GET',
                    url: schoolService + '/GetFeeDueAmount    ',
                    data: $scope.user,
                    headers: {
                        "Accept": "application/json;charset=UTF-8",
                        "Content-type": "application/json; charset=utf-8",
                        "CallContext": JSON.stringify(context)
                    }
                }).success(function (result) {
                    $scope.FeeDueAmount = result;
                });
            });
        }


        $scope.today = new Date();
        $scope.todayDay = (new Date()).getDay();

        function GetLatestCircularCount() {
            return $q(function (resolve, reject) {
                $http({
                    method: 'GET',
                    url: schoolService + '/GetLatestCircularCount',
                    data: $scope.user,
                    headers: {
                        "Accept": "application/json;charset=UTF-8",
                        "Content-type": "application/json; charset=utf-8",
                        "CallContext": JSON.stringify(context)
                    }
                }).success(function (result) {
                    $scope.NewCircularCount = result;
                    resolve();
                });
            });
        }
        function StudentApplications() {
            return $q(function (resolve, reject) {
                $http({
                    method: 'GET',
                    url: schoolService + '/GetApplicationCount',
                    data: $scope.user,
                    headers: {
                        "Accept": "application/json;charset=UTF-8",
                        "Content-type": "application/json; charset=utf-8",
                        "CallContext": JSON.stringify(context)
                    }
                }).success(function (result) {
                    $scope.ApplicationCount = result;
                });
            });
        }

        function GetMyAgendaCount() {
            return $q(function (resolve, reject) {
                $http({
                    method: 'GET',
                    url: schoolService + '/GetMyAgendaCount',
                    data: $scope.user,
                    headers: {
                        "Accept": "application/json;charset=UTF-8",
                        "Content-type": "application/json; charset=utf-8",
                        "CallContext": JSON.stringify(context)
                    }
                }).success(function (result) {
                    $scope.NewAgendaCount = result;
                });
            });
        }

        function ExamCount() {
            return $q(function (resolve, reject) {
                $http({
                    method: 'GET',
                    url: schoolService + '/GetExamCount',
                    data: $scope.user,
                    headers: {
                        "Accept": "application/json;charset=UTF-8",
                        "Content-type": "application/json; charset=utf-8",
                        "CallContext": JSON.stringify(context)
                    }
                }).success(function (result) {
                    $scope.ExamCount = result;
                });
            });
        }

        function GetNotificationCount() {
            return $q(function (resolve, reject) {
                $http({
                    method: 'GET',
                    url: schoolService + '/GetMyNotificationCount',
                    data: $scope.user,
                    headers: {
                        "Accept": "application/json;charset=UTF-8",
                        "Content-type": "application/json; charset=utf-8",
                        "CallContext": JSON.stringify(context)
                    }
                }).success(function (result) {
                    $scope.NotificationCount = result;
                })
                    .error(function () {
                        // $rootScope.ShowLoader = false;
                    });
            });
        }

        $scope.OnlineStoreClick = function () {

            $http({
                method: 'POST',
                url: appDataService + '/CheckLoginforCustomer',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            }).success(function (result) {

                $state.go('onlinestore');
                $rootScope.ShowLoader = false;
                $rootScope.ShowPreLoader = false;
            });
        }
        // $('.main-carousel').flickity({
        //     // options
        //     cellAlign: 'left',
        //     contain: true,
        //     wrapAround: true,
        //     autoPlay: true,
        //     adaptiveHeight: true,
        //     pageDots: false,
        //     dragThreshold: 10,
        //     imagesLoaded: true,
        //     prevNextButtons: false,
        // });
        $scope.GetMyStudents = function () {
            $http({
                method: 'GET',
                url: `${schoolService}/GetMyStudents`,
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            }).then(function (response) {
                $scope.MyWards = response.data;
                $scope.MyWards.forEach(student => {
                    $scope.GetStudentInOutVehicleStatus(student.StudentIID, student.StudentFullName); // Assuming StudentID and StudentName properties
                });
            }).catch(function (error) {
                console.error("Error fetching students: ", error);
            });
        };

        $scope.GetStudentInOutVehicleStatus = function (StudentID, StudentName) {
            $http({
                method: "GET",
                url: `${schoolService}/GetStudentInOutVehicleStatus?studentID=${StudentID}`,
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context),
                }
            }).then(function (response) {
                const result = response.data;
                if (result) {
                    $scope.StudentInOutVehicleStatus = result;
                    console.log($scope.StudentInOutVehicleStatus);
                    if ($scope.StudentInOutVehicleStatus) {
                        $rootScope.Message = `Student ${StudentName} vehicle tracking available`;
                        $rootScope.ButtonText = "Track";
                        const toastContainer = document.getElementById('toastContainer');
                        const toastId = `toast-${StudentID}`;
                        const toastHTML = `
                            <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                                <div class="d-flex flex-center p-2">
                                    <button type="button" class="btn btn-icon btn-sm btn-secondary btn-close me-3" data-bs-dismiss="toast" aria-label="Close"></button>
                                    <div class="me-2">
                                        <a class="text-gray-800 text-hover-primary fs-4 fw-bolder">${$rootScope.Message}</a>
                                        <span class="text-gray-700 fw-semibold d-block fs-5"></span>
                                    </div>
                                    <button class="btn btn-sm btn-primary rounded-2 shadow-none fs-3 fw-bolder track-button" data-student-id="${StudentID}">
                                        <span>${$rootScope.ButtonText}</span>
                                    </button>
                                </div>
                            </div>
                        `;
                        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
                        const toastElement = document.getElementById(toastId);
                        const toast = new bootstrap.Toast(toastElement, {
                            // autohide: false,
                        });
                        toast.show();

                        // Compile the new button with AngularJS
                        const trackButton = toastElement.querySelector('.track-button');
                        trackButton.addEventListener('click', function() {
                            $scope.DriverLocationClick(StudentID);
                            $scope.$apply();
                        });
                    }
                }
            }).catch(function (error) {
                console.error("Error fetching vehicle status: ", error);
            });
        };

        $scope.DriverLocationClick = function (StudentID) {
            $state.go("driverlocation", { studentID: StudentID });
        };



        $scope.init();

    }]);