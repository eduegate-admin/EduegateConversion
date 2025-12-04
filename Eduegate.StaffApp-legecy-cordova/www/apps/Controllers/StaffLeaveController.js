app.controller('StaffLeaveController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce) {
    console.log('StaffLeaveController loaded.');
    $scope.PageName = "My Leaves";

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();
    $scope.Leaves = [];
    $scope.showAddBtn = true;
    $scope.onClickCreateButton = false;

    $rootScope.ShowLoader = true;

    $scope.init = function() {
        $http({
            method: 'GET',
            url: dataService + '/GetStaffLeaveApplication',
            data: $scope.user,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            $scope.Leaves = result;

            $rootScope.ShowLoader = false;
        })
        .error(function(){
            $rootScope.ShowLoader = false;
        });
    }

    // $scope.init();
}]);