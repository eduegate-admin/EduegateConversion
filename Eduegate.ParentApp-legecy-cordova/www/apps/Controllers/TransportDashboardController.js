app.controller('TransportDashboardController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', 'serviceCartCount', '$state', '$stateParams', '$sce', '$rootScope', 'serviceAddToCart', '$q', "$translate", function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount, $state, $stateParams, $sce, $rootScope, serviceAddToCart, $q, $translate) {
    var context = GetContext.Context();
    var appDataUrl = rootUrl.RootUrl;
    var dataService = rootUrl.SchoolServiceUrl;
    $scope.ContentService = rootUrl.ContentServiceUrl;
    $scope.showIcons = false;


    $scope.ClientAppDownloadLink = '';


    $scope.init = function () {

        $q.all([
            $rootScope.getDefaultStudent()

        ]).then(function () {
            $scope.GetDriverDetailsByStudent();

        });

    }

    $scope.GetDriverDetailsByStudent = function () {
        $http({
            url:
                dataService +
                '/GetDriverDetailsByStudent?studentID=' + $scope.DefaultStudent.DefaultStudentID,
            method: "GET",
            headers: {
                Accept: "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                CallContext: JSON.stringify(context),
            },
        }).then(function (result) {
            if (result) {
                result = result.data;
                $scope.DriverDetails = result;
                console.log($scope.DriverDetails.EmployeeCode);
            }
        });
    };



    $scope.DriverLocationClick = function () {
        if (!$scope.DefaultStudent.DefaultStudentID) {
            $translate(['SELECTSTUDENT']).then(function (translation) {
                $rootScope.ShowToastMessage(translation.SELECTSTUDENT);
            });

        }

        else if ($scope.DriverDetails.EmployeeCode == null) {
            $translate(['NOTRANSPORTFORSTUDENT']).then(function (translation) {
                $rootScope.ShowToastMessage(translation.NOTRANSPORTFORSTUDENT);
            });

        } else {
            $state.go("driverlocation", { studentID: $scope.DefaultStudent.DefaultStudentID });
        }

    }
    $scope.DriverDetailsClick = function () {
        if (!$scope.DefaultStudent.DefaultStudentID) {
            $translate(['SELECTSTUDENT']).then(function (translation) {
                $rootScope.ShowToastMessage(translation.SELECTSTUDENT);
            });

        }

        else if ($scope.DriverDetails.EmployeeCode == null) {
            $translate(['NOTRANSPORTFORSTUDENT']).then(function (translation) {
                $rootScope.ShowToastMessage(translation.NOTRANSPORTFORSTUDENT);
            });
        }
        else {
            $state.go("driverdetails", { studentID: $scope.DefaultStudent.DefaultStudentID });

        }
    }
    $('.main-carousel').flickity({
        // options
        cellAlign: 'left',
        contain: true,
        wrapAround: true,
        autoPlay: true,
        adaptiveHeight: true,
        pageDots: false,
        dragThreshold: 10,
        imagesLoaded: true,
        prevNextButtons: false,
});

}]);