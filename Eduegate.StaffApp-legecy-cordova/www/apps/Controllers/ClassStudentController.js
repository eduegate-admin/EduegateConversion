app.controller('ClassStudentController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce) {
    console.log('Class Student Controller loaded.');
    $scope.PageName = "Class student";

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();

      $scope.ContentService = rootUrl.ContentServiceUrl;

    $scope.StudentMoreDetails = false;
    $scope.StudentFullDetails = false;

    $rootScope.ShowLoader = true;
    $rootScope.ShowPreLoader = true;

    $scope.studentID = $stateParams.studentID;

    $scope.StudentDetails = {};

    $scope.Init = function () {
        $scope.LoadStudentInfo($scope.ClassID, $scope.SectionID)
    }

    $scope.LoadStudentInfo = function (classID, sectionID) {

        $http({
            method: 'GET',
            url: dataService + '/GetStudentDetailsByStudentID?studentID=' +   $scope.studentID,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            $scope.student = result;

            $rootScope.ShowLoader = false;
            $rootScope.ShowPreLoader = false;
        }).error(function (err) {
            $rootScope.ShowLoader = false;
            $rootScope.ShowPreLoader = false;
        });

    }

    $scope.ViewStudentLessDetails = function () {
        $scope.StudentMoreDetails = false;
        $scope.StudentFullDetails = false;
    }

    $scope.ViewStudentFullDetails = function () {
        $scope.StudentMoreDetails = false;
        $scope.StudentFullDetails = true;
    }

}]);