app.controller('MyWardsController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce) {
    console.log('MyWardsController loaded.');
    $scope.PageName = "Academics";

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();

    $scope.MyClassCount = 0;
    $scope.MyAssignmentCount = 0;
    $scope.LessonPlanCount = 0;
    $scope.NotificationCount = 0;
    $scope.CircularCount = 0;
    $scope.Driver = false
    $scope.Teacher = false

    $rootScope.UserClaimSets = context.UserClaimSets;

    if ($rootScope.UserClaimSets.some(code => code.Value === 'Driver')) {
        $scope.Driver = true
    }
    if ($rootScope.UserClaimSets.some(code => code.Value === 'Class Teacher')) {
        $scope.Teacher = true
    }

    $rootScope.ShowLoader = true;

    $scope.Init = function () {

        $scope.GetNotificationCount();
        $scope.GetMyClassCount();
        $scope.GetAssignmentsCount();
        $scope.GetLessonPlanCount();
        $scope.GetCircularCount();
    }

    $scope.GetNotificationCount = function () {
        $http({
            method: 'GET',
            url: dataService + '/GetMyNotificationCount',
            data: $scope.user,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            $scope.NotificationCount = result;
        }).error(function (err) {
            $rootScope.ShowLoader = false;
        });
    };

    $scope.GetMyClassCount = function () {

        $http({
            method: 'GET',
            url: dataService + '/GetMyClassCount',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            $scope.MyClassCount = result;

            $rootScope.ShowLoader = false;
        }).error(function () {
            $rootScope.ShowLoader = false;
        });
    };

    $scope.GetAssignmentsCount = function () {

        $http({
            method: 'GET',
            url: dataService + '/GetEmployeeAssignmentsCount',
            data: $scope.user,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            $scope.MyAssignmentCount = result;
        }).error(function (err) {
            $rootScope.ShowLoader = false;
        });
    };

    $scope.GetLessonPlanCount = function () {

        $http({
            method: 'GET',
            url: dataService + '/GetMyLessonPlanCount',
            data: $scope.user,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            $scope.LessonPlanCount = result;
        }).error(function (err) {
            $rootScope.ShowLoader = false;
        });
    };

    $scope.GetCircularCount = function () {

        $http({
            method: 'GET',
            url: dataService + '/GetLatestStaffCircularCount',
            data: $scope.user,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            $scope.CircularCount = result;
        });
    };

}]);