app.controller('HomeSingleBannerController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', '$state', '$stateParams', '$sce', '$rootScope', function ($scope, $http, loggedIn, rootUrl, $location, GetContext, $state, $stateParams, $sce, $rootScope) {
    console.log('banner loaded')
  var dataService = rootUrl.RootUrl;
  var Context = GetContext.Context();
  $scope.preventLoadBlocks = $scope.$parent.preventLoadBlocks === true;
  $scope.homeSingleBanner = null;
  //alert($scope.preventLoadBlocks);
  $scope.hasBanner = false;
  $scope.boilerPlateDTO = [];
  $scope.init = function () {
      $scope.GetHomeBanners();
  }

  $scope.GetHomeBanners = function () {
      var url = dataService + "/GetSingleHomeBanner";

      $http({
          url: url,
          method: 'POST',
          headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
          data: $scope.boilerPlateDTO
      }).then(function (result) {
          result = result.data;
          $scope.homeSingleBanner = result;
          $scope.hasBanner = true;
          $scope.ShowLoaders = false;
      }, function (err) {
          $scope.ShowLoaders = false;
      });
  }


  $scope.$parent.$watch('details', function (value) {
    if(!value) return;

      if ($scope.ShowLoaders == false) {
          $scope.ShowLoaders = true;
          $scope.boilerPlateDTO = null;
          $scope.init();
      }
      //$scope.init();
  });

  $scope.init();

}]);