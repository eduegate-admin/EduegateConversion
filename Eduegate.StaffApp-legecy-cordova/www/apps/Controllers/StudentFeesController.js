app.controller('StudentFeesController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce) {
    console.log('StudentFeesController loaded.');
    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();
    $scope.FeesCollected = [];
    $scope.init = function() {
        $http({
            method: 'GET',
            url: dataService + '/GetFeeCollected?studentID=' + $scope.SelectedWard.StudentIID,
            data: $scope.user,
            headers: { 
                "Accept": "application/json;charset=UTF-8", 
                "Content-type": "application/json; charset=utf-8", 
                "CallContext": JSON.stringify(context) 
            }
        }).success(function (result) {
            $scope.FeesCollected = result;
        });
    }

    $scope.init();
}]);