app.controller('ContactUsController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', 'serviceCartCount', '$state', '$stateParams', '$sce', '$rootScope', '$timeout', function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount, $state, $stateParams, $sce, $rootScope, $timeout) {
    var dataService = rootUrl.RootUrl;
    $scope.SaveForLaterCount = 0;
    $scope.ShoppingCartCount = 0;
    var Context = GetContext.Context();
   
    $scope.init = function () {
        $scope.GetShoppingCartCount();
        $scope.GetSaveForCartCount();

        $timeout(function () {
            $(function () {
                $("#accordion2").accordion();
            });
        });
    }

    $scope.GetShoppingCartCount = function () {
        var cartPromise = serviceCartCount.getProductCount(Context, dataService);
        cartPromise.then(function (result) {
            $scope.ShoppingCartCount = result.data;
        });

    }

    $scope.GetSaveForCartCount = function () {
        var loggedInPromise = loggedIn.CheckLogin(Context, dataService);
        loggedInPromise.then(function (model) {

            if (model.data != null && model.data != undefined) {
                if (model.data.LoginEmailID != null && model.data.LoginEmailID != undefined && model.data.LoginEmailID != "") {
                    //Loggedin User
                    $scope.LoggedIn = true;
                    var SaveForLaterCountPromise = serviceCartCount.getSaveForLaterCount(Context, dataService);
                    SaveForLaterCountPromise.then(function (result) {
                        $scope.SaveForLaterCount = result.data;
                    });
                }
            }
        });
    }

    $scope.OptionClick = function () {
        $('.rightnav-cont').toggle();
    }

    $scope.init();
}]);