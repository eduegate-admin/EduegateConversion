app.controller('ClassTeacherController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce) {
    console.log('ClassTeacherController loaded.');
    var dataService = rootUrl.RootUrl;
    var context = GetContext.Context();
    $scope.Init();
}]);