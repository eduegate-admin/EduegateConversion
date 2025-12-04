app.controller('CheckoutController', ['$scope', '$http', 'loggedIn', 'rootUrl', 
'$location', 'GetContext', '$state', '$stateParams', '$sce', '$rootScope', '$q', 'serviceCartCount','serviceAddToCart','$timeout','$translate',
function ($scope, $http, loggedIn, rootUrl, $location, GetContext, $state, $stateParams, $sce, $rootScope,
    $q, serviceCartCount,serviceAddToCart,$timeout,$translate) {
        $scope.TimeSlots = [];
        $scope.SelectedTimeSlotMapID = null;

        $scope.ShoppingCartCount = 0;
        $scope.shoppingCart = [];
        $scope.CartTotal = 0;
        $scope.SaveForLaterCount = 0;
        var Context = GetContext.Context();
        var dataService = rootUrl.RootUrl;
        var isPaymentLoading = false;
        $scope.isConfirmedDelivery = true;
        $scope.isConfirmedDeliveryAddress = false;
        $scope.isConfirmedPayment = false;
        $scope.PaymentType = "pay";

        $scope.VoucherAmount = 0;
        $scope.SelectedPaymentOption = { Value: null };
        button.disabled = true;
        btnidPayment.disabled = true;
        $scope.isloaded = false;
        $scope.PaymentOptions = [];
        $scope.PaymentOptionsVirutal = [];
        $scope.PaymentOptionsNonVirtual = [];
        $scope.DeliveryTypes = [];
        $scope.DeliveryTypeID = null;
        $scope.AddressList = [];

        $scope.DeliveryAddress = "";
        var isCartDeliveryUpdated = false;
        $rootScope.CheckOutPaymentDTO = { ShoppingCartID: "", VoucherNo: "", VoucherAmount: 0, LoyaltyAmount : 0, SelectedPaymentOption: "", SelectedShippingAddress: "", WalletAmount: 0, PostObject: "", DevicePlatorm: "", DeviceVersion: "" };

        $scope.SelectedDeliveryAddress = 0;
        $scope.ShowAddressView = $stateParams.ShowAddressView === 'true';
        $scope.fromInit = false;
        $scope.DefaultStore = null;
        $scope.isGoogleMapStoreContainer = false;
        $scope.IsLoyaltyLoading = false;

        $translate(['POINTS']).then(function (translation) {
            $scope.points = translation.POINTS;
        });

        if ($stateParams.DeliveryAddress != undefined && $stateParams.DeliveryAddress != null) {
            $scope.SelectedDeliveryAddress = $stateParams.DeliveryAddress;
        }

        $scope.init = function () {
            $rootScope.ShowLoader = true;

            $q.all([
                $scope.GetBranches(),
                $scope.GetShoppingCartCount(),
                $scope.GetSaveForCartCount(),
                $scope.GetShoppingCart(true),
                $scope.GetAllDeliveryTypes(),
                $scope.GetAllAddress()
            ]).then(function () {
                $rootScope.ShowLoader = false;
            }, function () {
                $rootScope.ShowLoader = false;
            });

            $(".tabNav li").removeClass("current");
            $(".tabNav li:nth-child(1)").addClass("current");
            $(".tabContainer div").removeClass("current");
            $(".tabContainer div:nth-child(1)").addClass("current");

            if ($scope.ShowAddressView) {
                $scope.DisplayAddressView();
                $(".tabNav li").removeClass("current");
                $(".tabNav li:nth-child(1)").addClass("current");
                $(".tabContainer div").removeClass("current");
                $(".tabContainer div:nth-child(1)").addClass("current");
            }

            ClearVoucher();
        };

        $scope.GetAllAddress = function () {
            return $q(function (resolve, reject) {
                $http({
                    url: dataService + '/GetShippingAddressContacts',
                    method: 'GET',
                    headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
                }).then(function (result) {
                    result = result.data;
                    $scope.AddressList = result;
                    resolve();
                }
                    , function (err) {
                        $translate(['PLEASETRYLATER']).then(function (translation) {
                            $rootScope.VoucherError = translation.PLEASETRYLATER;
                        });
                        resolve();
                    });
            });
        }

        $scope.GetUserDetail = function () {
            $http({
                method: 'GET',
                url: dataService + '/GetUserDetails',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(Context)
                }
            }).then(function (result) {
                result = result.data;
                $scope.DefaultBranch = result.Branch;
                $scope.DefaultStore = result.Branch ? result.Branch.BranchIID.toString() : null;
                $rootScope.StoreID = result.Branch.BranchIID;
                $('.loader-blk').hide();
                $rootScope.LoadingMessage = '';
            }, function (err) {

            });
        }

        $scope.BranchChange = function (value) {
            $scope.DefaultStore = value.toString();
            $scope.DefaultBranch = $scope.Branches.find(x => x.BranchIID == value);
        }

        $scope.GetBranches = function () {
            return $q(function (resolve, reject) {
                var url = rootUrl.RootUrl + '/GetBranches';
                $http({
                    method: 'GET',
                    url: url,
                    headers: {
                        "Accept": "application/json;charset=UTF-8",
                        "Content-type": "application/json; charset=utf-8",
                        "CallContext": JSON.stringify(Context)
                    }
                }).then(function (results) {
                    $scope.Branches = results.data;
                    if (!$rootScope.StoreID) {
                        $scope.GetUserDetail();
                    }
                    else {
                        $scope.DefaultStore = $rootScope.StoreID.toString();
                        $scope.DefaultBranch = $scope.Branches.find(x => x.BranchIID == $scope.DefaultStore);
                    }
                    resolve(null);
                }, function (err) {
                    resolve(null);
                });
            });
        }

        $scope.GetTimeSlots = function (deliveryType) {
            $scope.TimeSlots = deliveryType.TimeSlots;
        }

        $scope.GetAllDeliveryTypes = function () {
            return $q(function (resolve, reject) {
                $http({
                    url: dataService + "/GetAllDeliveryTypes",
                    method: 'GET',
                    headers: {
                        "Accept": "application/json;charset=UTF-8",
                        "Content-type": "application/json; charset=utf-8",
                        "CallContext": JSON.stringify(Context)
                    }
                }).then(function (result) {
                    result = result.data;
                    $scope.DeliveryTypes = result;
                    if ($scope.DeliveryTypes[0]) {
                        $scope.DeliveryTypeID = $scope.DeliveryTypes[0].DeliveryTypeID;
                        $scope.TimeSlots = $scope.DeliveryTypes[0].TimeSlots;
                    } else {
                        $scope.DeliveryTypeID = null;
                        $scope.TimeSlots = [];
                    }
                    resolve();
                }
                    , function (err) {
                        resolve();
                    });
            });
        }

        $scope.DirectPaymentView = function () {
            if ($scope.shoppingCart.isDigitalCart == true) {
                $scope.isConfirmedDeliveryAddress = true;
                $scope.GetDeliveryAddress(true);
                $scope.DisplayPaymentView();
            }
            else {
                $scope.DisplayAddressView();
            }
        }

        $scope.$watch('fromInit', function (n, o) {
            if (o == false && n == true) {
                if ($rootScope.ShowLoader == false) {
                    $rootScope.ShowLoader = true;
                }
                $scope.DirectPaymentView();
            }
        })

        $scope.GetShoppingCartCount = function () {
            return $q(function (resolve, reject) {
                var cartPromise = serviceCartCount.getProductCount(Context, dataService);
                cartPromise.then(function (result) {
                    $scope.ShoppingCartCount = result;
                    if ($scope.ShoppingCartCount <= 0) {
                        $state.go("home", { loadBlocks: false });
                    }
                    resolve();
                }, function () {
                    resolve();
                });
            });
        }

        $scope.GetSaveForCartCount = function () {
            return $q(function (resolve, reject) {
                var loggedInPromise = loggedIn.CheckLogin(Context, dataService);
                loggedInPromise.then(function (model) {

                    if (model && model.data) {
                        if (model.data.LoginID) {
                            $scope.LoggedIn = true;
                            var SaveForLaterCountPromise = serviceCartCount.getSaveForLaterCount(Context, dataService);
                            SaveForLaterCountPromise.then(function (result) {
                                $scope.SaveForLaterCount = result.data;
                            });

                            if (model.data.Branch) {
                                $rootScope.StoreName = model.data.Branch.BranchName;
                                $rootScope.StoreID = model.data.Branch.BranchIID;
                            } else {
                                $state.go("locateyourstore", null, { redirectUrl: 'checkout' });
                            }
                        }
                    }
                    resolve();
                }, function () {
                    resolve();
                });
            });
        }

        $scope.GetShoppingCart = function (fromInit) {
            return $q(function (resolve, reject) {
                $http({
                    url: dataService + "/GetCartDetails",
                    method: 'GET',
                    headers: {
                        "Accept": "application/json;charset=UTF-8",
                        "Content-type": "application/json; charset=utf-8",
                        "CallContext": JSON.stringify(Context)
                    },
                })
                    .then(function (result) {
                        $scope.shoppingCart = result.data;
                        $scope.DeliveryTypes = result.data.DeliverySettings;
                        $scope.shoppingCart.RemainingTotal = $scope.shoppingCart.Total;
                        if ($scope.shoppingCart == null || $scope.shoppingCart == undefined || $scope.shoppingCart.Products == null || $scope.shoppingCart.Products == undefined || $scope.shoppingCart.Products.length <= 0) {
                            $translate(['YOURCARTCANNOTBEPROCESSED']).then(function (translation) {
                                $rootScope.ErrorMessage = translation.YOURCARTCANNOTBEPROCESSED;
                                $(".error-msg").removeClass('showMsg');
                                $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                                    $(this).removeClass('showMsg');
                                    $(this).dequeue();
                                });

                            });
                            $state.go("cart");
                        }

                        if ($scope.ShowAddressView != true && fromInit == true) {
                            $scope.fromInit = true;
                        }

                        checkDeliveryView();

                        $rootScope.CheckOutPaymentDTO.ShoppingCartID = $scope.shoppingCart.ShoppingCartID;
                        $scope.getCartTotal();

                        resolve();
                    }
                    , function (err) {
                        resolve();
                    });
            });
        }

        function checkDeliveryView() {
            $scope.isConfirmedDelivery = true;
            if ($scope.shoppingCart && $scope.shoppingCart.Products) {
                for (var i = 0; i <= $scope.shoppingCart.Products.length - 1; i++) {
                    if ($scope.shoppingCart.Products[i].DeliveryTypes != null && $scope.shoppingCart.Products[i].DeliveryTypes != undefined) {
                        if ($scope.shoppingCart.Products[i].DeliveryTypes.length <= 0) {
                            $scope.isConfirmedDelivery = false;
                            break;
                        }
                    }
                }
            }
        }

        $scope.getCartTotal = function () {
            var total = 0;

            if ($scope.shoppingCart && $scope.shoppingCart.Products) {
                for (var i = 0; i < $scope.shoppingCart.Products.length; i++) {
                    total = $scope.shoppingCart.SubTotal;
                }
            }

            $scope.CartTotal = total;
        }

        $scope.OptionClick = function () {
            $('.rightnav-cont').toggle();
        }

        $scope.GetProductImage = function (imagePath) {
            return rootUrl.ImageUrl + imagePath;
        }

        $scope.ErrorImage = function () {
            return rootUrl.ErrorProductImageUrl;
        }

        $scope.CartDeliverySelectionChanged = function (type) {
            if (type) {
                var deliveryType = $scope.DeliveryTypes
                    .find(x => x.DeliveryTypeID == $scope.DeliveryTypeID);
                $scope.TimeSlots = deliveryType.TimeSlots;
            }

            ClearVoucher();
            $rootScope.ShowLoader = true;
            $rootScope.ErrorMessage = '';
            $rootScope.SuccessMessage = '';
            $http({
                url: dataService + "/UpdateCartDelivery",
                method: 'POST',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(Context)
                },
                data: {
                    'DeliveryTypeID': $scope.DeliveryTypeID,
                    'DeliveryTypeTimeSlotMapID': $scope.SelectedTimeSlotMapID
                },
            }).then(function (result) {
                result = result.data;
                if (result.operationResult == 1) {
                    isCartDeliveryUpdated = true;
                    $scope.GetShoppingCart();
                }

                $rootScope.ShowLoader = false;
            }
            , function (err) {
                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }
            });
        }

        $scope.DeliverySelectionChanged = function (product, deliveryTypeID) {
            ClearVoucher();
            if ($rootScope.ShowLoader == false) {
                $rootScope.ShowLoader = true;
            }
            $rootScope.ErrorMessage = '';
            $rootScope.SuccessMessage = '';
            $http({
                url: dataService + "/UpdateCartDelivery",
                method: 'POST',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(Context)
                },
                data: { 'SKUID': product.SKUID, 'DeliveryTypeID': deliveryTypeID },
            }).then(function (result) {
                result = result.data;
                if (result.operationResult == 1) {
                    $scope.GetShoppingCart();
                }
            }
                , function (err) {
                    if ($rootScope.ShowLoader == true) {
                        $rootScope.ShowLoader = false;
                    }
                });
        }

        $scope.DeliveryTimeSlotSelectionChanged = function (product) {

            if ($rootScope.ShowLoader == false) {
                $rootScope.ShowLoader = true;
            }
            $rootScope.ErrorMessage = '';
            $rootScope.SuccessMessage = '';
            $http({
                url: dataService + "/UpdateSKUDeliveryTimeSlotID",
                method: 'POST',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(Context)
                },
                data: { 'SKUID': product.SKUID, 'DeliveryTimingSlotSelectedID': product.DeliveryTimingSlotSelectedID },
            }).then(function (result) {
                result = result.data;
                if (result.operationResult == 1) {
                    //$scope.GetShoppingCart();
                }
                else {
                }

                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }

            }
                , function (err) {
                    if ($rootScope.ShowLoader == true) {
                        $rootScope.ShowLoader = false;
                    }
                });
        }


        $scope.GetDeliveryAddress = function (fromInit) {
            if ($rootScope.ShowLoader == false) {
                $rootScope.ShowLoader = true;
            }
            $http({
                url: dataService + "/GetLastShippingAddress?addressID=" + ($scope.SelectedDeliveryAddress === "" ? 0 : $scope.SelectedDeliveryAddress),
                method: 'GET',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(Context)
                },
                //data: $scope.SelectedDeliveryAddress,
            }).then(function (result) {
                result = result.data;
                if (result == null || result == undefined || result == "") {
                    $scope.isConfirmedDeliveryAddress = result.IsShippingAddress;
                    $scope.DeliveryAddress = result;
                }
                else {
                    $scope.isConfirmedDeliveryAddress = result.IsShippingAddress;
                    $scope.DeliveryAddress = result;
                    $rootScope.CheckOutPaymentDTO.SelectedShippingAddress = $scope.DeliveryAddress.ContactID;
                }

                if (fromInit == true) {
                    $rootScope.CheckOutPaymentDTO.SelectedShippingAddress = $scope.DeliveryAddress.ContactID;
                    UpdateAddressShoppingCart(fromInit);
                }
                else {
                    if ($scope.shoppingCart.isDigitalCart == true) {
                        $rootScope.CheckOutPaymentDTO.SelectedShippingAddress = $scope.DeliveryAddress.ContactID;
                    }

                    // if ($rootScope.ShowLoader == true) {
                    //     $rootScope.ShowLoader = false;
                    // }
                    button.disabled = false;
                    $scope.isloaded = true;

                }
                $rootScope.ShowLoader = false;

            }
                , function (err) {
                    //alert("Pl try later")
                    if ($rootScope.ShowLoader == true) {
                        $rootScope.ShowLoader = false;
                    }
                });

        }


        $scope.DisplayAddressView = function () {
            var obj = $("#liShipping");
            if ($(".lnkOverlay").is(':visible')) {
                $(".lnkOverlay").toggle();
            }

            $scope.GetDeliveryAddress();
            ChangeTab(obj);

        };

        function ClearVoucher() {
            $scope.VoucherAmount = 0;
            $scope.VoucherNumber = "";
            $rootScope.CheckOutPaymentDTO.VoucherAmount = 0;
            $rootScope.CheckOutPaymentDTO.VoucherNo = "";
        }

        function UpdateAddressShoppingCart(fromInit) {
            return $q(function (resolve, reject) {
                $rootScope.CheckOutPaymentDTO.Branch = $scope.DefaultStore;
                $rootScope.CheckOutPaymentDTO.BranchID = $scope.DefaultStore;
                $rootScope.CheckOutPaymentDTO.IsCartLevelBranch = true;
                $rootScope.ShowLoader = true;

                $http({
                    url: dataService + '/UpdateAddressinShoppingCart',
                    method: 'POST',
                    headers: {
                        "Accept": "application/json;charset=UTF-8",
                        "Content-type": "application/json; charset=utf-8",
                        "CallContext": JSON.stringify(Context)
                    },
                    data: $rootScope.CheckOutPaymentDTO,
                }).then(function (result) {
                    result = result.data;
                    if ($rootScope.ShowLoader == true) {
                        $rootScope.ShowLoader = false;
                    }

                    if (result.operationResult == 1) {
                        $rootScope.StoreID = $scope.DefaultStore;
                        if (fromInit != true) {
                            $scope.GetShoppingCart();
                        }
                        resolve();
                        return;
                    }
                    else {
                        $rootScope.ShowToastMessage(result.Message);
                        reject();
                        return;
                    }

                }, function (err) {
                    if ($rootScope.ShowLoader == true) {
                        $rootScope.ShowLoader = false;
                    }
                    reject();
                });
            });
        }

        function AddressStatus() {
            $rootScope.ErrorMessage = "";
            $rootScope.SuccessMessage = "";

            $timeout(function () {
                $translate(['UPDATEYOURDELIVERYADDRESS']).then(function (translation) {
                    $rootScope.ShowToastMessage(translation.UPDATEYOURDELIVERYADDRESS);
                });
            }, 100);

            if (!$scope.DeliveryAddress.ContactID) {
                $http({
                    url: dataService + '/GetShippingAddressContacts',
                    method: 'GET',
                    headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
                }).then(function (result) {
                    result = result.data;
                    $scope.DeliveryAddress.ContactID = result;
                    $rootScope.ShowLoader = false;
                })
            }

            if ($scope.DeliveryAddress.ContactID) {
                $state.go('editaddress', {
                    loadBlocks: false,
                    addressID: $scope.DeliveryAddress.ContactID,
                    redirectUrl: 'checkout'
                });
            }
            else {
                $state.go('addaddress', {
                    loadBlocks: false,
                    redirectUrl: 'checkout'
                });
            }
            return;

        }

        $scope.DisplayDeliveryView = function () {
            if ($scope.isloaded) {
                $rootScope.ShowLoader = true;
                $scope.shoppingCart = null;
                if (!$scope.DeliveryAddress.ContactID) {
                    AddressStatus();
                }
                else {
                    if ($(".lnkOverlay").is(':visible')) {
                        $(".lnkOverlay").toggle();
                    }
                    var obj = $("#liDelivery");
                    UpdateAddressShoppingCart().then(function () {
                        ChangeTab(obj);
                        $rootScope.ShowLoader = false;
                    });
                }
            }
        };

        $scope.DisplayPaymentView = function () {
            if ($scope.isloaded) {
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
                    if (result.data.operationResult && result.data.operationResult === 2) {
                        $rootScope.ShowToastMessage(result.data.Message);
                        return;
                    } else {


                        //if any item is out of stock do not continue
                        var isAnyProductUnAvailable = false;
                        $.each($scope.shoppingCart.Products, function (index, product) {
                            if (product.AvailableQuantity === 0) {
                                isAnyProductUnAvailable = true;
                            }
                        });

                        if (isAnyProductUnAvailable) {
                            $translate('Fewproductsareoutofstock').then(function (translation) {
                                $rootScope.ShowToastMessage(translation);
                            });
                            var obj = $("#liDelivery");
                            UpdateAddressShoppingCart().then(function () {
                                ChangeTab(obj);
                            });
                            return;
                        }

                        if (!$scope.SelectedTimeSlotMapID) {

                            $translate('Pleaseselectyourpreferredtimeslot').then(function (translation) {
                                $rootScope.ShowToastMessage(translation);
                            });
                            return;
                        }
                        if (!isCartDeliveryUpdated) {
                            $scope.CartDeliverySelectionChanged();
                        }

                        checkDeliveryView();

                        if (!$scope.DeliveryAddress.ContactID) {
                            AddressStatus();
                        } else {
                            if ($(".lnkOverlay").is(':visible')) {
                                $(".lnkOverlay").toggle();
                            }
                            $("#delivery").hide();
                            var obj = $("#liPayment");
                            GetPaymentMethods();

                            ChangeTab(obj);
                        }

                    }

                }, function () {
                    $rootScope.ShowLoader = false;
                });

            }
        }

        $scope.GetInitialLoyalityPoints = function (loyalityInfo) {
            $scope.IsLoyaltyLoading = true;
            $http({
                url: rootUrl.UserServiceUrl + "/GetUserLoyaltyDetail",
                method: 'GET',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(Context)
                },
            })
                .then(function (result) {
                    if (result.data) {
                        var loyalityPayment = $scope.PaymentOptionsVirtual.find(x => x.PaymentMethodName == 'LoyalityPoints');
                        if (loyalityPayment) {
                            loyalityPayment.Amount = result.data.Amount;
                            loyalityPayment.Points = result.data.Points;
                        }
                    }
                    $scope.IsLoyaltyLoading = false;
                }, function () {
                    $scope.IsLoyaltyLoading = false;
                });
        }

        function GetPaymentMethods() {
            isPaymentLoading = true;
            if ($rootScope.ShowLoader == false) {
                $rootScope.ShowLoader = true;
                $scope.IsLoyaltyLoading = true;
            }

            $http({
                url: dataService + "/GetPaymentMethods",
                method: 'GET',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(Context)
                },
            })
                .then(function (result) {
                    result = result.data;
                    $timeout(function () {
                        $scope.PaymentOptions = result;
                        $scope.PaymentOptionsVirtual = result.filter(x => x.IsVirtual);
                        $scope.PaymentOptionsNonVirtual = result.filter(x => !x.IsVirtual);
                        DefaultPaymentOption();
                        if ($rootScope.ShowLoader == true) {
                            $rootScope.ShowLoader = false;
                        }
                        btnidPayment.disabled = false;
                    });
                    isPaymentLoading = false;
                }
                , function (err) {
                    if ($rootScope.ShowLoader == true) {
                        $rootScope.ShowLoader = false;
                    }
                    GetPaymentMethods();
                    isPaymentLoading = false;
                });

        }

        function DefaultPaymentOption() {
            var defaultPaymentOptionArray = $.grep($scope.PaymentOptions, function (n) { return n.IsDefaultPayment == true; });
            if (defaultPaymentOptionArray != undefined && defaultPaymentOptionArray != null && defaultPaymentOptionArray.length > 0) {
                $scope.SelectedPaymentOption.Value = defaultPaymentOptionArray[0].PaymentMethodID
            }

            if ($scope.SelectedPaymentOption.Value != null && $scope.SelectedPaymentOption.Value != undefined && $scope.SelectedPaymentOption != 0) {
                $timeout(function () {
                    $scope.isConfirmedPayment = true;
                });
            }

            $rootScope.CheckOutPaymentDTO.SelectedPaymentOption = $scope.SelectedPaymentOption.Value;
        };

        function ChangeTab(obj) {
            var curChildIndex = obj.parent().prevAll().length + 1;
            obj.parent().parent().children('.current').removeClass('current');
            obj.parent().addClass('current');
            obj.parent().parent().next('.tabContainer').children('.current').fadeOut('fast', function () {
                $(this).removeClass('current');
                $(this).parent().children('div:nth-child(' + curChildIndex + ')').fadeIn('normal', function () {
                    $(this).addClass('current');
                });
            });
        }


        $translate(['MOBILENO1', 'MOBILENO2', 'AREA', 'LANDMARK']).then(function (translation) {
            $scope.mobileno1 = translation.MOBILENO1;
            $scope.mobileno2 = translation.MOBILENO2;
            $scope.area = translation.AREA;
            $scope.landmark = translation.LANDMARK;

        });


        $scope.SetAddress = function (Address) {
            var FinalAddress = "";
            if (Address != null && Address != undefined && Address != "") {
                if (Address.AddressLine1) {
                    FinalAddress = FinalAddress.concat(Address.AddressLine1, " ");
                }
                if (Address.AddressLine2) {
                    FinalAddress = FinalAddress.concat(Address.AddressLine2);
                }
                if (Address.Areas) {
                    if (Address.Areas.Value) {
                        FinalAddress = FinalAddress.concat("&lt;br&gt;", $scope.area, Address.Areas.Value);
                    }
                }
                if (Address.LandMark) {
                    FinalAddress = FinalAddress.concat("&lt;br&gt;", $scope.landmark, Address.LandMark);
                }
                if (Address.MobileNo1) {
                    FinalAddress = FinalAddress.concat("&lt;br&gt;", $scope.mobileno1, Address.MobileNo1,);
                }
                if (Address.MobileNo2) {
                    FinalAddress = FinalAddress.concat("&lt;br&gt;", $scope.mobileno2, Address.MobileNo2, "");
                }
                return $scope.SkipValidation(FinalAddress);
            }
            return "";
        }

        $scope.SkipValidation = function (value) {
            if (value) {
                return $sce.trustAsHtml(jQuery.parseHTML(value)[0].textContent)
            }
        };

        $scope.AddNewDeliveryAddress = function () {
            $rootScope.StoreID = $scope.DefaultStore;
            $state.go("addaddress", { redirectURL: "checkout", firstAddress: !$scope.isConfirmedDeliveryAddress });
        }

        $scope.ListShippingAddress = function () {
            $state.go("allsavedaddress", { redirectURL: "checkout" });
        }

        $scope.ValidateVoucher = function () {
            if ($rootScope.ShowLoader == false) {
                $rootScope.ShowLoader = true;
            }
            $scope.VoucherError = "";
            $scope.VoucherAmount = 0;
            //if ($scope.VoucherNumber != "") {
            $http({
                url: dataService + "/ValidateVoucher?voucherNo=" + $scope.VoucherNumber,
                method: 'GET',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(Context)
                },
            })
                .then(function (result) {
                    //alert(result.Status);
                    //if (result.VoucherMessage == "" || result.VoucherMessage == null) {
                    if (result.Status == 11) {
                        //alert(result.CurrentBalance);
                        $scope.VoucherAmount = result.VoucherValue;
                        if (!(result.VoucherMessage == "" || result.VoucherMessage == null)) {
                            $scope.VoucherError = result.VoucherMessage;
                        }
                    }
                    else {
                        if (!(result.VoucherMessage == "" || result.VoucherMessage == null)) {
                            $scope.VoucherError = result.VoucherMessage;
                        }
                        else {
                            $translate(['PLEASETRYLATER']).then(function (translation) {
                                $rootScope.VoucherError = translation.PLEASETRYLATER;
                            });
                        }
                        //$("#" + windowName + " #spnVoucher").fadeIn();
                    }

                    $rootScope.CheckOutPaymentDTO.VoucherNo = $scope.VoucherNumber;
                    $rootScope.CheckOutPaymentDTO.VoucherAmount = $scope.VoucherAmount;
                    //if ($rootScope.ShowLoader == true) {
                    //    $rootScope.ShowLoader = false;
                    //}
                    $scope.GetShoppingCart();
                }
                , function (err) {
                    //alert("Pl try later")
                    if ($rootScope.ShowLoader == true) {
                        $rootScope.ShowLoader = false;
                    }
                    //alert(err);
                });
        }

        $scope.ProceedPayment = function (paymentType) {
            var btn = document.getElementById("btnidPayment");
            btn.disabled = true;
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
                    btn.disabled = false;
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
                    btn.disabled = false;
                    return;
                });
            }

            if (!($scope.isConfirmedDelivery && $scope.isConfirmedDeliveryAddress)) {
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
                    $rootScope.ShowLoader = false;
                    btn.disabled = false;
                    return;
                });
            }

            $rootScope.CheckOutPaymentDTO.SelectedPaymentOption = $scope.SelectedPaymentOption.Value;
            //check all cart details
            if ($scope.SelectedPaymentOption.Value > 0 && $scope.IsPrivacyPolicy == true) {
                var validationPromise = CheckBeforePayment();
                validationPromise.then(function (result) {
                    if (result == null || result == undefined || result == '') {

                        $rootScope.ShowLoader = false;
                        $timeout(function () {
                            $translate(['PLEASETRYLATER']).then(function (translation) {
                                $rootScope.ShowToastMessage(translation.PLEASETRYLATER, 'error');                               
                            });
                            //$rootScope.ErrorMessage = "Please try later";
                            btn.disabled = false;
                            return;
                        });
                    }
                    else {
                        if (result.operationResult == 1) {
                            SaveWebsiteOrder();
                        }
                        else {
                            $rootScope.ShowLoader = false;
                            $timeout(function () {
                                $rootScope.ShowToastMessage(result.Message, 'error'); 
                                btn.disabled = false;
                                return;
                            });
                        }
                    }
                });
            }
        }


        function SaveWebsiteOrder() {
            $rootScope.ShowLoader == true
            //$scope.CheckOutPaymentDTO.SelectedPaymentOption = 1
            //mastercard 

            if ($rootScope.CheckOutPaymentDTO.SelectedPaymentOption == 16) {
                $state.go('mastercardpayment');
                return;
            }

            //COD Order
            if ($rootScope.CheckOutPaymentDTO.SelectedPaymentOption == 5) {
                $translate(['GENERATINGORDER']).then(function (translation) {
                    $rootScope.LoadingMessage = translation.GENERATINGORDER;
                });
                //$rootScope.LoadingMessage = 'Generating Order';
            }

            if(window.device)
            {
                $rootScope.CheckOutPaymentDTO.DevicePlatorm = device.platform;
                $rootScope.CheckOutPaymentDTO.DeviceVersion = device.version;
            }
            
            $http({
                url: dataService + "/GenerateOrder",
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
                            if ($rootScope.ShowLoader == true) {
                                $rootScope.ShowLoader = false;
                            }
                            $rootScope.LoadingMessage = '';
                            $state.go("thankyou", { transactionNo: result.TransactionNo, cartID: result.CartID, orderHistory: JSON.stringify(result.orderHistory) });
                        }
                    }
                    else {
                        $state.go("cart");
                        $rootScope.LoadingMessage = '';
                        $rootScope.ShowOperationResultMessage(result.operationResult, 'error');
                    }

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
                url: dataService + "/ValidationBeforePayment",
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

        function CheckVoucher() {

            return $http({
                url: dataService + "/isVoucherPayment",
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

        $scope.PickStoreFromMap = function () {
            $scope.isGoogleMapStoreContainer = true;
            $timeout(function () {
                $(".googleMapStoreContainer").show();
            });
        }

        $scope.GetNearestBranch = function () {
            $rootScope.ShowLoader = true;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(setBranchLocation);
            }
        }

        function setBranchLocation(position) {
            $rootScope.LocateYourStore(position.coords.latitude + ',' + position.coords.longitude)
                .then(function (result) {
                    $timeout(function () {
                        $scope.$apply(function () {
                            $scope.DefaultStore = result.toString();
                            $('#DefaultStore').val(result.toString());
                            $rootScope.ShowLoader = false;
                        });
                    });
                });
        }

        $scope.SetBranchByMapper = function (map) {
            var selectedStore = $scope.Branches.find(x => parseFloat(x.Latitude) === map.position.lat() &&
                parseFloat(x.Longitude) == map.position.lng());

            if (selectedStore) {
                $timeout(function () {
                    $scope.$apply(function () {
                        $scope.DefaultStore = selectedStore.BranchIID.toString();
                    });
                });
            }
        }

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

        $rootScope.storeList = function (BranchIID) {
            $scope.DefaultStore = BranchIID.toString();
            $(".googleMapStoreContainer").hide();
        }

        $scope.getLoyaltyPoints = function (payment) {
            payment.PaidAmount = 0;
            payment.SelectedPoints = 0;
            $(".slideScale").css("width", 0);
            var rangeSlider = document.getElementById("rangeSlider");
            rangeSlider.oninput = function () {
                var sliderPos = rangeSlider.value / rangeSlider.max;
                var pixelPosition = rangeSlider.clientWidth * sliderPos;
                $(".slideScale").css("width", pixelPosition);
            };
            $scope.recalculateAmount(payment);
        }

        $scope.recalculateAmount = function (payment) {            
            $scope.shoppingCart.RemainingTotal = $scope.shoppingCart.Total - payment.PaidAmount;
            $rootScope.CheckOutPaymentDTO.LoyaltyAmount = payment.PaidAmount;
        }


        $scope.GetTaggedAddressMap = function (Latitude, Longitude) {
            if (Latitude) {

                $timeout(function () {
                    angular.element(document.getElementById('addressGoogleMap')).scope()
                        .LocateTaggedAddress(Latitude, Longitude);
                    $(".googleMapContainer").show();
                });
            } else {
                $translate(['YOUDONTHAVEANYADDRESS']).then(function (translation) {
                    $rootScope.ErrorMessage = translation.YOUDONTHAVEANYADDRESS;
                    $(".error-msg").removeClass('showMsg');
                    $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                        $(this).removeClass('showMsg');
                        $(this).dequeue();
                    });

                });

            }
        }


        $scope.LoadPrivacyPolicy = function () {
            $scope.showPrivacyPolicy = true;
            $(".termsWindow").fadeIn();
        }

        $scope.HidePrivacyPolicy = function () {
            $scope.showPrivacyPolicy = false;
            $(".termsWindow").fadeOut();
        }

        $scope.EditAddress = function (contactID) {
            $state.go('editaddress', { addressID: contactID, redirectURL: "allsavedaddress" });
        }

        $scope.SelectAddress = function (address) {
            $scope.SelectedDeliveryAddress = address.ContactID;
            $scope.GetDeliveryAddress(true);
            $('#deliveryaddress').focus();
        }
        
    $scope.DeleteAddress = function (contactID) {
        $rootScope.ErrorMessage = '';
        $rootScope.SuccessMessage = '';
        if ($rootScope.ShowLoader == false) {
            $rootScope.ShowLoader = true;
        }
        $http({
            url: dataService + "/RemoveContact?contactID=" + contactID,
            method: 'GET',
            headers: { "Accept": "application/json;charset=UTF-8", 
            "Content-type": "application/json; charset=utf-8", 
            "CallContext": JSON.stringify(Context) },
        }).then(function (result) {
            result = result.data;
            if (result.operationResult == 1) {
                for (var i = 0; i < $scope.AddressList.length; i++) {
                    if ($scope.AddressList[i].ContactID == contactID) {
                        $scope.AddressList.splice(i, 1);
                        break;
                    }
                }
                $rootScope.ShowLoader = false;
                $rootScope.ShowToastMessage(result.Message, 'success');          
                $scope.GetDeliveryAddress(true);     
            }
            else {
                $rootScope.ShowToastMessage(result.Message, 'error');
            }
            
            if ($rootScope.ShowLoader == true) {
                $rootScope.ShowLoader = false;
            }
        }
        , function (err) {
            if ($rootScope.ShowLoader == true) {
                $rootScope.ShowLoader = false;
            }
            $translate(['PLEASETRYLATER']).then(function (translation) {
                $rootScope.ShowToastMessage(translation.PLEASETRYLATER, 'error');
            });
        });
    }

        $scope.init();
    }]);