app.controller('StudentProfileController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce) {
    console.log('StudentProfileController loaded.');

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();

    $scope.ContentService = rootUrl.ContentServiceUrl;

    $scope.StudentDetail = {};

    $scope.ProfileFile = null;

    $rootScope.ShowLoader = true;

    $scope.StudentID = $stateParams.studentID;

    $scope.init = function() {
    }

    $scope.LoadStudentInfo = function() {
        $http({
            method: 'GET',
            url: dataService + '/GetStudentDetailsByStudentID?studentID=' + $scope.StudentID,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
           $scope.StudentDetail= result;

           $rootScope.ShowLoader = false;
        })
        .error(function(){
            $rootScope.ShowLoader = false;
        });
    }

    $scope.init();
}]);