app.controller('ProductListWidgetByTagController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', 'serviceCartCount', '$state', 
    '$stateParams', '$sce', '$rootScope', 'serviceAddToCart', '$translate', '$timeout','$element',
     function ($scope, $http, loggedIn, rootUrl, 
        $location, GetContext, serviceCartCount, $state, $stateParams, $sce, $rootScope,
        serviceAddToCart, $translate, $timeout,$element) {
    var dataService = rootUrl.RootUrl; 
    $rootScope.CurrentPageName = 'ProductListByTag';
    
    var Context = GetContext.Context();
    //$scope.preventLoadBlocks = $scope.$parent.preventLoadBlocks === true;
    $scope.ProductIDs = "";
    $scope.ShowLoaders = false; 
    $scope.isLoaded = false;
    $scope.boilerPlateDTO = [];
    $scope.ProductTag = "";
    $scope.WidgetTitle = "";
    $scope.TitleCss = "";
    $scope.ProductLists = [];
    
	$scope.init = function () {
        $scope.GetProducts();
    }

    // function loadCarousel() {
    //     // $(".dsh-menu-cnt", $element).owlCarousel({
    //     //   margin: 0,
    //     //   loop: false,
    //     //   autoWidth: true,
    //     //   dots: false,
    //     //   autoplay: false,
    //     //   arrows: false,
    //     //   items: $scope.ProductLists.length + 1,
    //     // });  
        
    //     $('.tdys-deals-slider').owlCarousel({
    //         margin: 0,
    //         loop: false,
    //         autoWidth: true,
    //         dots: false,
    //         autoplay:false,
    //         arrows: false,
    //         items: $scope.ProductLists.length + 1
    //       }); 
    // }

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
                var index=0;
                $scope.ProductLists.forEach(product => {
                    product.SelectedCatalog = product;
                    // $rootScope.SetWishListFlag($scope.ProductLists, index);
                    index++;
                });

                $scope.ShowLoaders = false;
                $rootScope.ShowLoader = false;
            }

            // $timeout(function() { loadCarousel() });
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
                if (parameter.Key == "Title-" + Context.LanguageCode) {
                    return parameter.Value;
                }
            });

            if(!$scope.WidgetTitle || $scope.WidgetTitle.items.length == 0) {
                $scope.WidgetTitle = JSLINQ($scope.boilerPlateDTO.RuntimeParameters).Where(function (parameter) {
                    if (parameter.Key == "Title") {
                        return parameter.Value;
                    }
                });
            }
            
            $scope.WidgetTitle = $scope.WidgetTitle?.items[0]?.Value;
            var key = $scope.WidgetTitle?.toUpperCase().replace(' ', '');
            if(key) {
                $translate([key]).then(function(translations) {
                    $scope.WidgetTitle = translations[key] === key ?  $scope.WidgetTitle : translations[key];
                });
            }

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
            
            $scope.Parametervalues = JSLINQ($scope.boilerPlateDTO.RuntimeParameters).Where(function (parameter) {
                if (parameter.Key == "PricelistTypeID") {
                    $scope.filterValue = 'pricelisttype:';
                    return parameter.Value;
                }
            });


            if ($scope.Parametervalues.items.length == 0) {
                $scope.Parametervalues = JSLINQ($scope.boilerPlateDTO.RuntimeParameters).Where(function (parameter) {
                    if (parameter.Key == "PromotionPriceListCode") {
                        $scope.filterValue = 'PriceListCode:';
                        return parameter.Value;
                    }
                });
            }

            if ($scope.Parametervalues.items.length == 0) {
                $scope.Parametervalues = JSLINQ($scope.boilerPlateDTO.RuntimeParameters).Where(function (parameter) {
                    if (parameter.Key == "PromotionPriceListId") {
                        $scope.filterValue = 'pricelists:';
                        return parameter.Value;
                    }
                });
            }
              
            $scope.filterValue = $scope.Parametervalues.items.length == 0 ? 'activepricelists': $scope.filterValue ;

            if ($scope.Parametervalues && $scope.Parametervalues.items && $scope.Parametervalues.items[0]) {
                $scope.Parametervalues = $scope.Parametervalues.items[0].Value;
                $scope.RecommendedPricelist = $scope.Parametervalues;
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
