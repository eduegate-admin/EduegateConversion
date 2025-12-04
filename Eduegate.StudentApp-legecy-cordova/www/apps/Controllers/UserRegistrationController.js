app.controller('UserRegistrationController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', '$state', '$stateParams', '$sce', '$rootScope', function ($scope, $http, loggedIn, rootUrl, $location, GetContext, $state, $stateParams, $sce, $rootScope) {
    var dataService = rootUrl.UserServiceUrl;
    var context = GetContext.Context();
    $rootScope.ShowLoader = true;
    $scope.Id = $state.params.id;
    $scope.isAnonymous = true;

    if($state.params.isAnonymous) {
        $scope.isAnonymous = ($state.params.isAnonymous == "true");
    }

    $scope.init = function () {
        //$scope.ScheduleDate = new Date();        
        $rootScope.ShowLoader = false;

        if($scope.Id) {
            load($scope.Id);
        }
    };
    
    function load(id) {
        $http({
            url: dataService + "/GetUser?loginId=" + id,
            method: 'GET',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(context) },
        }).success(function (result) {
            $scope.Model = result;
            $rootScope.ShowLoader = false;
        });
    }

    $scope.init();   

    $scope.back = function() {
        $state.go("home");        
    }

}]);