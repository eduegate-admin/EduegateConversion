app.controller('TransportApplicationStatusController', ['$scope', '$http', '$state',
    'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext',
     '$sce', '$timeout', function ($scope, $http, $state, rootUrl, $location,
         $rootScope, $stateParams, GetContext, $sce, $timeout) {
    console.log('TransportApplicationStatusController loaded.');
    var dataService = rootUrl.SchoolServiceUrl;
    $scope.parentPortal = rootUrl.ParentUrl;

    var context = GetContext.Context();
    $scope.TransportApplications = [];

    $rootScope.ShowLoader = true;

    $scope.init = function() {

    };

    $scope.LoadTransportApplicationInfo = function () {
        $http({
            method: 'GET',
            url: dataService + '/GetTransportApplications',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            $scope.TransportApplications = result;
            $rootScope.ShowLoader = false;
        }).error(function (){
            $rootScope.ShowLoader = false;
        });
    };

     $scope.init();
}]);
