app.controller('ProfileController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', 'serviceCartCount', '$state', '$stateParams', '$sce', '$rootScope', function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount, $state, $stateParams, $sce, $rootScope) {

    var schoolService = rootUrl.SchoolServiceUrl;
    var dataService = rootUrl.RootUrl;

    var context = GetContext.Context();

    $scope.SaveForLaterCount = 0;
    $scope.ShoppingCartCount = 0;
    $scope.ContentService = rootUrl.ContentServiceUrl;

    $scope.NewComment = "";
    $rootScope.ShowLoader = false;

    console.log('Profile Controller loaded.');



    $scope.forceUnknownOption = function () {
        $scope.data.singleSelect = 'nonsense';
    };


    $scope.init = function () {
        $scope.GetUserDetail();

        $http({
            method: 'GET',
            url: schoolService + '/GetMyStudents',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            $scope.MyWards = result;
            $scope.SelectedWard = $scope.MyWards[0];
            $rootScope.ShowLoader = false;

        });
    }

    $scope.GetUserDetail = function () {
        $rootScope.ShowLoader = true;
        $http({
            method: 'GET',
            url: dataService + '/GetUserDetails',
            headers: {
                "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(context)
            }
        }).then(function (result) {
            $scope.UserDetail = result.data;
            $rootScope.ShowLoader = false;

        }, function (err) {
            $rootScope.ShowLoader = false;

        });
    }

    $scope.ProfileEditViewClick = function(){
        $state.go("editprofile", { studentID: $scope.SelectedWard.StudentIID });
    }

    // $scope.init();

}]);