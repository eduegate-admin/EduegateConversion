app.controller('StudentLeaveController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce) {
    console.log('StudentLeaveController loaded.');
    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();
    $scope.Leaves = [];
    $scope.showAddBtn = true;
    $scope.init = function() {
        $http({
            method: 'GET',
            url: dataService + '/GetLeaveApplication?studentID=' + $scope.SelectedWard.StudentIID,
            data: $scope.user,
            headers: { 
                "Accept": "application/json;charset=UTF-8", 
                "Content-type": "application/json; charset=utf-8", 
                "CallContext": JSON.stringify(context) 
            }
        }).success(function (result) {
            $scope.Leaves = result;
        });
    }

    $scope.init();
}]);