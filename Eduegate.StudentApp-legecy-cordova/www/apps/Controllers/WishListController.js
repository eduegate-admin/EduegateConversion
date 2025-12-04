app.controller('WishListController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', 'serviceCartCount', '$state', '$stateParams', '$sce', '$rootScope','serviceAddToCart', function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount, $state, $stateParams, $sce, $rootScope, serviceAddToCart) {
  var dataService = rootUrl.RootUrl;
  var Context = GetContext.Context();
  $scope.WishListProducts = [];
  $scope.init = function () {
    $scope.GetShoppingCartCount();
    $scope.IsLoaded = false;
    $rootScope.ShowLoader = true;
    $http({
      method: 'GET',
      url: rootUrl.RootUrl + '/GetSaveForLater',
      headers: {
          "Accept": "application/json;charset=UTF-8", 
          "Content-type": "application/json; charset=utf-8",
          "CallContext": JSON.stringify(Context)
      }
    }).then(function (result) {    
      result = result.data;
      $scope.WishListProducts = result;
      $scope.IsLoaded = true;
      $rootScope.ShowLoader = false;
    }, function (err) {
      $rootScope.ShowLoader = false;     
    });
  }

  $scope.SkipValidation = function (value) {
    if (value) {
        return $sce.trustAsHtml(jQuery.parseHTML(value)[0].textContent)
    }
};

$scope.RemoveWishList = function (skuID) {
  $rootScope.ShowLoader = true;
  $http({
    method: 'GET',
    url: rootUrl.RootUrl + '/RemoveSaveForLater?skuID=' + skuID,
    headers: {
        "Accept": "application/json;charset=UTF-8", 
        "Content-type": "application/json; charset=utf-8",
        "CallContext": JSON.stringify(Context)
    }
  }).then(function (result) {    
    result = result.data;
    $scope.WishListProducts.splice($scope.WishListProducts.findIndex(x=> x.SKUID == skuID), 1);
    $rootScope.SuccessMessage = result.Message;
    $rootScope.ShowLoader = false; 
  }, function (err) {
    $rootScope.ShowLoader = false;     
  });
}

$scope.GetProductImage = function (imagePath) {
  return rootUrl.ImageUrl + imagePath;
}

$scope.GetShoppingCartCount = function () {
  var cartPromise = serviceCartCount.getProductCount(Context, dataService);
  cartPromise.then(function (result) {
      $scope.ShoppingCartCount = result;
  }, function() {
          
  });
}

$scope.AddtoCart = function (SKUID) {  
  $rootScope.ErrorMessage = '';
  $rootScope.SuccessMessage = '';
  $rootScope.ShowLoader = true;
  var AddtoCartPromise = serviceAddToCart.addToCart(SKUID, 
    1, rootUrl.RootUrl, Context, $rootScope);
  AddtoCartPromise.then(function (result) {
      if (result.operationResult == 1) {
        $rootScope.SuccessMessage = result.Message;
          $rootScope.ShowLoader = false;

                $(".prod-added").removeClass('showMsg');
                $(".prod-added").addClass('showMsg').delay(2000).queue(function(){
                    $(this).removeClass('showMsg'); 
                    $(this).dequeue();
                });
              $scope.GetShoppingCartCount();
      }
      else {
          $rootScope.ShowLoader = false;
          $rootScope.ErrorMessage = result.data.Message;
          $(".error-msg").removeClass('showMsg');
            $(".error-msg").addClass('showMsg').delay(2000).queue(function(){
                $(this).removeClass('showMsg'); 
                $(this).dequeue();
            });

      }
  });
}


  $scope.init();
}]);