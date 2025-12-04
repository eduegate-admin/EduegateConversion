app.controller('ClassTeacherController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce) {
    console.log('ClassTeacherController loaded.');

    var dataService = rootUrl.SchoolServiceUrl;

    $scope.ContentService = rootUrl.ContentServiceUrl;

    var context = GetContext.Context();
    $scope.TeacherDetails = [];

    $rootScope.ShowPreLoader = true;
    $rootScope.ShowLoader = true;

    $scope.StudentID = $stateParams.studentID;

    $scope.Init = function () {
        $scope.classTeacherDetail($scope.StudentID);
    };

    $scope.classTeacherDetail = function (studentId) {
        $scope.TeacherDetails = [];

        $http({
            method: 'GET',
            url: dataService + '/GetTeacherDetails?studentID=' + $scope.StudentID,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            $scope.TeacherDetails = result;

            $rootScope.ShowLoader = false;
            $rootScope.ShowPreLoader = false;
        }).error(function () {
            $rootScope.ShowLoader = false;
        });
    };

    $scope.toggleGrid = function (event) {
        toggleHeader = $(event.currentTarget).closest(".toggleContainer").find(".toggleHeader");
        toggleContent = $(event.currentTarget).closest(".toggleContainer").find(".toggleContent");
        toggleHeader.toggleClass("active");
        if (toggleHeader.hasClass('active')) {
            toggleContent.slideDown("fast");
        }
        else {
            toggleContent.slideUp("fast");
        }
    }

}]);