app.controller('PaymentGatewayStatusController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', '$timeout', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
    console.log('PaymentGatewayStatusController loaded.');

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();

    $scope.PaymentModeID = $stateParams.paymentModeID;
    $scope.TransactionNumber = $stateParams.transactionNumber;

    $scope.init = function (type) {

        if (!$scope.TransactionNumber)
        {
            $scope.TransactionNumber = "NA";
        }

        if (!$scope.PaymentModeID)
        {
            $scope.PaymentModeID = 0;
        }

        if (type == "Initiate") {
            $scope.InitiateGateway();
        }

        if (type == "Validate") {
            $rootScope.ShowPreLoader = true;
            $rootScope.ShowLoader = true;

            $scope.ValidatePaymentTransaction();
        }

        if (type == "RetryValidate") {
            $scope.UpdateFeePaymentStatus();
        }
    }

    $scope.RetryCancelledPayment = function () {

        $scope.InitiateGateway();
    }

    $scope.InitiateGateway = function () {

        $rootScope.ShowPreLoader = true;
        $rootScope.ShowLoader = true;

        redirectToMasterCardPayment();
    }

    function redirectToMasterCardPayment() {

        var url = $rootScope.ParentPortalUrl + "PaymentGateway/FeePaymentFromMobile?loginID=" + context.LoginID + "&emailID=" + context.EmailID + "&userID=" + context.UserId + "&paymentModeID=" + $scope.PaymentModeID;

        var ref = cordova.InAppBrowser.open(url,
            '_blank', "location=no,hidden=no,closebuttoncaption='',toolbar=no");

        if (ref != null && ref != undefined) {

            ref.addEventListener('exit', function (event) {

            });
            ref.addEventListener('loaderror', function (event) {

            });
            ref.addEventListener('loadstart', function (event) {
            });
            ref.addEventListener('loadstop', function (event) {
                var url = event.url;
                if (url.includes('Validate') || url.includes('success') || url.includes('complete')) {
                    ref.close();
                    $rootScope.ShowLoader = true;
                    var newUrl = new URL(url);
                    if (newUrl.href) {

                        $state.go("validatefeepayment");
                    }
                    else {
                        $scope.ShowPaymentFailure();


                    }
                }
                else if (url.includes('Cancel') || url.includes('cancel')) {
                    ref.close();
                    $scope.ShowPaymentCancel();
                }
                else if (url.includes('Fail') || url.includes('error')) {
                    ref.close();
                    $scope.ShowPaymentFailure();
                }
            });
        }
    }

    $scope.ValidatePaymentTransaction = function () {

        $http({
            method: 'GET',
            url: dataService + '/ValidatePayment',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {

            if (result) {
                if (result.toLowerCase().includes("fail"))
                {
                    $scope.ShowPaymentFailure();
                }

                if (result.toLowerCase().includes("pending"))
                {
                    $scope.ShowPaymentPending();
                }

                if (result.toLowerCase().includes("success"))
                {
                    $scope.UpdateFeePaymentStatus();
                }
            }
            else {
                $scope.ShowPaymentFailure();
            }
        }).error(function () {
            $scope.ShowPaymentFailure();
            $rootScope.ShowPreLoader = false;
            $rootScope.ShowLoader = false;
        });
    }

    $scope.UpdateFeePaymentStatus = function () {

        $http({
            method: 'GET',
            url: dataService + '/UpdateFeePaymentStatus?transactionNumber=' + $scope.TransactionNumber + "&paymentModeID=" + $scope.PaymentModeID,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {

            if (result) {
                $scope.ShowPaymentSuccess();
            }
            else {
                $scope.ShowPaymentFailure();
            }
        }).error(function () {
            $scope.ShowPaymentFailure();
            $rootScope.ShowPreLoader = false;
            $rootScope.ShowLoader = false;
        });
    }

    $scope.ShowPaymentSuccess = function () {
        $rootScope.ShowPreLoader = false;
        $rootScope.ShowLoader = false;

        $state.go("successfeepayment");
    }

    $scope.ShowPaymentFailure = function () {
        $rootScope.ShowPreLoader = false;
        $rootScope.ShowLoader = false;

        $state.go("failedfeepayment");
    }

    $scope.ShowPaymentCancel = function () {
        $rootScope.ShowPreLoader = false;
        $rootScope.ShowLoader = false;

        $state.go("cancelfeepayment");
    }

    $scope.ShowPaymentPending = function () {
        $rootScope.ShowPreLoader = false;
        $rootScope.ShowLoader = false;

        $state.go("pendingfeepayment");
    }

}]);