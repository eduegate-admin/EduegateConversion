app.controller('OrderGenerationController', ['$scope', '$http', 'loggedIn', 'rootUrl',
'$location', 'GetContext', 'serviceCartCount',
'$state', '$stateParams', '$sce', '$rootScope', '$translate', '$timeout', '$q','$controller',
function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount,
    $state, $stateParams, $sce, $rootScope, $translate, $timeout, $q, $controller) {
    console.log('OrderGenerationController loaded.')
    var dataService = rootUrl.RootUrl;
    var Context = GetContext.Context();
    var schoolDataService = rootUrl.SchoolServiceUrl;


    $scope.ProceedPayment = function (paymentType) {
        $scope.OrderGenerationInProccess = true;
        $timeout(function () {
            $rootScope.ErrorMessage = "";
            $rootScope.SuccessMessage = "";
        });

        if ($rootScope.ShowLoader == false) {
            $rootScope.ShowLoader = true;
        }

        if (!$scope.IsPrivacyPolicy) {
            $timeout(function () {
                $translate('PLEASECONFIRMPRIVACYPOLICY').then(function (translation) {
                    $rootScope.ErrorMessage = translation;
                    $(".error-msg").removeClass('showMsg');
                    $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                        $(this).removeClass('showMsg');
                        $(this).dequeue();
                    });

                });
                $rootScope.ShowLoader = false;
                return;
            });
        }

        if ($scope.SelectedPaymentOption.Value == null || $scope.SelectedPaymentOption.Value == undefined
            || $scope.SelectedPaymentOption.Value == '' || $scope.SelectedPaymentOption.Value == 0) {
            $timeout(function () {
                $translate('SELECTPAYMENTMETHOD').then(function (translation) {
                    $rootScope.ErrorMessage = translation;
                    $(".error-msg").removeClass('showMsg');
                    $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                        $(this).removeClass('showMsg');
                        $(this).dequeue();
                    });

                });
                $rootScope.ShowLoader = false;
                return;
            });
        }

        if(!$scope.shoppingCart.CustomerID) {
            if (!($scope.isConfirmedDelivery && $scope.isConfirmedDeliveryAddress)) {
                $timeout(function () {
                    $translate(['PLEASE TRY LATER1']).then(function (translation) {
                        $rootScope.ErrorMessage = translation.PLEASETRYLATER1;
                        $(".error-msg").removeClass('showMsg');
                        $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                            $(this).removeClass('showMsg');
                            $(this).dequeue();
                        });

                    });
                    //$rootScope.ErrorMessage = "Please try later";
                    $rootScope.ShowLoader = false;
                    return;
                });

                return;
            }
        }

        $rootScope.CheckOutPaymentDTO.SelectedPaymentOption = $scope.SelectedPaymentOption.Value;
        //check all cart details
        if ($scope.SelectedPaymentOption.Value > 0 && $scope.IsPrivacyPolicy == true) {
            var validationPromise = CheckBeforePayment();
            validationPromise.then(function (result) {
                if (result.operationResult == 2) {
                    $rootScope.ShowLoader = false;
                    $timeout(function () {
                        $translate(['PLEASETRYLATER']).then(function (translation) {
                            $rootScope.ErrorMessage = translation.PLEASETRYLATER;
                            $(".error-msg").removeClass('showMsg');
                            $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                                $(this).removeClass('showMsg');
                                $(this).dequeue();
                            });
                        });
                        //$rootScope.ErrorMessage = "Please try later";
                        return;
                    });
                    return;
                }
                else {
                    if (result.operationResult == 1) {
                        SaveWebsiteOrder();
                    }
                    else {
                        $rootScope.ShowLoader = false;
                        $timeout(function () {
                            $rootScope.ErrorMessage = result.Message;
                            $(".error-msg").removeClass('showMsg');
                            $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                                $(this).removeClass('showMsg');
                                $(this).dequeue();
                            });

                            return;
                        });
                    }
                }
            });
        }
    }

    function SaveWebsiteOrder() {
        $rootScope.ShowLoader == true;
        //$scope.CheckOutPaymentDTO.SelectedPaymentOption = 1
        //mastercard 

        if ($rootScope.CheckOutPaymentDTO.SelectedPaymentOption == 2) {
            $state.go('onlinepayment');
            return;
        }

        if ($rootScope.CheckOutPaymentDTO.SelectedPaymentOption == 26) {
            $state.go('onlinepayment');
            return;
        }

        if ($rootScope.CheckOutPaymentDTO.SelectedPaymentOption == 30) {
            $state.go('onlinepayment');
            return;
        }

        if ($rootScope.CheckOutPaymentDTO.SelectedPaymentOption == 19) {
            $state.go('razorpaypayment');
            return;
        }

        if ($rootScope.CheckOutPaymentDTO.SelectedPaymentOption == 18) {
            $state.go('ccavenuepayment');
            return;
        }

        if ($rootScope.CheckOutPaymentDTO.SelectedPaymentOption == 25) {
            $state.go('worldlinepayment');
            return;
        }

        //COD Order
        if ($rootScope.CheckOutPaymentDTO.SelectedPaymentOption == 5) {
            $translate(['GENERATINGORDER']).then(function (translation) {
                $rootScope.LoadingMessage = translation.GENERATINGORDER;
            });
            //$rootScope.LoadingMessage = 'Generating Order';
        }

        $rootScope.CheckOutPaymentDTO.DevicePlatorm = device.platform;
        $rootScope.CheckOutPaymentDTO.DeviceVersion = device.version;

        $http({
            url: dataService + "/OnlineStoreGenerateOrder",
            method: 'POST',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(Context)
            },
            data: $rootScope.CheckOutPaymentDTO,
        })
            .then(function (result) {
                result = result.data;
                if (result.operationResult.operationResult == 1) {
                    if (result.RedirectUrl == "" || result.RedirectUrl == null) {
                        $rootScope.LoadingMessage = '';
                        $rootScope.OrderDetails = result;
                        $state.go("thankyou", { transactionNo: result.TransactionNo, cartID: result.CartID, paymentMethod: result.PaymentMethodName, orderHistory: JSON.stringify(result.orderHistory) });
                    }
                }
                else {
                        $state.go("singlecheckout");
                    }
                    $rootScope.LoadingMessage = '';
                    $rootScope.SuccessMessage = result.operationResult.Message;
                    const toastLiveExample = document.getElementById('liveToast')
                    const toast = new bootstrap.Toast(toastLiveExample , {
                        delay:2000,
                    })

                    toast.show()
                    // $rootScope.ShowToastMessage(result.operationResult.Message, 'success');
                

                $rootScope.ShowPreLoader = false;
                $rootScope.ShowLoader = false;
            }
            , function (err) {
                $rootScope.LoadingMessage = '';
                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }
            });
    }

    function CheckBeforePayment() {
        return $http({
            url: dataService + "/SaveShoppingCartDetails",
            method: 'POST',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(Context)
            },
            data: $rootScope.CheckOutPaymentDTO,
        }).then(function (result) {
            result = result.data;
            return result;
        }, function (err) {
            return null;
        });
    }
    

    $scope.SubmitAmountLog = function (totalAmountToBePaid) {

        $http({
            url: schoolDataService + "/SubmitAmountAsLog?totalAmount=" + totalAmountToBePaid,
            method: "POST",
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(Context)
            }
        }).success(function (result) {

            if (result) {
                $scope.InitiateSession();
            }
            else {
                $rootScope.ShowPreLoader = false;
                $rootScope.ShowLoader = false;

                $rootScope.ShowToastMessage("Something went wrong, try again later!", 'error');
            }
        }).error(function () {
            $rootScope.ShowPreLoader = false;
            $rootScope.ShowLoader = false;

            $rootScope.ShowToastMessage("Something went wrong, try again later!", 'error');
        });

    }

    $scope.InitiateSession = function () {

        $http({
            url: schoolDataService + "/GenerateCardSession",
            method: "POST",
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(Context)
            }
        }).success(function (result) {

            if (result) {
                $scope.InitiatePaymentGateway();
            }
            else {
                $rootScope.ShowPreLoader = false;
                $rootScope.ShowLoader = false;

                $rootScope.ShowToastMessage("Something went wrong, try again later!", 'error');
            }
        }).error(function () {
            $rootScope.ShowPreLoader = false;
            $rootScope.ShowLoader = false;

            $rootScope.ShowToastMessage("Something went wrong, try again later!", 'error');
        });

    }

    $scope.InitiatePaymentGateway = function () {

        $rootScope.ShowPreLoader = false;
        $rootScope.ShowLoader = false;

        $state.go("onlinepayment");

    }

}]);