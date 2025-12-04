app.controller('HomeController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', 'loggedIn', 'offlineSync', 'clientSettings',
    function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, loggedIn, $offlineSync, clientSettings) {
        console.log('Home controller loaded.');

        var dataService = rootUrl.RootUrl;
        var context = GetContext.Context();
        $scope.DashbaordType = 1;
        $scope.UserName = context.EmailID;
        $scope.IsLoggedIn = false;

        $scope.to_trusted = function (html_code) {
            return $sce.trustAsHtml(html_code);
        };

        $rootScope.UserClaimSets = context.UserClaimSets;

        function goToLogin() {
            console.log("Attempting to redirect to:", clientSettings.DefaultLoginState);
            $state.go(clientSettings.DefaultLoginState, null, { reload: true });
        }
        
        $scope.Init = function () {
            $rootScope.ShowLoader = true;

            var loggedInPromise = loggedIn.CheckLogin(context, dataService);
            loggedInPromise.then(function (model) {

                if (model.data != null && model.data != undefined) {
                    if (!model.data.LoginID) {
                        $rootScope.ShowLoader = false;
                        goToLogin(); // error case
                    }
                    else {
                        $scope.IsLoggedIn = true;
                        $rootScope.ShowLoader = false;
                        if ($rootScope.UserClaimSets.some(code => code.Value === 'Driver')){
                            $scope.DashbaordType = 1;
                
                        }
                        if ($rootScope.UserClaimSets.some(code => code.Value === 'Director')){
                            $scope.DashbaordType = 4;
                        }
                    }
                }
                else {
                    $rootScope.ShowLoader = false;
                     goToLogin(); // error case
                }
            });
        };       
    }]);