app.controller('IDCardController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce) {
    console.log('IDCardController loaded.');
    $scope.PageName = "ID Card";

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();

    $scope.ContentService = rootUrl.ContentServiceUrl;
    $scope.Profile = null;
    $scope.onProfileFilling = true;

    $scope.init = function () {
        $scope.LoadProfileInfo();
    };

    function generateQRCodeUrl(employeeCode) {
        const baseUrl = 'https://quickchart.io/chart';
        const queryParams = new URLSearchParams({
            chs: '300x300',  // Size of the QR code
            cht: 'qr',       // QR code chart type
            chl: employeeCode // The data to encode
        });
        return `${baseUrl}?${queryParams.toString()}`;
    }

    function setQRCode(employeeCode) {
        const qrCodeUrl = generateQRCodeUrl(employeeCode);
        document.getElementById('qrcode-img').src = qrCodeUrl;
    }

    $scope.LoadProfileInfo = function () {
        $http({
            method: 'GET',
            url: dataService + '/GetStaffProfile',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            $scope.Profile = result;

            if ($scope.Profile == null) {
                $scope.onProfileFilling = false;
            } else {
                setQRCode($scope.Profile.EmployeeCode);  // Generate and set QR code once profile is loaded
            }

            $rootScope.ShowLoader = false;
            $rootScope.ShowPreLoader = false;

        }).error(function (err) {
            $rootScope.ShowLoader = false;
            $rootScope.ShowPreLoader = false;
        });
    };

    // Call init to load profile info when the controller is initialized
    // $scope.init();
}]);
