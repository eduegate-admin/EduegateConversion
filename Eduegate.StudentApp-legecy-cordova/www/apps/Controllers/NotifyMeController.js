app.controller('NotifyMeController', ['$scope', '$http', 'rootUrl', '$location', 'GetContext', 'serviceCartCount', '$state', '$stateParams', '$rootScope', 'serviceAddToCart', 'loggedIn', '$sce', '$timeout', function ($scope, $http, rootUrl, $location, GetContext, serviceCartCount, $state, $stateParams, $rootScope, serviceAddToCart, loggedIn, $sce, $timeout) {
    var dataService = rootUrl.RootUrl;
    var context = GetContext.Context();
    $scope.NotifyMeError = '';
    $scope.NotifyMeSuccess = '';
    $scope.Notify = { ProductSKUMapID: 0, EmailID: '' };
    $scope.init = function () {
        $scope.Notify = { ProductSKUMapID: 0, EmailID: '' };
    }

    $scope.NotifyMe = function () {
        $rootScope.ShowLoader = true;
        //$scope.Message = "";
        $scope.Notify.ProductSKUMapID = $rootScope.NotifyMeProductSKUID;
        $scope.submitted = true;
        $scope.NotifyMeError = '';
        $scope.NotifyMeSuccess = '';
        if ($scope.NotifyForm.$valid) {
            //alert("correct login");
            $http({
                method: 'POST',
                url: dataService + '/NotifyMe',
                data: $scope.Notify,
                headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(context) }
            }).then(function (result) {
                result = result.data;
                if (result.StatusID == 2) {
                    //$("#spnMessage").css("color", "Red");
                    $rootScope.ErrorMessage = result.StatusMessage;
                    $('.notifyme, .notifymeoverlay').fadeOut('medium');
                    $(".error-msg").removeClass('showMsg');
                    $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                        $(this).removeClass('showMsg');
                        $(this).dequeue();
                    });  
                }
                else if (result.StatusID == 1) {
                 $rootScope.SuccessMessage =  result.StatusMessage;
                $('.notifyme, .notifymeoverlay').fadeOut('medium');
                $(".success-msg").removeClass('showMsg');
                $(".success-msg").addClass('showMsg').delay(2000).queue(function () {
                    $(this).removeClass('showMsg');
                    $(this).dequeue();
                });

                }
                $scope.submitted = false;
                $scope.Notify = { ProductSKUMapID: 0, EmailID: '' };
                $rootScope.ShowLoader = false;
                
            }, function (err) {
                $scope.submitted = false;
                $scope.Notify = { ProductSKUMapID: 0, EmailID: '' };
                $rootScope.ErrorMessage = err;
                $('.notifyme, .notifymeoverlay').fadeOut('medium');
                $(".error-msg").removeClass('showMsg');
                $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                    $(this).removeClass('showMsg');
                    $(this).dequeue();
                });
            });
        }
        else {
            $rootScope.ShowLoader = false;
        }
    }

    $scope.SkipValidation = function (value) {
        if (value) {
            return $sce.trustAsHtml(jQuery.parseHTML(value)[0].textContent)
        }
    };
}]);