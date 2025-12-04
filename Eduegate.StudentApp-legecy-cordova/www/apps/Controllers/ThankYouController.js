app.controller('ThankYouController', ['$scope', '$http', 'loggedIn', 'rootUrl',
'$location', 'GetContext', 'serviceCartCount',
'$state', '$stateParams', '$sce', '$rootScope', '$translate', '$timeout', '$q','$controller',
function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount,
    $state, $stateParams, $sce, $rootScope, $translate, $timeout, $q, $controller) {

        $scope.ShowLoader = false;
        var dataService = rootUrl.RootUrl;
        var Context = GetContext.Context();
        $scope.transactionNoOriginal = $stateParams.transactionNo;
        //alert($scope.transactionNoOriginal);
        var transactionNoSplitDummy = $scope.transactionNoOriginal? $scope.transactionNoOriginal.split(":") :'';
        //transactionNoSplitDummy = transactionNoSplitDummy.filter((v=>v != '' && v != null && v != undefined));
        transactionNoSplitDummy = transactionNoSplitDummy ? transactionNoSplitDummy.filter(Boolean) : null;
        $scope.orderHistory = $stateParams.orderHistory;
        $scope.OrderNote = '';
        $scope.CashChange = null;
        $scope.PaymentMethod = $scope.orderHistory.PaymentMethodText || $scope.orderHistory.PaymentMethod;
    
        $scope.EarnedPoints = 0;
        $scope.TotalAmount = 0;    
        $scope.PreviousOrderNote = '';
        $scope.StatusMessage = '';
        $scope.TransactionDate=$stateParams.transactiondate;
        $scope.UniqueID=$stateParams.trackID;
        $scope.Amount=$stateParams.Amount;
        if($scope.orderHistory) {
            $scope.EarnedPoints = $scope.orderHistory.LoyaltyPoints;
            $scope.TotalAmount = $scope.orderHistory.Total;
            $scope.DeliveryText = $scope.orderHistory.DeliveryText;
            $scope.DeliveryCharge = $scope.orderHistory.DeliveryCharge;
            $scope.ScheduleDate = $scope.orderHistory.ScheduledDateTime;
        }
    
        $scope.Deliveryslot = $stateParams.orderHistory ? $stateParams.orderHistory.TimeSlotText : null;
    
        $timeout(function () {
            $scope.transactionNoSplit = transactionNoSplitDummy;
        }, 0);
    
        $scope.ListBoilerPlates = { BoilerPlates: [], Controller: [] };
    
        $scope.HeadID = $stateParams.orderHistory.TransactionOrderIID;
        $scope.CartID = $stateParams.orderHistory.CartID;
        $scope.SaveForLaterCount = 0;
        $scope.ShoppingCartCount = 0;
    
        // $translate(['ShoppingCartNo', 'OrderNo']).then(function (translation) {
        //     $scope.ShoppingCartNo = translation.ShoppingCartNo;
        //     $scope.OrderNo = translation.OrderNo;
        // });
    
        $scope.Init = function () {
            // $scope.ShowLoader = false;
            // $scope.GetShoppingCartCount();
            // $scope.GetSaveForCartCount();
            // $scope.getPageInfo();
            // $scope.GetCashChanges();
            // $scope.ShowLoader = false;
        };
    
        $scope.GetShoppingCartCount = function () {
            var cartPromise = serviceCartCount.getProductCount(Context, dataService);
            cartPromise.then(function (result) {
                $scope.ShoppingCartCount = result;
            }, function () {
            });
        }
    
        $scope.GetSaveForCartCount = function () {
            var loggedInPromise = loggedIn.CheckLogin(Context, dataService);
            loggedInPromise.then(function (model) {
    
                if (model && model.data) {
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
    
        $scope.SkipValidation = function (value) {
            if (value) {
                return $sce.trustAsHtml(jQuery.parseHTML(value)[0].textContent)
            }
        };
    
        $scope.OptionClick = function () {
            $('.rightnav-cont').toggle();
        }
    
        $scope.GoHome = function () {
            $state.go("onlinestore", { loadBlocks: false });
        }
    
        $scope.GoMyOrder = function () {
            $state.go("orderhistory", { loadBlocks: false });
        }
    
        $scope.getPageInfo = function () {
            $http({
                url: dataService + '/GetPageInfo?pageID=42&parameter=""',
                method: 'GET',
                headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
            }).then(function (result) {
                result = result.data;
                if (result != undefined && result != null && result.BoilerPlates != undefined && result.BoilerPlates != null) {
                    for (var i = 0; i <= result.BoilerPlates.length - 1; i++) {
                        $scope.ListBoilerPlates.BoilerPlates.push(result.BoilerPlates[i]);
    
                    }
                }
            }, function (err) {

    
            });
        };
    
        $scope.SendNote = function(headID, orderNote) {
            $scope.ShowLoader = true;
    
            $http({
                url: rootUrl.EcommerceServiceUrl + "/SendNotes",
                method: 'POST',
                headers: { "Accept": "application/json;charset=UTF-8", 
                    "Content-type": "application/json; charset=utf-8", 
                    "CallContext": JSON.stringify(GetContext.Context()) },
                data: {
                    EntityType : 5,
                    ReferenceID : headID,
                    CommentText : orderNote,
                    Username : Context.LoginEmailID
                }
            }).then(function (result) {
                $scope.StatusMessage = "Your message has been sent!";
                $scope.PreviousOrderNote = orderNote;
                result = result.data;
                if (result.operationResult == 1) {
                    $rootScope.ShowToastMessage(result.Message, 'success');
                }
                else {
                    $rootScope.ShowToastMessage(result.Message);
                }          
                $scope.ShowLoader = false;
            }
            , function(err) {
                $translate(['PLEASETRYLATER']).then(function (translation) {
                    $rootScope.ShowToastMessage( translation.PLEASETRYLATER);
                });
                $scope.ShowLoader = false;
            });
        }
    
        $scope.GetCashChanges = function () {
            $http({
                url: rootUrl.EcommerceServiceUrl + '/GetChangesFor',
                method: 'GET',
                headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
            }).then(function (result) {
               $scope.CashChanges = result.data;
            }, function (err) {
    
            });
        };
    
        $scope.UpdateCashChanges = function (changeID) {
            $http({
                url: rootUrl.EcommerceServiceUrl + '/UpdateCashChangesFor?changeID=' + changeID + '&cartID=' +  $scope.CartID,
                method: 'GET',
                headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
            }).then(function (result) {
                $rootScope.ShowToastMessage(result.data.Message, 'success');
            }, function (err) {
                $translate(['PLEASETRYLATER']).then(function (translation) {
                    $rootScope.ShowToastMessage(translation.PLEASETRYLATER);
                });            
            });
        };
    
        // $scope.init();
    
    }]);