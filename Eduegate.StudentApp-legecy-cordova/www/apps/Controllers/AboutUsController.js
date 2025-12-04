app.controller('AboutUsController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', 'serviceCartCount', '$state', '$stateParams', '$sce', '$rootScope', function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount, $state, $stateParams, $sce, $rootScope) {
    var dataService = rootUrl.RootUrl;
    var Context = GetContext.Context();
    $scope.init = function () {
    }

    $scope.LoadPage = function(id, element) {
        $rootScope.GetStaticPage(id).then(function(content) {
          $(element).html(content.Description);
        });
      }


    $scope.init();
}]);