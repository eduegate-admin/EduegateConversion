app.controller('BiometricAuthenticationController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', '$state', '$stateParams', '$sce', '$rootScope', function ($scope, $http, loggedIn, rootUrl, $location, GetContext, $state, $stateParams, $sce, $rootScope) {
    var context = GetContext.Context();
    var appDataUrl = rootUrl.RootUrl;
    var dataService = rootUrl.SchoolServiceUrl;

    $scope.init = function () {

    }
    $scope.showBiometric = function(){
      var isBiometricEnabled = localStorage.getItem("biometricEnabled") === "true";
      biometricSwitch.checked = isBiometricEnabled;

      biometricSwitch.addEventListener("change", function () {
        localStorage.setItem("biometricEnabled", biometricSwitch.checked);
      });

      if (isBiometricEnabled) {
        $scope.showBiometricAuthentication();
      }
    }

    $scope.showBiometricAuthentication = function(){
      Fingerprint.isAvailable(isAvailableSuccess, isAvailableError);

      function isAvailableSuccess(result) {
        var authType = (result === 'face' || result === 'biometric') ? 'Face ID' : 'Fingerprint';

        Fingerprint.show({
          description: "Please authenticate to access the app",
          disableBackup: true // Optional, disable backup authentication methods (like password)
        }, successCallback, errorCallback);

        function successCallback() {
          // alert(authType + " Authentication successful");
          // Proceed with normal app initialization here
          $state.go("home");

        }

        function errorCallback(error) {
          // alert(authType + " Authentication failed: " + error.message);
          // Optionally, you can close the app or restrict access here
          // navigator.app.exitApp(); // This will close the app
          $state.go("biometricauthentication");

        }
      }

      function isAvailableError(error) {
        // alert("Biometric authentication not available: " + error.message);
        // Optionally, you can close the app or restrict access here
        // navigator.app.exitApp(); // This will close the app
      }
    }


    $scope.init();

}]);