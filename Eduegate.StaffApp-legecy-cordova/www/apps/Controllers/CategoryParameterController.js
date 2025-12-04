app.controller('CategoryParameterController', ['$scope', '$http', 'loggedIn', 'rootUrl',
    '$location', 'GetContext', '$state', '$stateParams', '$sce', '$rootScope', '$q', 'serviceCartCount',
    function ($scope, $http, loggedIn, rootUrl, $location, GetContext, $state, $stateParams, $sce, $rootScope,
        $q, serviceCartCount) {
  $scope.noOfCategories = 0;
  $rootScope.ShowLoader = true;
  $scope.finishLoading = function (boilerplate, categoryID, categoryCode) {
      //alert("loaded");
      if (boilerplate.RuntimeParameters != undefined && boilerplate.RuntimeParameters != null) {
          for (var i = 0; i <= $scope.boilerplate.RuntimeParameters.length - 1; i++) {
              if ($scope.boilerplate.RuntimeParameters[i].Key == "NoOfCategories") {
                  $window.isDept = true;
                  $scope.noOfCategories = $scope.boilerplate.RuntimeParameters[i].Value;
                  $window.noOfCategories = $scope.noOfCategories;
                  break;
              }
          }
      }
      $scope.details = { boilerplate: boilerplate, categoryID: categoryID, categoryCode: categoryCode };
      //$scope.boilerplate = boilerplate;
      //$scope.controller = controller;
      //$scope.categoryID = categoryID;
      //$scope.categoryCode = categoryCode;
  }

}]);