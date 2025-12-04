app.controller('ChangePasswordController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', 'serviceCartCount', '$state', '$stateParams', '$sce', '$filter', 'serviceAddToCart', '$rootScope', function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount, $state, $stateParams, $sce, $filter, serviceAddToCart, $rootScope) {
    var Context = GetContext.Context();
    var dataService = rootUrl.RootUrl;

    $scope.ShoppingCartCount = 0;
    $scope.SaveForLaterCount = 0;

    $scope.ResultMessage = "";
    //$scope.OldPassword = "";
    //$scope.NewPassword = "";
    $scope.ConfirmNewPassword = "";
    $scope.isSubmitted = false;

    $scope.changePasswordDTO = { OldPassword: "", NewPassword: "" };


    $scope.init = function () {
        $scope.GetSaveForCartCount();
        $scope.GetShoppingCartCount();
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

    $scope.ChangePassword = function () {
        if ($rootScope.ShowLoader == false) {
            $rootScope.ShowLoader = true;
        }

        $rootScope.ErrorMessage = '';
        $rootScope.SuccessMessage = '';
        $scope.isSubmitted = true;
        $scope.ConfirmNewPassword = "";
        if ($scope.passwordForm.$valid) {
            $scope.isSubmitted = false;
            $http({
                url: dataService + '/UpdatePassword',
                method: 'POST',
                data: $scope.changePasswordDTO,
                headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
            }).success(function (result) {
                $scope.changePasswordDTO = { OldPassword: "", NewPassword: "" };
                $scope.ConfirmNewPassword = "";
                if (result.operationResult == 1) {
                    $scope.ResultMessage = result.Message;
                    //$(".resultClass").css("color", "Green");
                    $rootScope.SuccessMessage = $scope.ResultMessage;
                }
                else {
                    $scope.ResultMessage = result.Message;
                    $rootScope.ErrorMessage = $scope.ResultMessage;
                    //$(".resultClass").css("color", "Red");
                }
                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }
            })
            .error(function (err) {
                $scope.changePasswordDTO = { OldPassword: "", NewPassword: "" };
                $scope.ConfirmNewPassword = "";
                //alert("Pl try later");
                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }
                $rootScope.ErrorMessage = "Please try later";
            });
        }
        else {
            if ($rootScope.ShowLoader == true) {
                $rootScope.ShowLoader = false;
            }
        }
    }

    $scope.GetShoppingCartCount = function () {
        var cartPromise = serviceCartCount.getProductCount(Context, dataService);
        cartPromise.then(function (result) {
            $scope.ShoppingCartCount = result.data;
        });

    }

    $scope.OptionClick = function () {
        $('.rightnav-cont').toggle();
    }

    $scope.Back = function () {
        $state.go("myaccount");
    }

    $scope.init();
}]);