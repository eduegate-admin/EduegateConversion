var app = angular.module('EduegateApp', ['ui.router', 'ngSanitize', 'angular.filter', 'ngTouch', 'pascalprecht.translate', 'feature-flags' ,  'bc.Flickity']);
app.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
  console.log('App.js loaded.');

  $urlRouterProvider.otherwise("/home");

  $stateProvider
    .state('home', {
      url: "/home:QID?PassportNumber",
      templateUrl: 'partials/home.html',
      controller: 'HomeController',
      params: {
        QID: null,
        PassportNumber: null
      }
    })

    .state('usersettings', {
      cache: false,
      url: "/usersettings:random",
      templateUrl: "partials/user-settings.html",
      //controller: 'UserSettingController'
    })
    .state('login', {
      url: "/login:redirectUrl?IsDigitalCart",
      templateUrl: "partials/login.html",
      controller: 'LoginController'
    })
      .state('multitenant', {
      url: "/login:redirectUrl?IsDigitalCart",
      templateUrl: "partials/login.html",
      controller: 'LoginController'
    })
    .state('identitylogin', {
      url: "/identitylogin",
      templateUrl: "partials/identitylogin.html",
      controller: 'IdentityLoginController'
    })
    .state('register', {
      url: "/register:QID?PassportNumber",
      templateUrl: "partials/register.html",
      controller: 'RegisterController',
      params: {
        QID: null,
        PassportNumber: null
      }
    })
    .state('changepassword', {
      url: "/changepassword",
      templateUrl: "partials/changepassword.html",
      controller: 'ChangePasswordController'
    })
    .state('contactus', {
      url: "/contactus",
      templateUrl: "partials/contact-us.html",
      controller: 'ContactUsController'
    })
    .state('aboutus', {
      url: "/aboutus",
      templateUrl: "partials/about-us.html",
      controller: 'AboutUsController'
    })
    .state('userregistration', {
      url: "/userregistration?id?isAnonymous",
      templateUrl: "partials/userregistration.html",
      controller: 'UserRegistrationController'
    })
    .state('resetpassword', {
      url: "/resetpassword",
      templateUrl: "partials/resetpassword.html",
      controller: 'ResetPasswordController'
    })
    .state('setting', {
      url: "/settings",
      templateUrl: "partials/settings.html",
      controller: 'SettingsController'
    })
    .state('terms', {
      url: "/terms",
      templateUrl: "partials/terms.html",
      controller: 'TermsController'
  })

  .state('selfscan', {
    url: "/selfscan",
    templateUrl: "partials/SelfScan.html",
    controller: 'StudentDailyPickupRequestListController',
})
.state('profile', {
  url: "/profile",
  templateUrl: "partials/profile.html",
  controller: 'ProfileController'
})

.state('inspection', {
  url: "/inspection",
  templateUrl: "partials/inspection.html",
  controller: 'InspectionController'
})
.state('biometricauthentication', {
  url: "/biometricauthentication",
  templateUrl: "partials/biometricauthentication.html",
  controller: 'BiometricAuthenticationController',
})


});

app.config(function ($translateProvider) {
  $translateProvider.preferredLanguage('en');
  $translateProvider.useStaticFilesLoader({
    prefix: 'scripts/jquery-localize/',
    suffix: '.json'
  });
});

app.run(function (featureFlags, $http, clientSettings) {
  var clientFlag = './data/feature-flags/flags-' + clientSettings.Client + '.json';
  featureFlags.set($http.get(clientFlag));
});

app.factory("clientSettings", function ($http) {
  // var client = "pearl";
  var client = "qaa";
  // var client = "eduegate";
  return clientSetting[client];
});

app.factory('rootUrl', function ($http, clientSettings) {
    // var environment = "live";
    // var environment = "staging";
    // var environment = "test";
    // var environment = "linux";
    var environment = "local";

  var urls = appSettings[clientSettings.Client + '-' + environment];
  return {
    RootUrl: urls.RootUrl,
    SchoolServiceUrl: urls.SchoolServiceUrl,
    SecurityServiceUrl: urls.SecurityServiceUrl,
    UserServiceUrl: urls.UserServiceUrl,
    ContentServiceUrl :urls.ContentServiceUrl,
    IdentityServerUrl: urls.IdentityServerUrl,

    ErpUrl: urls.ErpUrl,
    ParentUrl: urls.ParentUrl,


    ImageUrl: "",
    ErrorProductImageUrl: 'clients/' + clientSettings.Client + '/img/no-image.svg',
    ErrorHomePageImageUrl: 'clients/' + clientSettings.Client + '/img/no-image.svg',
    BigErrorImageUrl: 'clients/' + clientSettings.Client + '/img/no-image.svg',
    client: clientSettings.Client
  };
});


app.factory('mySharedService', function ($rootScope) {
  var sharedService = {};

  //sharedService.message = '';

  sharedService.prepForBroadcast = function (reload) {
    //this.message = msg;
    this.broadcastItem(reload);
  };

  sharedService.broadcastItem = function (reload) {
    $rootScope.$broadcast('handleBroadcast', {
      reload: reload
    });
  };

  return sharedService;
});


app.filter('html', ['$sce', function ($sce) {
  return function (text) {
    return $sce.trustAsHtml(text);
  };
}]);

app.filter('htmldecode', function () {
  return function (encodedHtml) {
    return angular.element('<div>').html(encodedHtml).text();
  };
});

app.directive('simpleHtml', function () {
  return function (scope, element, attr) {
    scope.$watch(attr.simpleHtml, function (value) {
      element.html(scope.$eval(attr.simpleHtml));
    });
  };
});

app.directive('onErrorSrc', function () {
  return {
    link: function (scope, element, attrs) {
      element.bind('error', function () {
        if (attrs.src != attrs.onErrorSrc) {
          attrs.$set('src', attrs.onErrorSrc);
        }
      });
    }
  }
});

app.filter('ctime', function () {

  return function (jsonDate) {
    if (!jsonDate) return null;
    var date = new Date(parseInt(jsonDate.substr(6)));
    return date;
  };

});

var appState = {
  takingPicture: true,
  // uploadingPicture:true,
  imageUri: ""
};

var APP_STORAGE_KEY = "exampleAppState";


app.run(function ($state, $rootScope) {
  //FastClick.attach(document.body);
  document.addEventListener("deviceready", onDeviceReady, false);
  // document.addEventListener('pause', onPause, false);
  // document.addEventListener('resume', onResume, false);

  function onDeviceReady() {

    // Load the saved setting from local storage
    var isBiometricEnabled = localStorage.getItem("biometricEnabled") === "true";
    biometricSwitch.checked = isBiometricEnabled;

    biometricSwitch.addEventListener("change", function () {
      localStorage.setItem("biometricEnabled", biometricSwitch.checked);
    });

    FastClick.attach(document.body);
    window.open = cordova.InAppBrowser ? cordova.InAppBrowser.open : null;
    // var iOS5 = device.platform;

    var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (iOS) {
      //alert("ios");
      $("body").addClass("platform-ios");
      $("html").attr("platform", "platform-ios");
    }

    initializeFireBase();
    document.addEventListener("backbutton", onBackKeyDown, false);

    if (isBiometricEnabled) {
      showBiometricAuthentication();
    }
  }
  function showBiometricAuthentication() {
    Fingerprint.isAvailable(isAvailableSuccess, isAvailableError);

    function isAvailableSuccess(result) {
      $state.go("biometricauthentication");
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


  function onBackKeyDown() {
    if ($state.is('home') || $state.is('biometricauthentication')) {
      // e.preventDefault();
      navigator.notification.confirm("Are you sure you want to exit?", onConfirm, "Please Confirm", "Yes,No");
    }
    else{
      navigator.app.backHistory();
    }
  }
  function initializeFireBase() {
    var firebasePlugin = window.FirebasePlugin
      ? window.FirebasePlugin
      : window.FCMPlugin
        ? window.FCMPlugin
        : null;
    if (!firebasePlugin) return;
    if (firebasePlugin.grantPermission) {
      firebasePlugin.grantPermission(); // Set Permission for IOS
    }

    if (firebasePlugin.hasPermission) {
      firebasePlugin.hasPermission(function (data) {
        //Check Permission
        console.log("isEnabled  ", data.isEnabled);
      });
    }

    if (firebasePlugin.getToken) {
      getFirebaseToken(firebasePlugin);
    }

    // Get notified when a token is refreshed
    if (firebasePlugin.onTokenRefresh) {
      firebasePlugin.onTokenRefresh(
        function (token) {
          // save this server-side and use it to push notifications to this device
          if (token) {
            window.localStorage.setItem(
              "firebasedevicetoken",
              JSON.stringify(token)
            );
          } else {
            setTimeout(getFirebaseToken(firebasePlugin), 1000);
          }
        },
        function (error) { }
      );
    }

    // Get notified when the user opens a notification
    if (firebasePlugin.onMessageReceived) {
      firebasePlugin.onMessageReceived(
        function (message) {
          console.log("Message type: " + message.messageType);
          if (message.messageType === "notification") {
            if (message.tap) {
              if (!$rootScope.IsGuestUser) {
                angular
                  .element(document.getElementById("rootBody"))
                  .scope()
                  .$root.redirectPage("notification");
              } else {
                $state.go("customer-new");
              }
            }

            if (message.body.includes("replacement request")) {
              var orderId = message.body.match(/\#(.*)\#/).pop();
              //show confirmation
              angular
                .element(document.getElementById("rootBody"))
                .scope()
                .$root.showModalWindow(
                  "notification",
                  "Replacement Request",
                  "You have a replacement request, do you want to proceed?",
                  "Cancel",
                  "Proceed",
                  null,
                  proceedCallback
                );
              var notifySound = "./assets/sound/notification.mp3";
              var audio = new Audio(notifySound);
              audio.play();
            }

            function proceedCallback() {
              var orderPage = document.getElementById("orderDetails" + orderId);

              if (orderPage) {
                angular.element(orderPage).scope().init();
              } else {
                angular
                  .element(document.getElementById("rootBody"))
                  .scope()
                  .$root.redirectPage("orderdetails", {
                    orderID: orderId,
                  });
              }
            }
          }
        },
        function (error) { }
      );
    }
  }

  function getFirebaseToken(firebasePlugin) {
    firebasePlugin.getToken(
      function (token) {
        // save this server-side and use it to push notifications to this device
        //alert(token);
        if (token) {
          window.localStorage.setItem(
            "firebasedevicetoken",
            JSON.stringify(token)
          );
        } else {
          setTimeout(getFirebaseToken(firebasePlugin), 1000);
        }
      },
      function (error) {
        //alert(error);
        console.error(error);
      }
    );
  }

});


