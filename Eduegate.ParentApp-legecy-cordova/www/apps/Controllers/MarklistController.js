app.controller('MarkListController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce) {
    console.log('Mark List Controller loaded.');

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();

    $scope.StudentID = $stateParams.studentID;

    $scope.MarkLists = [];

    $scope.Init = function () {
        $http({
            method: 'GET',
            url: dataService + '/GetMarkList?studentID=' + $scope.StudentID,
            data: $scope.user,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            $scope.MarkLists = result;
        });
    }

}]);