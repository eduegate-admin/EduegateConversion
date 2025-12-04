app.controller('HomeController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', 'loggedIn', 'clientSettings',function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, loggedIn, clientSettings) {
    console.log('Home controller loaded.');

    var dataService = rootUrl.RootUrl;
    var schoolService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();
    $scope.DashbaordType = 1;
    $scope.UserName = context.EmailID;
    $scope.VisitorProfileID = null;
    $scope.IsLoggedIn = false;
    $scope.QID = $stateParams.QID;
    $scope.PassportNumber = $stateParams.PassportNumber;
    $scope.UserDetails = null;

    $scope.to_trusted = function (html_code) {
        return $sce.trustAsHtml(html_code);
    };
    function goToLogin() {
        console.log("Attempting to redirect to:", clientSettings.DefaultLoginState);
        $state.go(clientSettings.DefaultLoginState, null, { reload: true });
    }
    $scope.Init = function () {
        $rootScope.ShowLoader = false;
        $rootScope.ShowPreLoader = false;

        if (context.LoginID)
        {
            var loggedInPromise = loggedIn.CheckLogin(context, dataService);
            loggedInPromise.then(function (model) {
    
                if (model.data != null && model.data != undefined) {
                    if (!model.data.LoginID) {
                        goToLogin(); // error case
                    }
                    else{
                        $scope.IsLoggedIn = true;
                        $scope.FillUserDetails();
                    }
                }
                else{
                    goToLogin(); // error case
                }
            });
        }
        else{
            goToLogin(); // error case
        }
        
    };

    $scope.FillUserDetails = function () {
        $http({
            method: "GET",
            url: schoolService + "/GetVisitorDetailsByLoginID?loginID=" + context.LoginID,
            headers: {
                Accept: "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                CallContext: null,
            },
        }).success(function (result) {
            if (result) {
                $scope.UserDetails = result;

                $scope.VisitorProfileID = $scope.UserDetails?.VisitorAttachmentMapDTOs[0]?.VisitorProfileID;
            }
            else{
                goToLogin(); // error case
                $rootScope.ShowButtonLoader = false;
                $scope.IsLoggedIn = false;
            }
        }).error(function (err) {
            $rootScope.ErrorMessage = "Please try later";
            $scope.Message = "Please try later";
            $rootScope.ShowButtonLoader = false;
            $scope.IsLoggedIn = false;
        });
    };

}]);