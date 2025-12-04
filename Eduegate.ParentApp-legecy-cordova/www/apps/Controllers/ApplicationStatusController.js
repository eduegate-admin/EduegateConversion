app.controller('ApplicationStatusController', ['$scope', '$http', '$state',
    'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext',
     '$sce', '$timeout', function ($scope, $http, $state, rootUrl, $location,
         $rootScope, $stateParams, GetContext, $sce, $timeout) {
    console.log('ApplicationStatusController loaded.');
    var dataService = rootUrl.SchoolServiceUrl;
    $scope.parentPortal = rootUrl.ParentUrl;

    var context = GetContext.Context();
    $scope.Applications = [];

    $scope.init = function() {
        $rootScope.ShowPreLoader = true;
        $rootScope.ShowLoader = true;

        $http({
            method: 'GET',
            url: dataService + '/GetStudentApplication',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            $timeout(function() {
                $scope.$apply(function() {
                    $scope.Applications = result;
                });
            });

            $rootScope.ShowPreLoader = false;
            $rootScope.ShowLoader = false;
        });
    }

     $scope.init();
}]);
