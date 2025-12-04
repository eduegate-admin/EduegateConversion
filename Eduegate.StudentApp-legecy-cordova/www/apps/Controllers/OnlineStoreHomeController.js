app.controller('OnlineStoreHomeController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', "$timeout",'serviceCartCount',  function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout, serviceCartCount) {
    console.log('Online Store controller loaded.');
    var dataService = rootUrl.RootUrl;
    var Context = GetContext.Context();
    // $rootScope.ShowAllergies = true;
    $scope.ContentService = rootUrl.ContentServiceUrl;

    // $scope.ShowAllergies = $stateParams.showAllergies;
    $scope.ShowAllergies = false;
    var pageInfoPromise = null;
    // $rootScope.HomeBanners = [];
    // $rootScope.BoilerPlates = [];
    $scope.preventLoadBlocks = $stateParams.loadBlocks === 'false';

    $scope.initV2 = function (loadOnlyData) {
        // clear badget
        var firebasePlugin = window.FirebasePlugin ? window.FirebasePlugin : window.FCMPlugin ? window.FCMPlugin : null;

        if (firebasePlugin && firebasePlugin.setBadgeNumber) {
            firebasePlugin.setBadgeNumber(0);
        }


        Context = GetContext.Context();

        $rootScope.redirectionCount = 0;


        // $rootScope.menuNewUrl();
        $scope.GetShoppingCartCount();
        // $scope.GetSaveForCartCount();
        $scope.RemoveOverlay();
        $rootScope.ShowLoader = true;
        // $rootScope.OurTopOffers = [];
        // $rootScope.TrendingProducts = [];
        // $rootScope.Recommends = [];
        // $rootScope.RecentlyViewed = [];
        $rootScope.HomeBanners = [];
        $rootScope.BoilerPlates = [];
        $scope.getPageInfo();
        $scope.RemoveSideMenu();
        $scope.CheckLoginforCustomer();
        $rootScope.getDefaultStudent();
        if ($rootScope.ShowAllergies === true) {
            // $scope.OpenAllergies();

        }
    };
    $scope.allergiesClose = function (event, flag) {
        flag = !flag;
        window.localStorage.setItem("ShowAllergies", flag);
        $rootScope.ShowAllergies = flag;
    }
    $scope.OpenAllergies = function () {

        if (!$rootScope.ShowAllergies)
        { return;
        }
        const myModal = new bootstrap.Modal(document.getElementById('modal_new_target'))
        myModal.show()
    }
    $scope.getPageInfo = function () {

        if (pageInfoPromise) {
            if (pageInfoPromise.reject) {
              pageInfoPromise.reject("Aborted");
            }
          }

        pageInfoPromise = $http({
            url: dataService + '/GetPageInfo?pageID=1&parameter=',
            method: 'GET',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
        }).then(function (result) {
            pageInfoPromise = null;
            result = result.data;
            $rootScope.LoadingMessage = "";
            if (result != undefined && result != null && result.BoilerPlates != undefined && result.BoilerPlates != null) {
                $rootScope.BoilerPlates = result.BoilerPlates;
                $rootScope.ShowLoader = false;
            }
            else {
                $rootScope.ShowLoader = false;
            }
        }, function (err) {
            pageInfoPromise = null;
            $scope.getPageInfo();
        });
    };

    $scope.GetShoppingCartCount = function () {
            var cartPromise = serviceCartCount.getProductCount(Context, dataService);
            cartPromise.then(function (result) {
                $scope.ShoppingCartCount = result;
            }, function () {

            });
        }

    $scope.GetSaveForCartCount = function () {
            Context = GetContext.Context();
            var loggedInPromise = loggedIn.CheckLogin(Context, dataService);
            loggedInPromise.then(function (model) {
                if (model && model.data) {
                    if (model.data.LoginID) {
                        //Loggedin User
                        $scope.LoggedIn = true;
                        var saveForLaterCountPromise = serviceCartCount.getSaveForLaterCount(Context, dataService);
                        saveForLaterCountPromise.then(function (result) {
                            $scope.SaveForLaterCount = result.data;
                        });
                    }

                    if (model.data.Branch && !$rootScope.StoreID) {
                        Context.BranchID = model.data.Branch.BranchIID;
                        window.localStorage.setItem("context", JSON.stringify(Context));
                        $rootScope.StoreID = model.data.Branch.BranchIID;
                        $rootScope.StoreName = model.data.Branch.BranchName;
                    }
                }
            });
        }

    $scope.CheckLoginforCustomer = function () {
        $http({
            method: 'POST',
            url: dataService + '/CheckLoginforCustomer',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(Context)
            }
        }).success(function (result) {
            $scope.Customers = result;
            $rootScope.ShowLoader = false;
            $rootScope.ShowPreLoader = false;
        });
    }


    $scope.initV2();

}]);