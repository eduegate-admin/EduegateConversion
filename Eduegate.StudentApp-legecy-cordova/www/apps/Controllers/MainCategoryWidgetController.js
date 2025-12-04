app.controller("MainCategoryWidgetController", [
  "$scope",
  "$http",
  "loggedIn",
  "rootUrl",
  "$location",
  "GetContext",
  "serviceCartCount",
  "$state",
  "$stateParams",
  "$sce",
  "$rootScope",
  "serviceAddToCart",
  "$translate",
  "$timeout",
  "$element",
  function (
    $scope,
    $http,
    loggedIn,
    rootUrl,
    $location,
    GetContext,
    serviceCartCount,
    $state,
    $stateParams,
    $sce,
    $rootScope,
    serviceAddToCart,
    $translate,
    $timeout,
    $element
  ) {
    console.log('Main Category Widget Controller loaded.');
    var dataService = rootUrl.RootUrl;
    var Context = GetContext.Context();
    //$scope.preventLoadBlocks = $scope.$parent.preventLoadBlocks === true;
    $scope.ProductIDs = "";
    $scope.ShowLoaders = false;
    $scope.isLoaded = false;
    $scope.boilerPlateDTO = {};
    $scope.ProductTag = "";
    $scope.SearchText = "";
    
    $translate(["ShopByCategory"]).then(function (translations) {
      $scope.WidgetTitle = translations.ShopByCategory;
    });

    //MainCategoryWidgetController
    $scope.init = function () {
      $scope.GetCategories();      
    };

    $scope.SearchCategory = function(searchText) {
      $scope.GetCategories(searchText);
    }

    function loadCarousel() {
        $(".dsh-cat-slider", $element).owlCarousel({
          margin: 0,
          loop: false,
          autoWidth: true,
          dots: false,
          autoplay: false,
          arrows: false,
          items: $scope.Categories.length + 1,
        });            
    }

    $scope.GetCategories = function (searchText) {
      var searchTextParameter = $scope.boilerplate.RuntimeParameters.find(x=> x.Key == 'SearchText');

      if(!searchTextParameter) {
        $scope.boilerplate.RuntimeParameters.push({Key : 'SearchText', Value : searchText})
      }
      else {
        searchTextParameter.Value = searchText;
      }

      $scope.ShowLoaders = true;
      var url = dataService + "/GetCategoriesByBoilerplate";

      $http({
        url: url,
        method: "POST",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(Context),
        },
        data: $scope.boilerplate,
      }).then(function (result) {
        result = result.data;
        if (result != undefined && result != null) {
          $scope.Categories = result;
          $scope.ShowLoaders = false;
        }
        $timeout(function() { loadCarousel() });
      });
    };
    $scope.ErrorImage = function () {
      return rootUrl.ErrorHomePageImageUrl;
    };

    $scope.SkipValidation = function (value) {
      if (value) {
        return $sce.trustAsHtml(jQuery.parseHTML(value)[0].textContent);
      }
    };
     
    $scope.ErrorImage = function () {
      return rootUrl.ErrorHomePageImageUrl;
    };    
  },
]);
