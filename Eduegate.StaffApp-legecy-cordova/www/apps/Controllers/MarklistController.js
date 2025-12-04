app.controller('MarklistController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce) {
    console.log('MarklistController loaded.');
    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();
    $scope.MarkLists = [];

    $rootScope.ShowLoader = true;

    $scope.init = function() {
        $http({
            method: 'GET',
            url: dataService + '/GetMarkListForTeacher',
            data: $scope.user,
            headers: { 
                "Accept": "application/json;charset=UTF-8", 
                "Content-type": "application/json; charset=utf-8", 
                "CallContext": JSON.stringify(context) 
            }
        }).success(function (result) {
            $scope.MarkLists = result;

            $rootScope.ShowLoader = false;
        })
        .error(function(){
            $rootScope.ShowLoader = false;
        });
    }

    $scope.init();
}]);