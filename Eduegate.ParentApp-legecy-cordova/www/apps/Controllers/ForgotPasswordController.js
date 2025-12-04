app.controller('ForgotPasswordController', ['$scope', '$http', 'rootUrl', '$sce', /*'serviceCartCount',*/ 'GetContext', 'loggedIn', '$rootScope', function ($scope, $http, rootUrl, $sce, /*serviceCartCount,*/ GetContext, loggedIn, $rootScope) {
    var Context = GetContext.Context();
    var dataService = rootUrl.RootUrl;
    $scope.submitted = false;
    $scope.EmailID = "";
    $scope.ClosePopup = function () {
        $(".forgetpasswd").fadeOut();
        //$(".forgetpasswd").animate({ visibility: "hidden" }, 1000);
    }
    $(document).mouseup(function (e) {
        var container = $(".forgetpasswd-blk");
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            $scope.ClosePopup();
        }
    });

    $scope.Submit = function () {
        $rootScope.ShowLoader = true;
        $rootScope.ErrorMessage = '';
        $rootScope.SuccessMessage = '';
        $scope.submitted = true;
        if ($scope.forgotPasswordForm.$valid) {
            $http({
                url: dataService + "/ForgotPassword",
                method: 'POST',
                headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
                data: "{\"emailID\":\"" + $scope.EmailID + "\"}",
            }).success(function (result) {
                $scope.ClosePopup();
                if (result.operationResult == 1) {
                    $rootScope.SuccessMessage = result.Message;
                }
                else {
                    $rootScope.ErrorMessage = result.Message;
                }
                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }
            })
           .error(function (err) {
               $scope.ClosePopup();
               if ($rootScope.ShowLoader == true) {
                   $rootScope.ShowLoader = false;
               }
               $rootScope.ErrorMessage = "Please try later";
           });
        }
        else
        { $rootScope.ShowLoader = false }
    }

}]);