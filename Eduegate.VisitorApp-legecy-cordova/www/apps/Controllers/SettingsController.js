app.controller('SettingsController', ['$scope', '$http', 'rootUrl', '$location', 'GetContext', 'serviceCartCount', '$state', '$stateParams', '$rootScope', 'serviceAddToCart', 'loggedIn', '$sce', '$timeout', function ($scope, $http, rootUrl, $location, GetContext, serviceCartCount, $state, $stateParams, $rootScope, serviceAddToCart, loggedIn, $sce, $timeout) {
    var dataService = rootUrl.RootUrl;
    var context = GetContext.Context();
    $scope.init = function () {
    }

}]);