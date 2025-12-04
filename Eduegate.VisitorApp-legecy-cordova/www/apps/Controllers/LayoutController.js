app.controller('LayoutController', ['$scope', '$http', '$rootScope', '$state', '$window',
    'rootUrl', '$timeout', 'GetContext', '$q', 'serviceAddToCart', 'serviceCartCount', 'clientSettings', '$compile',
    function ($scope, $http, $rootScope, $state, $window, rootUrl,
        $timeout, GetContext, $q, serviceAddToCart, serviceCartCount, clientSettings, $compile
    ) {
        console.log('Layout Controller loaded.');
        var context = GetContext.Context();
        $rootScope.ClientSettings = clientSettings;
        var dataService = rootUrl.SchoolServiceUrl;

        $rootScope.ShowSettingDialog = null;
        $rootScope.LoadingMessage = '';
        $rootScope.ShowLoader = false;
        $rootScope.UserLanguage = "en";
        $rootScope.RootUrl = rootUrl;
        $rootScope.ShowPreLoader = false;
        $rootScope.BoilerPlates = [];
        $rootScope.ShowFilter = false;
        $rootScope.ShowAllergies = true;


        $rootScope.PageNumber = 0;
        $scope.Init = function () {
            $rootScope.menuNewUrl();
            $scope.RemoveOverlay();
            
            var promotionFlag = window.localStorage.getItem("ShowFilter");
            $rootScope.ShowFilter = promotionFlag == "false" ? false : true;

            var alergiesFlag = window.localStorage.getItem("ShowAllergies");
            $rootScope.ShowAllergies = alergiesFlag == "false" ? false : true;

        };

        if (!$rootScope.DefaultCurrency) {
            $rootScope.DefaultCurrency = "QAR";
        }

        $rootScope.DefaultCurrency = (function () {
            $rootScope.DefaultDisplayCurrency = $rootScope.DefaultCurrency;
        });

        $rootScope.UpdateContext = function (contextData) {
            var context = window.localStorage.getItem("context");
            if (!context) {
                Context = GetContext.Context();
                context = window.localStorage.getItem("context");
            }

            var localContext = jQuery.parseJSON(context);

            for (key in contextData) {
                localContext[key] = contextData[key];
            }

            window.localStorage.setItem("context", JSON.stringify(localContext));
        }

        $rootScope.CheckLogin = function () {
            var localContext = jQuery.parseJSON(window.localStorage.getItem("context"));
            var loggedInPromise = loggedIn.CheckLogin(localContext, dataService, 0);
            loggedInPromise.then(function (model) {
                if (model.data) {
                    if (model.data.LoginID) {
                        var setContextPrmoise = GetContext.GetApiKey();
                        setContextPrmoise.then(function (result) {
                            var isSet = GetContext.SetContext(model.data, result.data)
                            localContext = jQuery.parseJSON(window.localStorage.getItem("context"));
                            if (!(localContext.ApiKey == "" || localContext.ApiKey == undefined || localContext.ApiKey == null)) {
                                if (localContext.GUID != undefined && localContext.GUID != null && localContext.GUID != "") {
                                    var mergeCartPromise = serviceAddToCart.mergeCart();
                                    mergeCartPromise.then(function (result) {
                                        localContext = jQuery.parseJSON(window.localStorage.getItem("context"));
                                        localContext.GUID = null;
                                        window.localStorage.setItem("context", JSON.stringify(localContext));
                                        $state.go($scope.redirectUrl, null, { reload: true });
                                    });
                                }
                                else {
                                    $state.go($scope.redirectUrl, null, { reload: true });
                                }
                            }
                            else {
                                $translate(['ERRORWHILELOGIN']).then(function (translation) {
                                    $rootScope.ErrorMessage = translation.ERRORWHILELOGIN;
                                    $(".error-msg").removeClass('showMsg');
                                    $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                                        $(this).removeClass('showMsg');
                                        $(this).dequeue();
                                    });

                                });
                                //$rootScope.ErrorMessage = "Error while logging in";
                            }
                        });
                    }
                }
            }, function () { });
        }

        $rootScope.GetCartCounts = function () {
            var cartPromise = serviceCartCount.getCounts(Context, dataService);
            cartPromise.then(function (result) {
                $rootScope.Counts = result;
            }, function () {

            });
        }

        $rootScope.GetCartQuantity = function () {
            context = GetContext.Context();

            $http({
                method: 'GET',
                url: rootUrl.RootUrl + '/GetCartQuantity',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(Context)
                }
            }).then(function (result) {
                result = result.data;
                $rootScope.CartItemQuantity = result;
            }, function (err) {
                //resolve(null);
            });
        }

        $scope.RemoveOverlay = function () {
            if ($(".lnkOverlay").is(':visible')) {
                $(".lnkOverlay").toggle();
            }
        };

        $rootScope.menuNewUrl = function () {
            var random = Math.random();
            $rootScope.menuUrl = "partials/user-settings.html?random=" + random;
        };

        $scope.RemoveSideMenu = function () {
            $('body').removeClass('active');
            $('html').removeClass('active');
        }

        $scope.LoadOverlay = function (e) {
            if (!$(".lnkOverlay").is(':visible')) {
                $(".lnkOverlay").toggle();
            }
            if ($(".lnkOverlay").is(':visible')) {
                //e.preventDefault();
                $scope.BodyActive = true;
                $('body').addClass('active');
                $('html').addClass('active');
                $(".other_options li div.signup").hide();
            }
        }

        $('body').on('click', function (e) {
            if ($(e.target).closest('#searchbutton, .searchbar').length === 0) {
                $('.searchbar').hide();
            }
        });

        $rootScope.goBack = function () {
            $('.sidenav').sidenav('close');
            $window.history.back();
        }


        $rootScope.DarkMode = function () {
            KTThemeMode.setMode("dark");
        }
        $rootScope.Lightmode = function () {
            KTThemeMode.setMode("light");
        }


        $rootScope.CartItemQuantity = [];

        $rootScope.GetCartQuantity = function () {
            Context = GetContext.Context();

            $http({
                method: 'GET',
                url: rootUrl.RootUrl + '/GetCartQuantity',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(Context)
                }
            }).then(function (result) {
                result = result.data;
                $rootScope.CartItemQuantity = result;
            }, function (err) {
                //resolve(null);
            });
        }
        $rootScope.GetCartItemQuantity = function (SKUID) {
            var skuQuantity = $rootScope.CartItemQuantity.find(x => x.SKUID == SKUID);

            if (skuQuantity && skuQuantity.Quantity) {
                return skuQuantity.Quantity;
            }
            else {
                return 0;
            }
        }

        $rootScope.SignOut = function () {
            $('.sidenav').sidenav('close');
            $http({
                url: rootUrl.SecurityServiceUrl + "/Logout",
                method: 'GET',
                headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(context) }
            }).success(function (result) {
                if ($(".lnkOverlay").is(':visible')) {
                    $(".lnkOverlay").toggle();
                }

                // context = jQuery.parseJSON(window.localStorage.getItem("context"));
                // context.CompanyID = $rootScope.UserCountry;
                // context.SiteID = $rootScope.UserCountry;
                // context.LanguageCode = $rootScope.UserLanguage;
                // context.LoginID = null;
                // context.MobileNumber = null;
                // context.OTP = null;
                // context.IsGuestUser = false;
                // window.localStorage.setItem("context", JSON.stringify(context));
                // window.localStorage.setItem("customerName", "");
                //$scope.CheckLogin();           
            });
            window.localStorage.removeItem("context");
                $state.go(clientSettings.DefaultLoginState, null, { reload: true });
      
        }

        $rootScope.ShowToastMessage = function (message, type = 'error') {
            if (type == 'error') {
                $rootScope.ErrorMessage = message;
                $(".error-msg").removeClass('showMsg');
                $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                    $(this).removeClass('showMsg');
                    $(this).dequeue();
                });
                if ($(".lnkOverlay").is(':visible')) {
                    $(".lnkOverlay").toggle();
                }
            }
            else if (type == 'success') {
                $rootScope.SuccessMessage = message;
                M.toast({ html: message })
                $(".success-msg").removeClass('showMsg');
                $(".success-msg").addClass('showMsg').delay(2000).queue(function () {
                    $(this).removeClass('showMsg');
                    $(this).dequeue();
                });
            }
        }

        $rootScope.AddtoCart = function (product, quantity) {
            Context = GetContext.Context();
            return $q(function (resolve, reject) {

                $rootScope.ErrorMessage = '';
                $rootScope.SuccessMessage = '';
                $rootScope.ShowProgress = true;

                serviceAddToCart.addToCart(product.SKUID, quantity,
                    rootUrl.RootUrl, Context, $rootScope, $scope)
                    .then(function (result) {
                        if (result.operationResult == 1) {
                            $rootScope.ShowProgress = false;
                            const toastLiveExample = document.getElementById('liveToast')
                            const toast = new bootstrap.Toast(toastLiveExample , {
                                delay:2000,
                            })
                            navigator.vibrate(300); // 3000 is ignored
                            toast.show()
                        }
                        else {
                            $rootScope.ShowProgress = false;
                            $rootScope.ErrorMessage = result.Message;
                            $(".error-msg").removeClass('showMsg');
                            $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                                $(this).removeClass('showMsg');
                                $(this).dequeue();
                            });
                            resolve();
                        }
                    });

            });

        }

        
        $rootScope.GetShoppingCartCount = function () {
            var cartPromise = serviceCartCount.getProductCount(Context, rootUrl.RootUrl);
            cartPromise.then(function (result) {
                $scope.ShoppingCartCount = result;
            }, function () {

            });
        }
        $rootScope.showModalWindow = function (modalType, title, message,
            cancelbtnLabel, confirmbtnLabel, cancelEvent, confirmEvent) {
            confirmCallBack = confirmEvent;
            hideCallBack = cancelEvent;
            $("body").append('<div class="modalWindow" modalType="' + modalType + '">' +
                '<div class="modalWindowWrap">' +
                '<div class="modalWindowHeader">' + title + '</div>' +
                '<div class="modalWindowContent">' + message + '</div>' +
                '<div class="modalWindowControls pad10">' +
                '<button class="btnStyle medium" ng-click="removeModalWindow()">' + cancelbtnLabel + '</button>');
            if (confirmbtnLabel) {
                $(".modalWindowControls").append(
                    '<button class="btnStyle medium btn-primary" ng-click="confirmModalWindow()">' + confirmbtnLabel + '</button>');
            }

            $("body").append(
                '</div></div></div>');
            $compile($('.modalWindow[modalType="' + modalType + '"]').contents())($scope);
        }
        $rootScope.redirectPage = function (url, params) {
            $state.go(url, params);
        }

        $scope.confirmModalWindow = function () {
            $('.modalWindow').remove();

            if (confirmCallBack) {
                confirmCallBack();
            }
        }

        $scope.removeModalWindow = function () {
            $('.modalWindow').remove();

            if (hideCallBack) {
                hideCallBack();
            }
        }

        $rootScope.AddOrRemoveToWishList = function (rec) {
            Context = GetContext.Context();

            if (rec.IsWishList) {
                $http({
                    method: 'GET',
                    url: rootUrl.RootUrl + '/RemoveSaveForLater?skuID=' + rec.SKUID,
                    headers: {
                        "Accept": "application/json;charset=UTF-8",
                        "Content-type": "application/json; charset=utf-8",
                        "CallContext": JSON.stringify(Context)
                    }
                }).then(function (result) {
                    result = result.data;
                    rec.IsWishList = false;
                    $rootScope.SuccessMessage = result.Message;
                        const toastLiveExample = document.getElementById('liveToast')
                        const toast = new bootstrap.Toast(toastLiveExample , {
                            delay:2000,
                        })
    
                        toast.show()
                }, function (err) {

                });
            }
            else {
                $http({
                    method: 'GET',
                    url: rootUrl.RootUrl + '/AddSaveForLater?skuID=' + rec.SKUID,
                    headers: {
                        "Accept": "application/json;charset=UTF-8",
                        "Content-type": "application/json; charset=utf-8",
                        "CallContext": JSON.stringify(Context)
                    }
                }).then(function (result) {
                    result = result.data;
                    rec.IsWishList = true;
                    $rootScope.SuccessMessage = result.Message;
                        const toastLiveExample = document.getElementById('liveToast')
                        const toast = new bootstrap.Toast(toastLiveExample , {
                            delay:2000,
                        })
    
                        toast.show()
                }, function (err) {

                });
            }
        }
        
        $rootScope.SearchProducts = function ($event, filterBy, filterValue) {
            if (!filterBy) {
                filterBy = $state.params.filterBy;
            }

            if (!filterValue) {
                filterValue = $state.params.filterValue;
            }

            if ($event) {
                $event.preventDefault();
            }
            $rootScope.PageNumber = 0;
            $state.go('productlists', {
                searchText: $rootScope.searchText, filterBy: filterBy,
                filterValue: filterValue, filterText: $state.params.filterText, sortText: "relevance", pageType: "search",
                searchTitle: $rootScope.searchText
            }, { reload: true, inherit: false, notify: true });

            $rootScope.searchText = "";
        }

        $rootScope.IsProfileCompleted = function () {
            var localContext = jQuery.parseJSON(window.localStorage.getItem("context"));
            if (localContext.IsProfileCompleted || localContext.IsGuestUser) {
                return false;
            }
            else {
                return true;
            }
        }
        $rootScope.getDefaultStudent = function() {
            $http({
                method: 'GET',
                url: dataService + '/getDefaultStudent',
                headers: { 
                    "Accept": "application/json;charset=UTF-8", 
                    "Content-type": "application/json; charset=utf-8", 
                    "CallContext": JSON.stringify(context) 
                }
            }).success(function (result) {
                $scope.DefaultStudent = result;
                $rootScope.ShowLoader = false;
                
       
            });
        }
        $rootScope.GetStaticPage = function (pageId) {
            return $q(function (resolve, reject) {
                $http({
                    method: 'GET',
                    url: dataService + '/GetStaticPage?contentID=' + pageId,
                    headers: {
                        "Accept": "application/json;charset=UTF-8",
                        "Content-type": "application/json; charset=utf-8",
                        "CallContext": JSON.stringify(context)
                    }
                }).then(function (result) {
                    result = result.data;
                    resolve(result);
                }, function (err) {
                    resolve(null);
                });
            });
        }

    }]);