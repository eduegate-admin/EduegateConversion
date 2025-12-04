app.controller('OfflineController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', 'loggedIn', '$rootScope', 'mySharedService', '$timeout', '$translate', '$indexedDB', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, loggedIn, $rootScope, mySharedService, $timeout, $translate, $indexedDB) {
    console.log('Offline Controller loaded.');
    var userDataService = rootUrl.UserServiceUrl;
    var dataService = rootUrl.RootUrl;
    var Context = GetContext.Context();
    $rootScope.Driver = false
    $scope.Teacher = false
    $rootScope.UserClaimSets = Context.UserClaimSets;
    if ($rootScope.UserClaimSets.some(code => code.Value === 'Driver')){
        $rootScope.Driver = true
    }

    $scope.ButtonClick = function (type) {
        if (type == "DriverSchedule") {
            $state.go("driverschedule");
        }
    }

    $scope.RemoveSideMenu = function () {
        $('body').removeClass('active');
        $('html').removeClass('active');
    }

}]);