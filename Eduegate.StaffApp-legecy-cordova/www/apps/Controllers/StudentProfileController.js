app.controller('StudentProfileController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce) {
    console.log('StudentProfileController loaded.');
    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();
    $scope.StudentDetail = {};

    $scope.init = function() {
        
    }

    $scope.LoadStudentInfo = function(selectedWard) {
        $http({
            method: 'GET',
            url: dataService + '/GetStudentDetails?studentID=' + selectedWard.StudentIID,
            headers: { 
                "Accept": "application/json;charset=UTF-8", 
                "Content-type": "application/json; charset=utf-8", 
                "CallContext": JSON.stringify(context) 
            }
        }).success(function (result) {
           $scope.StudentDetail= result;
        });
    }

    $scope.init();
}]);