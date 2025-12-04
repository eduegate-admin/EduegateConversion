app.controller('PromotionController', ['$scope', '$http', 'rootUrl', '$sce', 'serviceCartCount', 'GetContext', 'loggedIn', '$stateParams', '$rootScope', function ($scope, $http, rootUrl, $sce, serviceCartCount, GetContext, loggedIn, $stateParams, $rootScope) {
  console.log('Promotion Controller loaded.');
  var dataService = rootUrl.RootUrl;
  $scope.SaveForLaterCount = 0;
  $scope.ShoppingCartCount = 0;
  var Context = GetContext.Context();
  $scope.sliderLoop = false;
  $scope.ListBoilerPlates = { BoilerPlates: [], Controller: [] };
  $scope.PromotionList = [];

  $scope.init = function () {
      $rootScope.ShowLoader = true;
      $scope.GetShoppingCartCount();
      $scope.GetSaveForCartCount();
      $rootScope.ShowLoader = false;

      // $rootScope.GetPromotionsByType(2).then(function(result) {
      //   $scope.PromotionList = result;
      //   $rootScope.ShowLoader = false;
      //   $timeout(function() {
      //     $scope.setSlider();
      //   },0);
      //   $timeout(function() {
      //     $scope.fancyBoxZoom();
      //   },0);
      // });
  };

  $scope.GetShoppingCartCount = function () {
      var cartPromise = serviceCartCount.getProductCount(Context, dataService);
      cartPromise.then(function (result) {
          $scope.ShoppingCartCount = result;
      }, function() {

    });

  };

  $scope.GetSaveForCartCount = function () {
      var loggedInPromise = loggedIn.CheckLogin(Context, dataService);
      loggedInPromise.then(function (model) {

          if (model.data) {
              if (model.data.LoginID) {
                  $scope.LoggedIn = true;
                  var SaveForLaterCountPromise = serviceCartCount.getSaveForLaterCount(Context, dataService);
                  SaveForLaterCountPromise.then(function (result) {
                      $scope.SaveForLaterCount = result.data;
                  });
              }
          }
      }, function() {});
  };

  $scope.setSlider = function() {
    $('.promoBanner').bbslider({
        auto: false,
        timer: 2000,
        controls: true,
        loop: true,
        pauseOnHit: true,
        transition: 'slide',
        duration: 1000,
        touch: false,
        pager: false,
        touchoffset:20,
        controlsText:[
          '<a class="prev control fa fa-angle-left" href="#"></a>',
          '<a class="next control fa fa-angle-right"  href="#"></a>'
        ]
    });
    $scope.sliderLoop = $('.promoBanner').data('settings').loop;
  };

  $scope.fancyBoxZoom = function() {
    // $('.fancybox-button').fancybox({
    //   loop: false,
    //   nextClick  : false,
    //   arrows     : false,
    //   prevEffect: 'none',
    //   nextEffect: 'none',
    //   wrapCSS    : 'touchPane',
    //   helpers: {
    //       title: { type: 'over' }
    //   }, // helpers
    //   allowPageScroll: 'vertical',
    //   afterShow:function() {
    //     var el = document.querySelector('.fancybox-image');
    //     new PinchZoom.default(el, {});
    //   }
    // });
      // var el = document.querySelector('.fancybox-image');
      // new PinchZoom.default(el, {});
      $('.fancybox-image').zoomImage();
  };

  $scope.OptionClick = function () {
      $('.rightnav-cont').toggle();
  };

  $rootScope.$on('$locationChangeSuccess', function() {
    if($scope.sliderLoop)  {
        $('.promoBanner').bbslider('destroy');
        $scope.sliderLoop = false;
    }
 });

  $scope.init();
}]);