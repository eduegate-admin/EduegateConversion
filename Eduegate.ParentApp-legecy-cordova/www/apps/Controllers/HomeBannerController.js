app.controller('HomeBannerController', ['$scope', '$http', 'loggedIn', 'rootUrl', 
    '$location', 'GetContext', '$state', '$stateParams', '$sce', '$rootScope', '$q','FlickityService', '$timeout',
    function ($scope, $http, loggedIn, rootUrl, $location, GetContext, $state, $stateParams, $sce, $rootScope,
        $q, FlickityService , $timeout) {
  var dataService = rootUrl.RootUrl;
  var Context = GetContext.Context();
  $scope.preventLoadBlocks = $scope.$parent.preventLoadBlocks === true;
  $scope.ShowLoaders = false;
  //alert($scope.preventLoadBlocks);
  $scope.hasBanner = false;
  $scope.init = function () {
      //if (!$scope.preventLoadBlocks) {
          $scope.GetHomeBanners();
      //}
      ///else { $scope.hasBanner = true; }
  }

  $scope.GetHomeBanners = function () {
      //alert("in banner");
      $scope.ShowLoaders = true;
      var url = dataService + "/GetHomeBanners";

      $http({
          url: url,
          method: 'GET',
          headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
      }).then(function (result) {
          result = result.data;
          const element = angular.element(document.getElementById('demo-slider1'));
          $timeout(() => {
              // Initialize our Flickity instance
              FlickityService.create(element[0], element[0].id);
          });
          $rootScope.HomeBanners = result;
          $scope.hasBanner = true;
          //alert("loaded");
          //alert("banner end");
          $scope.ShowLoaders = false;
      });
  }  

}]);