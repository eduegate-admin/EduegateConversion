app.controller('HomeController', [
  '$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', 'loggedIn', 'clientSettings',
  function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, loggedIn, clientSettings) {
    console.log('Home controller loaded.');

    var dataService = rootUrl.RootUrl;
    var context = GetContext.Context();
    $scope.DashbaordType = 1;
    $scope.UserName = context.EmailID;

    $scope.IsLoggedIn = false;

    $scope.to_trusted = function (html_code) {
        return $sce.trustAsHtml(html_code);
    };

function goToLogin() {
  console.log("Attempting to redirect to:", clientSettings.DefaultLoginState);
  $state.go(clientSettings.DefaultLoginState, { reload: true });
}

    $scope.Init = function () {
      $rootScope.ShowLoader = false;
      $rootScope.ShowPreLoader = false;

      if (context.LoginID) {
        var loggedInPromise = loggedIn.CheckLogin(context, dataService);
        loggedInPromise.then(function (model) {
          if (model.data && model.data.LoginID) {
            $scope.IsLoggedIn = true;
          } else {
            goToLogin();
          }
        }, function () {
          goToLogin(); // error case
        });
      } else {
        goToLogin();
      }
    };
  }
]);
