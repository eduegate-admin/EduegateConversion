app.controller('CartController', ['$scope', '$http', 'loggedIn', 'rootUrl', 
    '$location', 'GetContext', '$state', '$stateParams', '$sce', '$rootScope', '$q', 'serviceCartCount','serviceAddToCart','$timeout',
    function ($scope, $http, loggedIn, rootUrl, $location, GetContext, $state, $stateParams, $sce, $rootScope,
        $q, serviceCartCount,serviceAddToCart,$timeout) {
    var Context = GetContext.Context();
    var dataService = rootUrl.RootUrl;

    $scope.ShoppingCartCount = 0;
    $scope.shoppingCart = [];
    $scope.isLoaded = false;
    $scope.CartTotal = 0;
    $scope.errorcheckout = [];
    $scope.SaveForLaterCount = 0;
    $scope.SaveForLaterCart = [];
    $scope.LoggedIn = false;
    $scope.DenyCheckout = false;
    $scope.totalCount = 0;
    $scope.isFirstTime = true;
    $scope.submitUpdateQty = null;

    $scope.init = function () {
        $scope.totalCount = 0;
        $rootScope.ShowLoader = true;
        $scope.GetShoppingCartCount();
        $scope.GetShoppingCart();
        $scope.GetSaveForCartCount();
    };

    $scope.GetSaveForCartCount = function () {
        var loggedInPromise = loggedIn.CheckLogin(Context, dataService);

        loggedInPromise.then(function (model) {
            if (model && model.data) {
                if (model.data.LoginID) {
                    $scope.LoggedIn = true;
                    var SaveForLaterCountPromise = serviceCartCount.getSaveForLaterCount(Context, dataService);
                    SaveForLaterCountPromise.then(function (result) {
                        $scope.SaveForLaterCount = result.data;
                        $scope.GetSaveForLaterCart();
                    });
                }
                else {
                    $scope.totalCount += 1;
                }
            }
            else {
                $scope.totalCount += 1;
            }
        }, function () { });
    }

    $scope.$watch('totalCount', function (n, o) {
        if (n >= 3) {
            $rootScope.ShowLoader = false;
        }
    });

    $scope.GetShoppingCartCount = function () {
        var cartPromise = serviceCartCount.getProductCount(Context, dataService);

        cartPromise.then(function (result) {
            $scope.ShoppingCartCount = result;
            $scope.totalCount += 1;
        }, function () {

        });

    }

    $scope.GetSaveForLaterCart = function () {
        $scope.totalCount += 1;
    };

    $scope.GetShoppingCart = function () {
        $http({
            url: dataService + "/GetCartDetails",
            method: 'GET',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
        })
            .then(function (result) {
                $scope.errorcheckout = [];
                $scope.shoppingCart = result.data;
                $scope.isFirstTime = false;
                $scope.getCartTotal();
                $scope.isLoaded = true;
                $scope.totalCount += 1;
            }
                , function (err) {
                    $scope.isLoaded = true;
                    $scope.totalCount += 1;
                });
    }

    $scope.OptionClick = function () {
        $('.rightnav-cont').toggle();
    }

    $scope.SkipValidation = function (value) {
        if (value) {
            return $sce.trustAsHtml(jQuery.parseHTML(value)[0].textContent)
        }
    };

    $scope.GetProductImage = function (imagePath) {
        return rootUrl.ImageUrl + imagePath;
    }

    $scope.ErrorImage = function () {
        return rootUrl.ErrorProductImageUrl;
    }

    $scope.range = function (start, end) {
        var result = [];
        for (var i = start; i <= end; i++) {
            result.push(i);
        }
        return result;
    };

    $scope.ShowContinueButton = function (product) {
        if (product.IsOutOfStock == true) {
            $scope.DenyCheckout = true;
            $scope.errorcheckout.push(2);
        }
        else if (product.IsCartQuantityAdjusted == true && product.Quantity > 0) {
            if ($scope.DenyCheckout == false) {
                $scope.DenyCheckout = false;
            }
            $scope.errorcheckout.push(3);
        }
        else if (product.IsCartQuantityAdjusted == true && product.Quantity <= 0) {
            $scope.DenyCheckout = true;
            $scope.errorcheckout.push(4);
        }
        else {
            if ($scope.DenyCheckout == false) {
                $scope.DenyCheckout = false;
            }
            $scope.errorcheckout.push(1);
        }
    }

    $scope.AllowCheckOut = function () {
        $.each($scope.shoppingCart.Products, function (index, item) {
            if (!(item.AvailableQuantity > 0 && item.AvailableQuantity >= item.Quantity)) {
                return false;
            }
        });
        return true;
    }

    $scope.getCartTotal = function () {
        var total = 0;
        if ($scope.shoppingCart != null && $scope.shoppingCart != undefined && $scope.shoppingCart.Products != null && $scope.shoppingCart.Products != undefined) {
            for (var i = 0; i < $scope.shoppingCart.Products.length; i++) {
                var product = $scope.shoppingCart.Products[i];
                $scope.ShowContinueButton(product);
            }

            total = $scope.shoppingCart.SubTotal;
        }

        $scope.CartTotal = total;

        if ($scope.shoppingCart.IsCartItemOutOfStock == true || $scope.shoppingCart.IsCartItemDeleted == true || $scope.shoppingCart.IsCartItemQuantityAdjusted == true) {
            $timeout(function () {
                $translate(['SOMEITEMSINCARTNOTELIGIBLETOPURCHASE']).then(function (translation) {
                    $rootScope.ErrorMessage = translation.SOMEITEMSINCARTNOTELIGIBLETOPURCHASE;
                    $(".error-msg").removeClass('showMsg');
                    $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                        $(this).removeClass('showMsg');
                        $(this).dequeue();
                    });

                });
            });
        }
    }



    $scope.decreaseQty = function (qty, product) {
        if (qty > 1) {
            product.Quantity = parseInt(qty) - 1;
            $scope.UpdateItem(product, product.Quantity);
        }
    };

    $scope.increaseQty = function (qty, product) {
        product.Quantity = parseInt(qty) + 1;
        $scope.UpdateItem(product, product.Quantity);
    };



    $scope.RemoveCartItem = function (skuID, showMsg, deleteIndex) {
        $scope.totalCount = -10;
        if ($rootScope.ShowLoader == false) {
            $rootScope.ShowLoader = true;
        }

        $rootScope.ErrorMessage = '';
        $rootScope.SuccessMessage = '';
        $scope.shoppingCart.Products.splice(deleteIndex, 1);

        $http({
            url: dataService + "/RemoveCartItem",
            method: 'POST',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },

            data: { 'SKUID': skuID },
        }).then(function (result) {
            result = result.data;
            if (result.operationResult == 1) {

                $scope.init();

                if (showMsg == true) {
                    $rootScope.SuccessMessage = result.Message;
                    $(".success-msg").removeClass('showMsg');
                    $(".success-msg").addClass('showMsg').delay(2000).queue(function () {
                        $(this).removeClass('showMsg');
                        $(this).dequeue();
                    });

                }
            }
            else {
                if (showMsg == true) {
                    $rootScope.ErrorMessage = result.Message;
                    $(".error-msg").removeClass('showMsg');
                    $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                        $(this).removeClass('showMsg');
                        $(this).dequeue();
                    });

                }
                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }
            }

        }
            , function (err) {

                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }
                if (showMsg == true) {
                    $translate(['ITEMNOTREMOVED']).then(function (translation) {
                        $rootScope.ErrorMessage = translation.ITEMNOTREMOVED;
                        $(".error-msg").removeClass('showMsg');
                        $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                            $(this).removeClass('showMsg');
                            $(this).dequeue();
                        });

                    });
                }
            });
    }

    var lastUpdatedSKUID = null;

    $scope.UpdateItem = function (product, quantity, showMsg) {
        console.log(product.SKUID)
        if (lastUpdatedSKUID == product.SKUID) {
            clearTimeout($scope.submitUpdateQty);
        }
        lastUpdatedSKUID = product.SKUID;
        var inputVal = parseInt(quantity);
        if (inputVal == 0) {
            inputVal = 1;
        }
        $scope.submitUpdateQty = setTimeout(function () {

            if (quantity == '' || isNaN(inputVal)) {
                inputVal = 1;
            }
            var newQuantity = inputVal;

            if ($rootScope.ShowLoader == false) {
                $rootScope.ShowLoader = true;
            }

            if (showMsg != false) {
                $rootScope.ErrorMessage = '';
                $rootScope.SuccessMessage = '';
            }

            $http({
                url: dataService + "/UpdateCart",
                method: 'POST',
                headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
                data: { 'SKUID': product.SKUID, 'Quantity': newQuantity },
            }).then(function (result) {
                result = result.data;                
                if (result.operationResult == 1) {

                    if (showMsg != false) {                        
                        $rootScope.SuccessMessage = result.Message;
                        const toastLiveExample = document.getElementById('liveToast')
                        const toast = new bootstrap.Toast(toastLiveExample , {
                            delay:2000,
                        })
    
                        toast.show()

                    }
                    else {
                        if ($rootScope.ShowLoader == true) {
                            $rootScope.ShowLoader = false;
                        }
                    }
                }
                else {
                    if (showMsg != false) {
                        $rootScope.ErrorMessage = result.Message;
                        $(".error-msg").removeClass('showMsg');
                        $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                            $(this).removeClass('showMsg');
                            $(this).dequeue();
                        });

                        if ($rootScope.ShowLoader == true) {
                            $rootScope.ShowLoader = false;
                        }
                    }
                    else {
                        if ($rootScope.ShowLoader == true) {
                            $rootScope.ShowLoader = false;
                        }
                    }
                }
                $scope.init();
            }), function () {
                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }
                if (showMsg != false) {
                    $translate(['PLEASETRYLATER']).then(function (translation) {
                        $rootScope.ErrorMessage = translation.PLEASETRYLATER;
                        $(".error-msg").removeClass('showMsg');
                        $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                            $(this).removeClass('showMsg');
                            $(this).dequeue();
                        });
                    });
                }
                $scope.init();
            };

        }, 1000);


    };

    $scope.AddSaveForLater = function (skuID) {
        $scope.totalCount = -10;
        if ($rootScope.ShowLoader == false) {
            $rootScope.ShowLoader = true;
        }

        $rootScope.ErrorMessage = '';
        $rootScope.SuccessMessage = '';
        $http({
            url: dataService + "/AddSaveForLater",
            method: 'POST',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
            data: "{\"skuID\":\"" + JSON.stringify(skuID) + "\"}",
        }).then(function (result) {
            result = result.data;
            if (result.operationResult == 1) {
                $scope.RemoveCartItem(skuID, false);
                $rootScope.SuccessMessage = result.Message;
                $(".success-msg").removeClass('showMsg');
                $(".success-msg").addClass('showMsg').delay(2000).queue(function () {
                    $(this).removeClass('showMsg');
                    $(this).dequeue();
                });

            }
            else {
                $rootScope.ErrorMessage = result.Message;
                $(".error-msg").removeClass('showMsg');
                $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                    $(this).removeClass('showMsg');
                    $(this).dequeue();
                });

                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }
            }


        }
            , function (err) {

                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }
                $translate(['PLEASETRYLATER']).then(function (translation) {
                    $rootScope.VoucherError = translation.PLEASETRYLATER;
                });
            });
    };

    $scope.RemoveSaveForLater = function (skuID, showMsg) {
        $scope.totalCount = -10;
        if ($rootScope.ShowLoader == false) {
            $rootScope.ShowLoader = true;
        }

        $rootScope.ErrorMessage = '';
        $rootScope.SuccessMessage = '';
        $http({
            url: dataService + "/RemoveSaveForLater",
            method: 'POST',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
            data: "{\"skuID\":\"" + JSON.stringify(skuID) + "\"}",
        }).then(function (result) {
            result = result.data;
            if (result.operationResult == 1) {
                for (var i = 0; i < $scope.SaveForLaterCart.length; i++) {
                    if ($scope.SaveForLaterCart[i].SKUID == skuID) {
                        $scope.SaveForLaterCart.splice(i, 1);
                        $timeout(function () {
                            $scope.GetSaveForCartCount();
                        }, 100);
                        break;
                    }
                }

                if (showMsg == true) {
                    $rootScope.SuccessMessage = result.Message;
                    $(".success-msg").removeClass('showMsg');
                    $(".success-msg").addClass('showMsg').delay(2000).queue(function () {
                        $(this).removeClass('showMsg');
                        $(this).dequeue();
                    });
                }
            }
            else {

                if (showMsg == true) {
                    $rootScope.ErrorMessage = result.Message;
                    $(".error-msg").removeClass('showMsg');
                    $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                        $(this).removeClass('showMsg');
                        $(this).dequeue();
                    });
                }
            }
            if ($rootScope.ShowLoader == true) {
                $rootScope.ShowLoader = false;
            }
        }
            , function (err) {

                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }
                if (showMsg == true) {
                    $translate(['PLEASETRYLATER']).then(function (translation) {
                        $rootScope.VoucherError = translation.PLEASETRYLATER;
                    });
                }
            });

    };

    $scope.AddToCartFromSaveForLater = function (SKUID, quantity) {
        $scope.totalCount = -10;

        if ($rootScope.ShowLoader == false) {
            $rootScope.ShowLoader = true;
        }

        $rootScope.ErrorMessage = '';
        $rootScope.SuccessMessage = '';
        var AddtoCartPromise = serviceAddToCart.addToCart(SKUID, quantity, rootUrl.RootUrl, Context, $rootScope);
        AddtoCartPromise.then(function (result) {
            if (result.operationResult == 1) {
                $scope.init();
                $scope.RemoveSaveForLater(SKUID, false);
                $rootScope.SuccessMessage = result.data.Message;
                $(".success-msg").removeClass('showMsg');
                $(".success-msg").addClass('showMsg').delay(2000).queue(function () {
                    $(this).removeClass('showMsg');
                    $(this).dequeue();
                });

            }
            else {

                $rootScope.ErrorMessage = result.data.Message;
                $(".error-msg").removeClass('showMsg');
                $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                    $(this).removeClass('showMsg');
                    $(this).dequeue();
                });

                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }
            }

        });
    }

    $scope.ProceedtoCheckout = function () {
        if (!$rootScope.IsProfileCompleted()) {
            $state.go('onlinestoreregister', {
                loadBlocks: false,
                redirectUrl: 'onlinestoreregister'
            });
            return;
        }

        $timeout(function () {
            $rootScope.ErrorMessage = "";
        });
        $scope.DenyCheckout = false;
        if ($scope.shoppingCart.IsCartItemOutOfStock == true) {
            $scope.DenyCheckout = true;
        }

        if ($scope.DenyCheckout == false) {
            if ($scope.LoggedIn) {
                $rootScope.ShowLoader = true;

                $http({
                    url: dataService + "/ValidateContinueCheckOut",
                    method: 'GET',
                    headers: {
                        "Accept": "application/json;charset=UTF-8",
                        "Content-type": "application/json; charset=utf-8",
                        "CallContext": JSON.stringify(Context)
                    }
                }).then(function (result) {
                    $rootScope.ShowLoader = false;
                    if (result.data.operationResult && result.data.operationResult === 1) {
                        $state.go("singlecheckout", { DeliveryAddress: null, ShowAddressView: false });
                        return;
                    }
                    else {
                        $rootScope.ShowToastMessage(result.data.Message);
                    }
                }, function () {
                    $rootScope.ShowLoader = false;
                });
            }
            else {
                $state.go("login", { redirectUrl: "singlecheckout", IsDigitalCart: $scope.shoppingCart.isDigitalCart });
            }
        }
        else {
            $timeout(function () {
                $translate(['SOMEITEMSINCARTNOTELIGIBLETOPURCHASE']).then(function (translation) {
                    $rootScope.ErrorMessage = translation.SOMEITEMSINCARTNOTELIGIBLETOPURCHASE;
                    $(".error-msg").removeClass('showMsg');
                    $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                        $(this).removeClass('showMsg');
                        $(this).dequeue();
                    });
                });
            });

        }
    }

    $scope.GetTotalProductQuantity = function () {
        var totalquantity = 0;
        if ($scope.shoppingCart) {
                $.each($scope.shoppingCart.Products, function (index, item) {
                    totalquantity = totalquantity + item.Quantity;
                });
            return totalquantity;
        }

    }


    $scope.showQtyError = function () {
        $(".quantityoos").toggleClass('active');
    }

    $scope.init();
}]);