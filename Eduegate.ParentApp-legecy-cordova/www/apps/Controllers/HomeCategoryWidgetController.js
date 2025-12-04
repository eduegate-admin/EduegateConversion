app.controller('HomeCategoryWidgetController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', 'serviceCartCount', '$state', '$stateParams', '$sce', '$rootScope', function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount, $state, $stateParams, $sce, $rootScope) {
  var dataService = rootUrl.RootUrl;
  var Context = GetContext.Context();
  $scope.preventLoadBlocks = $scope.$parent.preventLoadBlocks === true;
  $scope.ProductIDs = "";
  $scope.ShowLoaders = false;
  $scope.isLoaded = false;
  $scope.boilerPlateDTO = [];
  $scope.CategoryName = "";
  $scope.CategoryTag = "";
  $scope.CategoryCode = "";
  $scope.CategoryProducts = [];
  $scope.init = function () {
      $scope.GetCategoryProductsBySkuTags();
  }

  $scope.GetCategoryProductsBySkuTags = function () {

      $scope.ShowLoaders = true;
      var url = dataService + "/GetProducts";

      $http({
          url: url,
          method: 'POST',
          headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
          data: $scope.boilerPlateDTO,
      }).then(function (result) {
          result = result.data;
          if (result != undefined && result != null) {
              //if (result.Catalogs != undefined && result.Catalogs != null) {
              $scope.CategoryProducts = result;
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

          $scope.CategoryTag = JSLINQ($scope.boilerPlateDTO.RuntimeParameters).Where(function (parameter) {
              if (parameter.Key == "MobileHomeTagList") {
                  return parameter.Value;
              }
          });

          if ($scope.CategoryTag.items.legth > 0)
              $scope.CategoryTag = $scope.CategoryTag.items[0].Value;

          $scope.CategoryName = JSLINQ($scope.boilerPlateDTO.RuntimeParameters).Where(function (parameter) {
              if (parameter.Key == "CategoryName") {
                  return parameter.Value;
              }
          });

          if ($scope.CategoryTag.items.legth > 0)
              $scope.CategoryName = $scope.CategoryName.items[0].Value;

          $scope.CategoryCode = JSLINQ($scope.boilerPlateDTO.RuntimeParameters).Where(function (parameter) {
              if (parameter.Key == "CategoryCode") {
                  return parameter.Value;
              }
          });

          if ($scope.CategoryTag.items.legth > 0)
              $scope.CategoryCode = $scope.CategoryCode.items[0].Value;
          //$scope.categoryID = value.categoryID;
          //$scope.categoryCode = value.categoryCode;

          $scope.init();
      }
  });
}]);