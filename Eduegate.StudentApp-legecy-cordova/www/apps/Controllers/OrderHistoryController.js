app.controller('OrderHistoryController', ['$scope', '$http', 'loggedIn', 'rootUrl', 
'$location', 'GetContext', '$state', '$stateParams', '$sce', '$rootScope', '$q','serviceAddToCart','serviceCartCount','$translate','$timeout',
function ($scope, $http, loggedIn, rootUrl, $location, GetContext, $state, $stateParams, $sce, $rootScope,
    $q,serviceAddToCart,serviceCartCount,$translate,$timeout) {
        console.log('Order History Controller loaded.');
        const Context = GetContext.Context();
        const dataService = rootUrl.RootUrl;
        $scope.ShoppingCartCount = 0;
        $scope.SaveForLaterCount = 0;
        $scope.OrderHistory = [];
        $scope.NormalOrderHistory = [];
        $scope.SubscriptionOrderHistory = [];
        $scope.OfflineOrderHistory = [];
        $scope.IsLoaded = false;

        $scope.orderDetailsLoader = false;
        $scope.isVoucher = false;
        $scope.isWallet = false;
        $scope.pageSize = 12;
        $scope.lazyLoadPageNumber = 0;
        $scope.attachWayPoints = true;
        $scope.isLazyLoadData = true;
        $scope.pagereLoaded = true;
        $scope.OrdersLoaded = { headID: [], data: [] };

        $scope.OrderHistoryDetails = null;
        $scope.SelectedOrder = null;
        $scope.refresher = null;
        $scope.isGoogleMapStoreContainer = false;
        $scope.TranslatedStatus = {};

        $translate(['New', 'Picked', 'Packed', 'Shipped', 'Delivered']).then(function (translations) {
            $scope.TranslatedStatus = translations;

        });

        $scope.initV2 = function () {
            $scope.pagereLoaded = true;
            $scope.IsLoaded = false;
            $scope.OrderHistory = [];
            $scope.OfflineOrderHistory = [];
            $scope.OrdersLoaded = { headID: [], data: [] };
            $scope.lazyLoadPageNumber = 0;
            $scope.attachWayPoints = true;
            $scope.isLazyLoadData = true;
            $rootScope.ShowLoader = true;
            $scope.GetSaveForCartCount();
            $scope.GetShoppingCartCount();
            $scope.GetOrderHistory();
            $scope.InitializeWayPoint();
            // $scope.GetCanteenNormalOrderHistoryDetails();
           // $scope.pullRefresh();

            // $scope.setScroll = function () {
            //     $(".orderTabsContent").scroll(function () {
            //         $scope.scrollPoint = $(this).scrollTop();
            //         console.log($scope.scrollPoint);
            //         if ($scope.scrollPoint == 0) {
            //             $scope.pullRefresh();
            //         }
            //         else {
            //             $scope.destroyRefresh();
            //         }
            //     });
            // }


            var swipeContainer = document.querySelector('.swipeData');
            var hammerEvent = new Hammer(swipeContainer);
            hammerEvent.on('swipe', function (e) {
                if (e.deltaX >= 50) {
                    // console.log("swiped Right");
                    $(".orderTabs .tabItem[data-tab='onlineOrders']").trigger('click');
                }
                else if (e.deltaX <= -50) {
                    // console.log("swiped Left");
                    $(".orderTabs .tabItem[data-tab='offlineOrders']").trigger('click');
                }
            });
        }

        // $scope.pullRefresh = function () {
        //     $scope.refresher = PullToRefresh.init({
        //         mainElement: '.pagesections',
        //         triggerElement: ".orderpageGrid",
        //         onRefresh: function () {
        //             $scope.GetSaveForCartCount();
        //             $scope.GetShoppingCartCount();
        //             $scope.InitializeWayPoint();
        //             $scope.init();
        //         }
        //     });
        // }

        // $scope.destroyRefresh = function () {
        //     $scope.refresher.destroy();
        // }

        $scope.GetSaveForCartCount = function () {
            var loggedInPromise = loggedIn.CheckLogin(Context, dataService);
            loggedInPromise.then(function (model) {

                if (model.data) {
                    if (model.data.LoginID) {
                        //Loggedin User
                        $scope.LoggedIn = true;
                        var SaveForLaterCountPromise = serviceCartCount.getSaveForLaterCount(Context, dataService);
                        SaveForLaterCountPromise.then(function (result) {
                            $scope.SaveForLaterCount = result.data;
                        });
                    }
                }
            }, function () { });
        }

        $scope.GetShoppingCartCount = function () {
            var cartPromise = serviceCartCount.getProductCount(Context, dataService);
            cartPromise.then(function (result) {
                $scope.ShoppingCartCount = result;
            }, function () {

            });

        }

        $scope.OptionClick = function () {
            $('.rightnav-cont').toggle();
        }

        $scope.InitializeWayPoint = function () {
            $timeout(function () {
                var opts = {
                    offset: '150%',
                    context: ".tableContent"
                };

                $(".AttachWayPointsDiv").waypoint(function () {
                    if ($scope.attachWayPoints && $scope.lazyLoadPageNumber - $rootScope.PageNumber <= 1) {
                        $("#LoadLi").css("display", "block");
                        $scope.lazyLoadPageNumber = $scope.lazyLoadPageNumber + 1;
                        $scope.GetOrderHistory(true);
                    }
                }, opts);
            });

            if ($scope.pagereLoaded === true) {
                $('.orderTabs .tabItem').removeClass('active');
                $(".orderListData").hide();
                $('.orderTabs .tabItem[data-tab="onlineOrders"]').addClass('active');
                $(".orderListData[data-tab='onlineOrders']").show();
                $scope.pagereLoaded = false;
            }
        }

        $scope.SkipValidation = function (value) {
            if (value) {
                return $sce.trustAsHtml(jQuery.parseHTML(value)[0].textContent)
            }
        };

        $scope.GetOrderHistory = function (attachwaypoints) {
            $scope.attachWayPoints = false;

            $http({
                url: dataService + '/OnlineStoreGetOrderHistoryDetails?pageSize=' + $scope.pageSize + "&pageNo=" + $scope.lazyLoadPageNumber,
                method: 'GET',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(Context)
                }
            }).then(function (result) {
                $timeout(function () {
                    $scope.$apply(function () {
                        $("#LoadLi").css("display", "none");
                        result = result.data;
                        $scope.IsLoaded = true;

                        if (result.length > 0) {
                            $.each(result, function (index, item) {
                                $scope.OrderHistory.push(item);
                            });

                            if (result.length < $scope.pageSize) {
                                attachwaypoints = false;
                                $scope.attachWayPoints = false;
                            }
                            else {
                                attachwaypoints = true;
                                $scope.attachWayPoints = true;
                            }
                        }
                        else {
                            attachwaypoints = false;
                            $scope.attachWayPoints = false;
                        }

                        if ($scope.isLazyLoadData) {
                            $scope.InitializeWayPoint();
                        }

                        $scope.attachWayPoints = attachwaypoints;

                        if ($rootScope.ShowLoader == true) {
                            $rootScope.ShowLoader = false;
                        }
                    }), function (err) {
                        $scope.IsLoaded = true;
                        if ($rootScope.ShowLoader == true) {
                            $rootScope.ShowLoader = false;
                        }
                    };
                });
            });
        }

        $scope.GetTotalProductQuantity = function () {
            var totalquantity = 0;
            if ($scope.OrderHistory) {
                $.each($scope.OrderHistory.OrderDetails, function (index, item) {
                    totalquantity = totalquantity + item.ActualQuantity;
                });
                return totalquantity;
            }

        }


        $scope.formatDate = function (date) {
            var newdate = date.trim().substr(date.indexOf("(") + 1);
            newdate = newdate.trim().substr(0, newdate.indexOf(")"));
            var dateOut = new Date(parseInt(newdate.split(",")[0]));
            var month = dateOut.getMonth() + 1
            var dateFinal = dateOut.getDate() + "/" + month + "/" + dateOut.getFullYear();
            return dateFinal;
        }

        $scope.ErrorImage = function () {
            return rootUrl.ErrorProductImageUrl;
        }

        $scope.SkipValidation = function (value) {
            if (value) {
                return $sce.trustAsHtml(jQuery.parseHTML(value)[0].textContent)
            }
        };

        $scope.AddtoCart = function (SKUID, quantity) {
            //alert("hi");
            if ($rootScope.ShowLoader == false) {
                $rootScope.ShowLoader = true;
            }

            $rootScope.ErrorMessage = '';
            $rootScope.SuccessMessage = '';
            var AddtoCartPromise = serviceAddToCart.addToCart(SKUID, quantity, rootUrl.RootUrl, Context, $rootScope);
            AddtoCartPromise.then(function (result) {
                if (result.operationResult == 1) {
                    //alert(result.data.Message);
                    $scope.GetShoppingCartCount();
                    if ($rootScope.ShowLoader == true) {
                        $rootScope.ShowLoader = false;
                    }
                    $rootScope.SuccessMessage = result.data.Message;
                    $(".success-msg").removeClass('showMsg');
                    $(".success-msg").addClass('showMsg').delay(2000).queue(function () {
                        $(this).removeClass('showMsg');
                        $(this).dequeue();
                    });

                }
                else {
                    //alert(result.data.Message);
                    if ($rootScope.ShowLoader == true) {
                        $rootScope.ShowLoader = false;
                    }
                    $rootScope.ErrorMessage = result.data.Message;
                    $(".error-msg").removeClass('showMsg');
                    $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                        $(this).removeClass('showMsg');
                        $(this).dequeue();
                    });

                }
            });
        }

        $scope.GetProductImage = function (imagePath) {
            return rootUrl.ImageUrl + imagePath;
        }

        $scope.GetConcatenatedValue = function (a, b) {
            var c = a.concat(b);
            var finalText = $scope.SkipValidation(c);
            return finalText;
        }

        $scope.ErrorImage = function () {
            return rootUrl.ErrorProductImageUrl;
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
                if (Address.FirstName != undefined && Address.FirstName != "" && Address.FirstName != null) {
                    FinalAddress = FinalAddress.concat("&lt;b&gt;", Address.FirstName);
                }
                if (Address.LastName != undefined && Address.LastName != "" && Address.LastName != null) {
                    FinalAddress = FinalAddress.concat(" &lt;b&gt;", Address.LastName);
                }
                if (Address.AreaName != undefined && Address.AreaName != "" && Address.AreaName != null) {
                    FinalAddress = FinalAddress.concat("&lt;br&gt;", $scope.area, Address.AreaName);
                }
                if (Address.LandMark != undefined && Address.LandMark != "" && Address.LandMark != null) {
                    FinalAddress = FinalAddress.concat("&lt;br&gt;", $scope.landmark, Address.LandMark);
                }
                if (Address.MobileNo1 != undefined && Address.MobileNo1 != "" && Address.MobileNo1 != null) {
                    FinalAddress = FinalAddress.concat("&lt;br&gt;", $scope.mobileno1, Address.MobileNo1);
                }
                if (Address.MobileNo2 != undefined && Address.MobileNo2 != "" && Address.MobileNo2 != null) {
                    FinalAddress = FinalAddress.concat("&lt;br&gt;", $scope.mobileno2, Address.MobileNo2);
                }
                return $scope.SkipValidation(FinalAddress);
            }
            return "";
        }

        $scope.Resend = function (headID) {
            $rootScope.ShowLoader = true;
            $rootScope.SuccessMessage = "";
            $rootScope.ErrorMessage = "";
            $http({
                url: dataService + "/ResendMail",
                method: 'POST',
                headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
                data: "{\"headID\":\"" + JSON.stringify(headID) + "\"}",
            }).then(function (result) {
                result = result.data;
                $rootScope.SuccessMessage = result.Message;
                $rootScope.ShowLoader = false;
            }, function (err) {
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
            });
        }

        $scope.showOrderStatus = function (event, order) {
            $scope.SelectedOrder = order;
            event.stopPropagation();
            $(".orderStatusOverlay").show();
            $(".orderStatus").addClass("active");
            $(".orderstatusDetails").show();
            $(".productSearch").hide();
        }

        $scope.hideOrderStatus = function (event) {
            $(".orderStatusOverlay").hide();
            $(".orderStatus").removeClass("active");
        }

        $scope.showOrderTabs = function (event) {
            $(".tabMenu span.tabItem").removeClass("active");
            $(".orderListData").fadeOut();
            var activeTab = $(event.target).attr("data-tab");
            $(".tabMenu span.tabItem[data-tab=" + activeTab + "]").addClass("active");
            $(".orderListData[data-tab=" + activeTab + "]").fadeIn();
        }

        $scope.showOfflineOrderTabs = function (event) {
            $rootScope.ShowLoader = true;
            $scope.IsLoaded = false;
            $scope.OfflineOrderHistory = [];
            $("#LoadLi").css("display", "block");
            $(".tabMenu span.tabItem").removeClass("active");
            $(".orderListData").fadeOut();
            var activeTab = $(event.target).attr("data-tab");
            $(".tabMenu span.tabItem[data-tab=" + activeTab + "]").addClass("active");
            $(".orderListData[data-tab=" + activeTab + "]").fadeIn();

            $http({
                url: dataService + '/GetOfflineOrderHistoryDetails?pageSize=' + $scope.pageSize + "&pageNo=" + $scope.lazyLoadPageNumber,
                method: 'GET',
                headers: {
                    "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(Context)
                }
            }).then(function (result) {
                result = result.data;
                $("#LoadLi").css("display", "none");
                if (result.length > 0) {
                    $.each(result, function (index, item) {
                        $scope.OfflineOrderHistory.push(item);
                    });

                    if (result.length < $scope.pageSize) {
                        //alert('catalog length <');
                        attachwaypoints = false;
                        $scope.attachWayPoints = false;
                    }
                    else {
                        attachwaypoints = true;
                        $scope.attachWayPoints = true;
                    }
                }
                else {
                    attachwaypoints = false;
                    $scope.attachWayPoints = false;
                }

                if ($scope.isLazyLoadData) {

                    $scope.InitializeWayPoint();
                }
                //$scope.$apply();
                $timeout(function () {
                    $scope.attachWayPoints = attachwaypoints;

                }, 100);
                $scope.IsLoaded = true;
                $rootScope.ShowLoader = false;
            })
                , function (err) {
                    //alert("Pl try later");
                    //if ($rootScope.ShowLoader == true) {
                    //    $rootScope.ShowLoader = false;
                    //}
                };
            // $("#swipeOrderTabs").hammer()
            // .bind("swipe", function(ev) {
            //     console.log(ev);
            // });
        }

        $scope.Reorder = function (orderhistory) {
            $rootScope.ShowPreLoader = true;
            $rootScope.ShowLoader = true;
            $http({
                url: dataService + '/ReOrder?headID=' + orderhistory.TransactionOrderIID,
                method: 'GET',
                headers: {
                    "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(Context)
                }
            }).then(function (result) {
                result = result.data;
                $scope.IsLoaded = true;
                $state.go('singlecheckout');
                $rootScope.ShowPreLoader = false;
                $rootScope.ShowLoader = false;
            })
                , function (err) {
                    $rootScope.ShowPreLoader = false;
                    $rootScope.ShowLoader = false;
                };
        }

        $scope.showDriverLocateMap = function (event, order) {
            if (order) {
                $scope.SelectedOrder = order;
            }
            if (!$scope.isGoogleMapStoreContainer) {
                $scope.isGoogleMapStoreContainer = true;
            }

            $timeout(function () {
                $scope.hideOrderStatus();
                $(".trackDriverMap").show();
                $timeout(function () {
                    angular.element(document.getElementById('trackDriverMap')).scope()
                        .initDriverMapLocationPicker($scope.SelectedOrder.TransactionOrderIID);
                }, 2000);
            });
        }

        $scope.ProceedPayment = function (order) {
            if(!$rootScope.CheckOutPaymentDTO) {
                $rootScope.CheckOutPaymentDTO = {};
            }
            
            $rootScope.CheckOutPaymentDTO.ShoppingCartID = order.CartID;
            $rootScope.CheckOutPaymentDTO.SelectedShippingAddress = order.DeliveryAddress.ContactID;
            $rootScope.CheckOutPaymentDTO.Branch = order.BranchID;
            $rootScope.CheckOutPaymentDTO.BranchID = order.BranchID;
            $rootScope.CheckOutPaymentDTO.IsCartLevelBranch = true;
            $rootScope.CheckOutPaymentDTO.SelectedPaymentOption = order.CartPaymentMethod;
            $rootScope.CheckOutPaymentDTO.VoucherNo = order.VoucherNumber;
            $rootScope.CheckOutPaymentDTO.VoucherAmount = order.VoucherAmount || 0;

            if(window.device)
            {
                $rootScope.CheckOutPaymentDTO.DevicePlatorm = device.platform;
                $rootScope.CheckOutPaymentDTO.DeviceVersion = device.version;
            }

            //if (order.PaymentMethod == 16) {                
                $state.go('mastercardpayment',{
                    cartID: order.CartID,
                    order: JSON.stringify(order),
                  });
                return;
            //}
        }

        $scope.GetSubscriptionOrderHistoryDetails = function () {
            $scope.attachWayPoints = false;
            $scope.ScheduledOrderHistoryDetails = null;

            $http({
                url: dataService + '/GetSubscriptionOrderHistoryDetails?pageSize=' + $scope.pageSize + "&pageNo=" + $scope.lazyLoadPageNumber,
                method: 'GET',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(Context)
                }
            }).then(function (result) {
                $timeout(function () {
                    $scope.$apply(function () {
                        $("#LoadLi").css("display", "none");
                        result = result.data;
                        $scope.ScheduledOrderHistoryDetails = result;
                  
                        
                        $scope.IsLoaded = true;

                        if (result.length > 0) {
                            $.each(result, function (index, item) {
                                $scope.SubscriptionOrderHistory.push(item);
                            });

                            if (result.length < $scope.pageSize) {
                                attachwaypoints = false;
                                $scope.attachWayPoints = false;
                            }
                            else {
                                attachwaypoints = true;
                                $scope.attachWayPoints = true;
                            }
                        }
                        else {
                            attachwaypoints = false;
                            $scope.attachWayPoints = false;
                        }

                        if ($scope.isLazyLoadData) {
                            $scope.InitializeWayPoint();
                        }

                        $scope.attachWayPoints = attachwaypoints;

                        if ($rootScope.ShowLoader == true) {
                            $rootScope.ShowLoader = false;
                        }
                    }), function (err) {
                        $scope.IsLoaded = true;
                        if ($rootScope.ShowLoader == true) {
                            $rootScope.ShowLoader = false;
                        }
                    };
                });
            });
        }

        $scope.GetCanteenNormalOrderHistoryDetails = function () {
            var sel = document.querySelector('#ex1-tab-3')
            bootstrap.Tab.getOrCreateInstance(sel).show()
            $scope.attachWayPoints = false;
            $scope.NormalOrderHistoryDetails = null;
            $http({
                url: dataService + '/GetCanteenNormalOrderHistoryDetails?pageSize=' + $scope.pageSize + "&pageNo=" + $scope.lazyLoadPageNumber,
                method: 'GET',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(Context)
                }
            }).then(function (result) {
                $timeout(function () {
                    $scope.$apply(function () {
                        $("#LoadLi").css("display", "none");
                        result = result.data;
                        $scope.NormalOrderHistoryDetails = result;
                       
                        
                        $scope.IsLoaded = true;

                        if (result.length > 0) {
                            $.each(result, function (index, item) {
                                $scope.NormalOrderHistory.push(item);
                            });

                            if (result.length < $scope.pageSize) {
                                attachwaypoints = false;
                                $scope.attachWayPoints = false;
                            }
                            else {
                                attachwaypoints = true;
                                $scope.attachWayPoints = true;
                            }
                        }
                        else {
                            attachwaypoints = false;
                            $scope.attachWayPoints = false;
                        }

                        if ($scope.isLazyLoadData) {
                            $scope.InitializeWayPoint();
                        }

                        $scope.attachWayPoints = attachwaypoints;

                        if ($rootScope.ShowLoader == true) {
                            $rootScope.ShowLoader = false;
                        }
                    }), function (err) {
                        $scope.IsLoaded = true;
                        if ($rootScope.ShowLoader == true) {
                            $rootScope.ShowLoader = false;
                        }
                    };
                });
            });
        }

        $scope.initV2();
        $scope.pagereLoaded = true;
    }]);