app.controller('OrderDetailOnlineController', ['$scope', '$http', 'loggedIn', 'rootUrl',
    '$location', 'GetContext', 'serviceCartCount',
    '$state', '$stateParams', '$sce', '$rootScope', '$translate', '$timeout', '$q', '$controller',
    function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount,
        $state, $stateParams, $sce, $rootScope, $translate, $timeout, $q, $controller) {
        var context = GetContext.Context();
        var dataService = rootUrl.RootUrl;
        $scope.OrderHistoryDetails = null;

        $scope.ActiveOrderActivities = [];
        $scope.AllOrderActivities = [];

        $scope.UserLoginID = context.LoginID;
        $scope.SelectedOrder = null;
        $scope.SuggestedSKUs = [];
        $scope.SelectedActivity = [];
        $scope.SelectedProduct = null;
        $scope.SuggestedNotes = null;
        $scope.OrderID = $stateParams.orderID;
        $scope.ShoppingCartCount = null;

        $scope.init = function () {
            $scope.GetOrderDetails($stateParams.orderID);
            $scope.GetShoppingCartCount();
        }

        $scope.CloseNotifyActivity = function (event, activity, index, statusID = 4) {
            if (!index) {
                index = $scope[activity.CollectionName].findIndex(x => x.ShoppingCartActivityLogIID == activity.ShoppingCartActivityLogIID);
            }

            $scope[activity.CollectionName].splice(index, 1);

            $http({
                url: rootUrl.EcommerceServiceUrl + '/UpdateCartActivityStatus?cartActivityID=' +
                    activity.ShoppingCartActivityLogIID + '&statusID=' + statusID,
                method: 'GET',
                headers: {
                    "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            }).then(function (result) {
                result = result.data;
            }, function (err) {
                $scope.orderDetailsLoader = false;
                $scope.ShowLoader = false;
            });
        }

        $scope.UpdateActivityActionStatus = function (event, activity, index, selectedSKU, statusID, suggestedSKUs) {
            $scope.ShowLoader = true;
            var selectedSkus = null;

            if (suggestedSKUs) {
                var selectedSkus = $scope.SuggestedSKUs.filter(x => x.IsSelected);
                selectedSkus = selectedSkus.map(function (data) { return { "SKUMapID": data.SKUID, "Quantity": data.Quantity } });
            }

            $http({
                url: rootUrl.EcommerceServiceUrl + '/UpdateCartActivityAction',
                method: 'POST',
                data: {
                    CartActivityID: $scope.SelectedActivity.ShoppingCartActivityLogIID,
                    StatusID: statusID,
                    Notes: $scope.SuggestedNotes,
                    SelectedSKUDetails: selectedSkus
                },
                headers: {
                    "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            }).then(function (result) {
                result = result.data;
                if (statusID == 2) {
                    $translate(['PRODUCTACCEPTANCE']).then(function (translations) {
                        $rootScope.ShowToastMessage(translations.PRODUCTACCEPTANCE, 'success');
                    });
                }
                else if (statusID == 3) {
                    $translate(['PRODUCTREJECTED']).then(function (translations) {
                        $rootScope.ShowToastMessage(translations.PRODUCTREJECTED, 'success');
                    });
                }

                // $scope.GetCartActivities($scope.OrderHistoryDetails.CartID, 'ActiveOrderActivities');
                $scope.ShowLoader = false;
            }, function (err) {
                $scope.orderDetailsLoader = false;
                $scope.ShowLoader = false;
                $translate(['ERROROCCUREDWHILESUBMITTINGTRYLATER']).then(function (translations) {
                    $rootScope.ShowToastMessage(translations.ERROROCCUREDWHILESUBMITTINGTRYLATER);
                });
            });
            $scope.hideRightPanel();
        }

        $scope.SelectProduct = function (event, product) {
            $scope.SelectedProduct = product;
        }


        $scope.GetCartActivities = function (cartID, activities, type) {
            $http({
                url: rootUrl.EcommerceServiceUrl + '/GetCartActivities?cartID=' + cartID + '&type=' + type,
                method: 'GET',
                headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(context) }
                //data: { pageSize: $scope.pageSize, pageNo: $scope.lazyLoadPageNumber }
            }).then(function (result) {
                result = result.data;
                $scope[activities] = result;
                $scope[activities].forEach(activity => {
                    activity.CollectionName = activities;
                    var map = activity.SKUs.find(x => x.StatusName);
                    if (map) {
                        activity.CartActivityStatusDisplay = map.StatusName;
                        $(".activityStatus").removeClass("bgYellow bgBlue").addClass("bgGreen");
                    }
                    else {
                        activity.CartActivityStatusDisplay = activity.CartActivityStatus;
                        $(".activityStatus").removeClass("bgYellow bgGreen").addClass("bgBlue");
                    }
                });

                //TODO should clear the timer all expired.
                var timer = setInterval(function () {
                    var activeCounter = 0;
                    $scope[activities].forEach(activity => {
                        var difference = new Date(activity.ExpiredDateTime) - new Date();

                        $scope.$apply(function () {
                            if (difference < 0) {
                                activity.ExpiredDateTimeDifference = undefined;
                            }
                            else {
                                activity.ExpiredDateTimeDifference = new Date(difference);
                                activeCounter++;
                            }
                        });
                    });

                    if (activeCounter === 0) {
                        clearInterval(timer);
                    }
                }, 1000);

            }, function (err) {
                $scope.orderDetailsLoader = false;
                $scope.ShowLoader = false;
            });
        }

        $scope.IsLoaded = false;
        $rootScope.ShowLoader = false;
        $scope.TranslatedStatus = { New: 'New', Picked: 'Picked', Packed: 'Packed', Shipped: 'Shipped', Delivered: 'Delivered', Cancelled: 'Cancelled' };

        // $translate(['New', 'Picked', 'Packed', 'Shipped', 'Delivered', 'Cancelled']).then(function (translations) {
        //   $scope.TranslatedStatus = translations;
        // });

        $translate(['MOBILENO1', 'MOBILENO2', 'AREA', 'LANDMARK', 'PrimaryContact', 'NAME', 'Email', 'ADDRESS',
            'LOCATION', 'HouseBuildingNo', 'PICKUP']).then(function (translation) {
                $scope.mobileno1 = translation.MOBILENO1;
                $scope.mobileno2 = translation.MOBILENO2;
                $scope.area = translation.AREA;
                $scope.landmark = translation.LANDMARK;
                $scope.PrimaryContact = translation.PrimaryContact;
                $scope.name = translation.NAME;
                $scope.email = translation.Email;
                $scope.address = translation.ADDRESS;
                $scope.HouseBuildingNo = translation.HouseBuildingNo;
                $scope.location = translation.LOCATION;
                $scope.pickfrom = translation.PICKUP;
            });

        $scope.GetOrderDetails = function (headID, event) {
            $scope.ShowLoader = true;
            $scope.OrderHistoryDetails = null;

            $http({
                url: dataService + '/GetOrderHistoryItemDetail?headID=' + headID,
                method: 'GET',
                headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(context) }
                //data: { pageSize: $scope.pageSize, pageNo: $scope.lazyLoadPageNumber }
            }).then(function (result) {
                result = result.data;
                $scope.OrderHistoryDetails = result[0];
                $scope.orderDetailsLoader = false;
                $scope.ShowLoader = false;
                // $scope.GetCartActivities($scope.OrderHistoryDetails.CartID, 'ActiveOrderActivities');
                // $timeout(function () {
                //   angular.element('#orderDetailComments').scope().GetComments(headID);
                // });
            }, function (err) {
                $scope.orderDetailsLoader = false;
                $scope.ShowLoader = false;
            });
        }

        $scope.SetAddress = function (Address, order) {
            var FinalAddress = "";
            if (order.DeliveryTypeID == 4) {
                FinalAddress = FinalAddress.concat('&lt;span class="labelText" &gt;', $scope.pickfrom, '&lt;/span&gt;', order.BranchName);
                return $scope.SkipValidation(FinalAddress);
            }
            if (Address != null && Address != undefined && Address != "") {

                if (order.CustomerName) {
                    FinalAddress = FinalAddress.concat('&lt;span class="labelText" &gt;', $scope.name,
                        '&lt;/span&gt;', Address.FirstName || order.CustomerName);
                }

                if (order.CustomerEmail) {
                    FinalAddress = FinalAddress.concat("&lt;br&gt;", '&lt;span class="labelText" &gt;',
                        $scope.email, " :", '&lt;/span&gt;', order.CustomerEmail);
                }

                if (Address.AddressLine1) {
                    FinalAddress = FinalAddress.concat("&lt;br&gt;", Address.AddressLine1, " ");
                }
                if (Address.AreaName) {
                    FinalAddress = FinalAddress.concat("&lt;br&gt;", '&lt;span class="labelText" &gt;', $scope.area, '&lt;/span&gt;', Address.AreaName);
                }

                if (Address.LocationName) {
                    FinalAddress = FinalAddress.concat("&lt;br&gt;", '&lt;span class="labelText" &gt;', $scope.location, '&lt;/span&gt;', Address.LocationName);
                }

                if (Address.LandMark) {
                    FinalAddress = FinalAddress.concat("&lt;br&gt;", '&lt;span class="labelText" &gt;', $scope.landmark, '&lt;/span&gt;', Address.LandMark);
                }
                if (Address.MobileNo1) {
                    FinalAddress = FinalAddress.concat("&lt;br&gt;", '&lt;span class="labelText" &gt;', $scope.mobileno1, '&lt;/span&gt;', Address.MobileNo1);
                }
                if (Address.MobileNo2) {
                    FinalAddress = FinalAddress.concat("&lt;br&gt;", '&lt;span class="labelText" &gt;', $scope.mobileno2, '&lt;/span&gt;', Address.MobileNo2,);
                }
                if (Address.BuildingNo) {
                    FinalAddress = FinalAddress.concat("&lt;br&gt;", '&lt;span class="labelText" &gt;', $scope.HouseBuildingNo, '&lt;/span&gt;', Address.BuildingNo,);
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

        $scope.Reorder = function (orderhistory) {
            $scope.ShowLoader = true;
            $http({
                url: dataService + '/ReOrder?headID=' + orderhistory.TransactionOrderIID,
                method: 'GET',
                headers: {
                    "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            }).then(function (result) {
                result = result.data;
                $scope.IsLoaded = true;
                $scope.ShowLoader = false;
                if ($clientSettings.SingleCheckout) {
                    $state.go('singlecheckout');
                } else { $state.go('cart'); }
            })
                , function (err) {
                    $scope.ShowLoader = false;
                };
        }

        $scope.GetActivityMapStatus = function (activity) {
            var map = activity.SKUs.find(x => x.StatusName);
            if (map) {
                return map.StatusName;
            }
            else {
                activity.CartActivityStatus;
            }
        }

        $scope.showRightPanel = function (event, headID, activity) {
            if (activity) {
                $scope.SelectedActivity = activity;
                $scope.SuggestedSKUs = activity.SKUs;

                $.each($scope.SuggestedSKUs, function (index, sku) {
                    sku.IsSelected = (sku.StatusID === 2);
                    sku.Quantity = sku.Quantity || 1;
                });
            }

            event.stopPropagation();
            var contentBlocks = $(event.currentTarget).attr('data-tab');
            $(".dataBlocks").hide();
            $(".rightPanelOverlay").show();
            $(".rightPanel").addClass("active");
            $('.dataBlocks[data-tab="' + contentBlocks + '"]').show();
            if (headID) {
                angular.element('#orderComments').scope().GetComments(headID);
            }
        }

        $scope.hideRightPanel = function () {
            $(".rightPanelOverlay").hide();
            $(".rightPanel").removeClass("active");
        }

        $scope.showOrderStatus = function (event, order) {
            $scope.SelectedOrder = order;
            event.stopPropagation();
            $(".orderStatusOverlay").show();
            $(".orderStatus").addClass("active");
            $(".orderstatusDetails").show();
            $(".productSearch").hide();
        }

        $scope.hideOrderStatus = function (event, type) {
            $(".orderStatusOverlay").hide();
            $(".orderStatus").removeClass("active");
        }

        $scope.toggleContent = function (event, type) {
            $(event.currentTarget).find(".toggleArrow").toggleClass("active");
            var toggleAttr = $(event.currentTarget).attr('data-toggle');
            $('.toggleItem[data-toggle="' + toggleAttr + '"').slideToggle("fast");

            if (type && type === 'activities') {
                // $scope.GetCartActivities($scope.OrderHistoryDetails.CartID, 'AllOrderActivities', 'all');
            }
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

        var downLoadFile;
        var permissions;

        $scope.DownloadInvoice = function (order) {

            $scope.ShowLoader = true;
            $http({
                url: rootUrl.EcommerceServiceUrl + '/DownloadInvoice?headID=' + order.TransactionOrderIID,
                method: 'GET',
                headers: {
                    "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            }).then(function (result) {
                result = result.data;
                downLoadFile = result;
                permissions = cordova.plugins.permissions;
                permissions.hasPermission(permissions.READ_MEDIA_IMAGES, checkPermissionCallback, null);
                $scope.ShowLoader = false;
            }
                , function (err) {
                    $scope.ShowLoader = false;
                });
        }

        function downloadFile(fileUrl) {
            var fileTransfer = new FileTransfer();
            var uri = encodeURI(fileUrl);
            const fileExtension = fileUrl.substr(fileUrl.lastIndexOf('.'))
            var localPath = cordova.file.externalApplicationStorageDirectory ? cordova.file.externalApplicationStorageDirectory
                : cordova.file.documentsDirectory;
            var localPath = localPath + 'TaxInvoice' + $scope.OrderHistoryDetails.TransactionNo + fileExtension;

            //check the file name has html, open in a window
            if (fileExtension.includes('.html')) {
                cordova.InAppBrowser.open(fileUrl);
            }
            else {
                fileTransfer.download(
                    uri, localPath, function (entry) {
                        cordova.plugins.fileOpener2.open(
                            localPath,
                            'application/pdf',
                            {
                                error: function (e) {
                                    console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                                },
                                success: function () {
                                    console.log('file opened successfully');
                                }
                            }
                        );
                    },

                    function (error) {
                        $translate(['PLEASETRYLATER']).then(function (translations) {
                            $rootScope.ShowToastMessage(translations.PLEASETRYLATER + '-' + localPath, 'error');
                        });
                    },

                    false
                );
            }
        }


        function checkPermissionCallback(status) {
            if (!status.hasPermission) { // does not get permission
                var errorCallback = function () {
                    console.warn('Storage permission is not turned on');
                }
                permissions.requestPermission(
                    permissions.READ_MEDIA_IMAGES,
                    function (status) {
                        if (!status.hasPermission) {
                            errorCallback();
                        } else {
                            // continue with downloading/ Accessing operation 
                            downloadFile(downLoadFile);
                        }
                    },
                    errorCallback);
            } else {
                downloadFile(downLoadFile);
            }
        }

        $scope.EmailInvoice = function (order) {
            $scope.ShowLoader = true;
            $http({
                url: rootUrl.EcommerceServiceUrl + '/EmailInvoice?headID=' + order.TransactionOrderIID,
                method: 'GET',
                headers: {
                    "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            }).then(function (result) {
                result = result.data;

                if (result.operationResult == 1) {
                    $rootScope.ShowToastMessage(result.Message, 'success');
                }
                else {
                    $rootScope.ShowToastMessage(result.Message, 'error');
                }

                $scope.ShowLoader = false;
            }
                , function (err) {
                    $scope.ShowLoader = false;
                });
        }

        $scope.cancelOrder = function ($event, order) {
            $rootScope.showModalWindow("Cancellation", "Alert!", "Are you sure you want to cancel this order?",
                "No", "Yes", undefined,
                function () {
                    $scope.ShowLoader = true;
                    $http({
                        url: rootUrl.EcommerceServiceUrl + '/CancelOrder?headID=' + order.TransactionOrderIID,
                        method: 'GET',
                        headers: {
                            "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8",
                            "CallContext": JSON.stringify(context)
                        }
                    }).then(function (result) {
                        result = result.data;
                        $scope.init();
                        if (result.operationResult == 1) {
                            $rootScope.ShowToastMessage(result.Message, 'success');
                        }
                        else {
                            $rootScope.ShowToastMessage(result.Message, 'error');
                        }

                        $scope.ShowLoader = false;
                    }
                        , function (err) {
                            $scope.ShowLoader = false;
                        });
                });
        }

        $scope.decreaseQty = function (qty, product, order) {
            if (qty > 1) {
                product.ActualQuantity = parseInt(qty) - 1;
                $scope.updateQuantity(order, product);
            }
        };

        $scope.increaseQty = function (qty, product, order) {
            product.ActualQuantity = parseInt(qty) + 1;
            $scope.updateQuantity(order, product);
        };

        $scope.resetNoQty = function (qty) {
            var inputVal = parseInt(qty);
            if (isNaN(inputVal)) {
                inputVal = 1;
            }
            $scope.selectedProductQuantity = inputVal;
            $('#qtydropdown').val(inputVal).trigger('input');
        };


        $scope.updateQty = function (qty) {
            var inputVal = parseInt(qty);
            if (inputVal == 0) {
                inputVal = 1;
            }
            if (isNaN(inputVal)) {
                inputVal = "";
            }
            $scope.selectedProductQuantity = inputVal;
            $('#qtydropdown').val(inputVal).trigger('input');
        };

        $scope.CartItemBuyAgain = function (orderDetails) {
            $rootScope.AddtoCart({ 'SKUID': orderDetails.ProductSKUMapID }, orderDetails.Quantity).then(function () {
                $scope.GetShoppingCartCount();
            });
        }

        $scope.GetShoppingCartCount = function () {
            var cartPromise = serviceCartCount.getProductCount(context, dataService);
            cartPromise.then(function (result) {
                $scope.ShoppingCartCount = result;
            }, function () {

            });
        }


        $scope.init();
    }]);