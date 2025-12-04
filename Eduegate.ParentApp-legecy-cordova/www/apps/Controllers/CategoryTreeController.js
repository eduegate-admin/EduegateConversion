app.controller('CategoryTreeController', ['$scope', '$http', 
    'rootUrl', '$sce', 
    'serviceCartCount', 'GetContext', 
    'loggedIn', '$rootScope', 
    function ($scope, $http, rootUrl, $sce, serviceCartCount, GetContext, loggedIn, $rootScope) {
  var dataService = rootUrl.RootUrl;
  $scope.SaveForLaterCount = 0;
  $scope.ShoppingCartCount = 0;
  var Context = GetContext.Context();
  $scope.AllCategories = [];
  $scope.SaveForLaterCount = 0;
  $scope.ShoppingCartCount = 0;
  var Context = GetContext.Context();
  $scope.init = function () {
      $scope.GetShoppingCartCount();
      $scope.GetSaveForCartCount();
  }
  $scope.GetShoppingCartCount = function () {
    var cartPromise = serviceCartCount.getProductCount(Context, dataService);
    cartPromise.then(function (result) {
        $scope.ShoppingCartCount = result.data;
    });

}
  $scope.GetAllCategories = function () {
      $scope.AllCategories = [];

      $http({
          url: dataService + "/GetAllCategories",
          method: 'GET',
          headers: { 
              "Accept": "application/json;charset=UTF-8", 
              "Content-type": "application/json; charset=utf-8", 
              "CallContext": JSON.stringify(Context) 
            },
      }).then(function (result) {
          result = result.data;
          $scope.AllCategories = result;
          $rootScope.ShowLoader = false;
      });
  }

  $scope.init = function () {
      $rootScope.ShowLoader = true;
      $scope.GetShoppingCartCount();
      $scope.GetSaveForCartCount();
      $scope.GetAllCategories();
  };

  $scope.GetShoppingCartCount = function () {
      var cartPromise = serviceCartCount.getProductCount(Context, dataService);
      cartPromise.then(function (result) {
          $scope.ShoppingCartCount = result;
      }, function() {
          
    });
  }

  $scope.FilterOptionClick = function (event) {
    var obj = event.target;
    if ($(obj).prop("tagName").toLowerCase() == "label") {
        obj = $(obj).parent();
    }
    event.preventDefault();
    var catattr = $(obj).attr('data-attr');

    //$(".togglecontent").slideUp();
    $(obj).closest("li").toggleClass("active");
    if ($(obj).closest("li").hasClass("active")) {
        $(".toggletab ul li").removeClass('active');
        $(".togglecontent").slideUp('fast');
        $(obj).closest("li").addClass("active");
        $(".togglecontent." + catattr).slideDown('fast');
    }
    else {
        $(obj).closest("li").removeClass("active");
        $(".togglecontent." + catattr).slideUp('fast');
    }
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
      }, function() {});
  }

  $scope.ErrorImage = function () {
      return rootUrl.ErrorHomePageImageUrl;
  }

  $scope.SkipValidation = function (value) {
      if (value) {
          return $sce.trustAsHtml(jQuery.parseHTML(value)[0].textContent)
      }
  };

  $scope.OptionClick = function () {
      $('.rightnav-cont').toggle();
  }

  $scope.init();
}]);