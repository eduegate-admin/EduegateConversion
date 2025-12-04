app.controller('ProductListWidgetByTagController', ['$scope', '$http', 'loggedIn', 'rootUrl', 
    '$location', 'GetContext', '$state', '$stateParams', '$sce', '$rootScope', '$q',
    function ($scope, $http, loggedIn, rootUrl, $location, GetContext, $state, $stateParams, $sce, $rootScope,
        $q) {
            var dataService = rootUrl.RootUrl;
    var Context = GetContext.Context();
    //$scope.preventLoadBlocks = $scope.$parent.preventLoadBlocks === true;
    $scope.ProductIDs = "";
    $scope.ShowLoaders = false;
    $scope.isLoaded = false;
    $scope.boilerPlateDTO = [];
    $scope.ProductTag = "";
    $scope.WidgetTitle = "";
    $scope.TitleCss = "";

	$scope.init = function () {
        $scope.GetProducts();
    }

	$scope.GetProducts = function () {
        $scope.ShowLoaders = true;
        var url = dataService + "/GetProducts";
        $http({
            url: url,
            method: 'POST',
            headers: { 
            "Accept": "application/json;charset=UTF-8", 
            "Content-type": "application/json; charset=utf-8", 
            "CallContext": JSON.stringify(Context) },
            data: $scope.boilerPlateDTO
		}).then(function (result) {
            result = result.data;
            if (result != undefined && result != null) {
                $scope.ProductLists = result;
                $scope.ShowLoaders = false;
            }
        });
    }
    $scope.ErrorImage = function () {
        return rootUrl.ErrorHomePageImageUrl;
    }

    $scope.SkipValidation = function (value) {
        if (value) {
            return $sce.trustAsHtml(jQuery.parseHTML(value)[0].textContent)
        }
    };

    $scope.$parent.$watch('details', function (value) {
        if ($scope.isLoaded == false) {
            $scope.isLoaded = true;
            $scope.boilerPlateDTO = value.boilerplate;

            $scope.ProductTag = JSLINQ($scope.boilerPlateDTO.RuntimeParameters).Where(function (parameter) {
                if (parameter.Key == "Tag") {
                    return parameter.Value;
                }
            });

        if ($scope.ProductTag && $scope.ProductTag.items && $scope.ProductTag.items[0]) {
          $scope.ProductTag = $scope.ProductTag.items[0].Value;
          $scope.RecommendedTag =  $scope.ProductTag;
        }

            $scope.WidgetTitle = JSLINQ($scope.boilerPlateDTO.RuntimeParameters).Where(function (parameter) {
                if (parameter.Key == "Title") {
                    return parameter.Value;
                }
            });
            
            


            $scope.TitleCss = JSLINQ($scope.boilerPlateDTO.RuntimeParameters).Where(function (parameter) {
                if (parameter.Key == "TitleCss") {
                    return parameter.Value;
                }
            });

            if($scope.TitleCss &&  $scope.TitleCss.items[0]) {
                $scope.TitleCss = $scope.TitleCss.items[0].Value; 
            }
            else {
                $scope.TitleCss = "";
            }
            
            $scope.init();
        }
    });


    $scope.AddtoCart = function (product, quantity, event) {
        event && event.stopPropagation();
        if(quantity < 0 && $rootScope.GetCartItemQuantity(product.SelectedCatalog.SKUID) <= 0) return;
 
        $rootScope.AddtoCart(product, quantity).then(function() {
         $scope.GetShoppingCartCount();
        });
     }
}]);
