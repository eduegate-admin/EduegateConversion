var app = angular.module('EduegateApp', ['ui.router', 'ngSanitize', 'angular.filter', 'ngTouch', 'pascalprecht.translate', 'feature-flags' ,  'bc.Flickity']);
app.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
  console.log('App.js loaded.');

  $urlRouterProvider.otherwise("/home");

  $stateProvider
    .state('home', {
      url: "/home",
      templateUrl: 'partials/home.html',
      controller: 'HomeController'
    })
    .state('mywards', {
      url: "/mywards",
      templateUrl: 'partials/mywards.html',
      controller: 'MyWardsController'
    })
    .state('onlinestore', {
      url: "/onlinestore:?showAllergies",
      templateUrl: 'partials/onlinestore.html',
      controller: 'OnlineStoreHomeController',
      params: {
        showAllergies:null
      }
    })
    .state('mycirculars', {
      url: "/mycirculars",
      templateUrl: 'partials/circular.html',
      controller: 'CircularController'
    })
    .state('studentapplication', {
      url: "/studentapplication",
      templateUrl: 'partials/studentapplication.html',
      controller: 'StudentApplicationController'
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
      url: "/register",
      templateUrl: "partials/register.html",
      controller: 'RegisterController'
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
    .state('driverlocation', {
      url: "/driverlocation:studentID",
      templateUrl: "partials/driverlocation.html",
      controller: 'DriverLocationController',
      params: {
        studentID: null,
      }
    })
    .state('userregistration', {
      url: "/userregistration?id?isAnonymous",
      templateUrl: "partials/userregistration.html",
      controller: 'UserRegistrationController'
    })
    .state('applicationstatus', {
      url: "/applicationstatus",
      templateUrl: "partials/applicationstatus.html",
      controller: 'ApplicationStatusController'
    })
    .state('transportapplicationstatus', {
      url: "/transportapplicationstatus",
      templateUrl: "partials/transportapplicationstatus.html",
      controller: 'TransportApplicationStatusController'
    })
    .state('resetpassword', {
      url: "/resetpassword",
      templateUrl: "partials/resetpassword.html",
      controller: 'ResetPasswordController'
    })
    .state('cart', {
      url: "/cart",
      templateUrl: "partials/cart.html",
      controller: 'CartController'
    })
    .state('onlinestoreregister', {
      url: "/onlinestoreregister",
      templateUrl: "partials/onlinestoreregister.html",
      controller: 'OnlineStoreRegisterController'
    })
    .state('allcategoriestree', {
      url: "/allcategoriestree",
      templateUrl: "partials/allcategorytree.html",
      controller: 'CategoryTreeController'
    })
    .state('orderhistory', {
      url: "/orderhistory",
      templateUrl: "partials/orderhistory.html",
      controller: 'OrderHistoryController'
    })
    .state('myorders', {
      url: '/myorders?status',
      templateUrl: 'partials/myorder.html',
      controller: 'MyOrderController',
      params: {
        status: null,
      }
    })
    .state('promotion', {
      url: "/promotion",
      templateUrl: "partials/promotions.html",
      controller: 'PromotionController'
    })
    .state('categorywidget', {
      url: "/categorywidget",
      templateUrl: "partials/main-category-widget.html",
      controller: 'MainCategoryWidgetController'
    })
    .state('productlists', {
      url: "/productlists:searchText?filterBy?filterValue?filterText?sortText?pageType?searchTitle?isCategory?caption",
      templateUrl: "partials/productlists.html",
      controller: 'ProductListController',
      params: {
        filterValue: null,
        filterText: null,
        sortText: null,
        pageType: null,
        searchTitle: null,
        caption: null
      }
    })
    .state('productcategory', {
      url: "/productcategory:searchText?filterBy?filterValue?filterText?sortText?pageType?searchTitle?isCategory?caption?category?showfilter",
      templateUrl: "partials/product-category.html",
      controller: 'ProductCategoryController',
      params: {
        searchText: null,
        filterBy: null,
        filterValue: null,
        sortText: null,
        pageType: null,
        searchTitle: null,
        caption: null,
        category: null,
        showfilter:null

      }
    })
    .state('checkout', {
      url: "/checkout:DeliveryAddress?ShowAddressView",
      templateUrl: "partials/checkout.html",
      controller: 'CheckoutController',
      params: {
        ShowAddressView: null,
        DeliveryAddress: null
      }
    })
    .state('singlecheckout', {
      url: '/singlecheckout',
      templateUrl: 'partials/cart-single-checkout.html',
      controller: 'CartSingleCheckoutController',
      params: {
        ShowAddressView: null,
        DeliveryAddress: null
      }
    })
    .state('allsavedaddress', {
      url: "/allsavedaddress:redirectURL",
      templateUrl: "partials/allsavedaddress.html",
      controller: 'AllSavedAddressController',
      params: {
        redirectURL: null,
      }
    })
    .state('locateyourstore', {
      url: "/locateyourstore:redirectURL",
      templateUrl: 'partials/locateyourstore.html',
      controller: 'LocateYourStoreController',
      params: {
        redirectURL: ''
      }
    })
    .state('addaddress', {
      url: "/addaddress:redirectURL?firstAddress?addressID",
      templateUrl: "partials/addaddress.html",
      controller: 'AddAddressController',
      params: {
        redirectURL: null,
        firstAddress: null,
        addressID: null
      }
    })
    .state('productdetails', {
      parent: 'productcategory',
      url: "/productdetails:skuID",
      views: {
        'bookDetails@productcategory': {
          templateUrl: "partials/product-details.html",
          controller: 'ProductDetailController',
          params: {
            skuID: null,
          }
         }
    },

    })
    .state('orderdetails', {
      url: "/orderdetails?orderID",
      templateUrl: 'partials/orderdetails.html',
      controller: 'OrderDetailOnlineController',
      params: {
        orderID: null,
      }
    })
    .state('feepaymenthistory', {
      url: "/fee/feepaymenthistory",
      templateUrl: "partials/feepaymenthistory.html",
      controller: 'FeePaymentHistoryController'
    })
    .state('feepayment', {
      url: "/fee/feepayment",
      templateUrl: "partials/feepayment.html",
      controller: 'FeePaymentController'
    })
    .state('thankyou', {
      url: "/thankyou:transactionNo?cartID?{orderHistory:json}",
      templateUrl: "partials/thankyou.html",
      controller: 'ThankYouController',
      params: {
        transactionNo: null,
        Amount: null,
        cartID: null,
        transactiondate: null,
        trackID : null,
        orderHistory: null,
      }
    })
    .state('feepaymenthistorydetails', {
      url: "/fee/feepaymenthistorydetails?ID?transactionNumber",
      templateUrl: "partials/feepaymenthistorydetails.html",
      controller: 'FeepaymentHistoryDetailsController'
    })
    .state('initiatefeepayment', {
      url: "/fee/initiatefeepayment?paymentModeID?transactionNumber",
      templateUrl: "partials/feepayment-initiate.html",
      controller: 'PaymentGatewayStatusController',
      params: {
        paymentModeID: null,
        transactionNumber: null,
      }
    })
    .state('validatefeepayment', {
      url: "/fee/validatefeepayment",
      templateUrl: "partials/feepayment-validation.html",
      controller: 'PaymentGatewayStatusController'
    })
    .state('successfeepayment', {
      url: "/fee/successfeepayment",
      templateUrl: "partials/feepayment-success.html",
      controller: 'PaymentGatewayStatusController'
    })
    .state('cancelfeepayment', {
      url: "/fee/cancelfeepayment",
      templateUrl: "partials/feepayment-cancellation.html",
      controller: 'PaymentGatewayStatusController'
    })
    .state('pendingfeepayment', {
      url: "/fee/pendingfeepayment",
      templateUrl: "partials/feepayment-pending.html",
      controller: 'PaymentGatewayStatusController'
    })
    .state('failedfeepayment', {
      url: "/fee/failedfeepayment",
      templateUrl: "partials/feepayment-failure.html",
      controller: 'PaymentGatewayStatusController'
    })
    .state('validateretryfeepayment', {
      url: "/fee/validateretryfeepayment?paymentModeID?transactionNumber",
      templateUrl: "partials/feepayment-retry-validation.html",
      controller: 'PaymentGatewayStatusController',
      params: {
        paymentModeID: null,
        transactionNumber: null,
      }
    })
    .state('studentleavestatus', {
      url: "/studentleavestatus?ID?studentID",
      templateUrl: "partials/studentleavestatus.html",
      controller: 'StudentLeaveStatusController'
    })
    .state('studentleave', {
      url: "/studentleave?ID?studentID",
      templateUrl: "partials/studentleaves.html",
      controller: 'StudentLeaveController'
    })
    .state('studentprofile', {
      url: "/studentprofile?ID?studentID",
      templateUrl: "partials/studentprofile.html",
      controller: 'StudentProfileController'
    })
    .state('profile', {
      url: "/profile",
      templateUrl: "partials/profile.html",
      controller: 'ProfileController'
    })
    .state('setting', {
      url: "/settings",
      templateUrl: "partials/settings.html",
      controller: 'SettingsController'
    })
    .state('wishlist', {
      url: "/wishlist",
      templateUrl: "partials/wishlist.html",
      controller: 'WishListController'
    })
    .state('studentattendance', {
      url: "/studentattendance:studentID",
      templateUrl: "partials/attendance.html",
      controller: 'AttendanceController',
      params: {
        studentID: null,
      }
    })
    .state('timetable', {
      url: "/timetable?ID?studentID",
      templateUrl: "partials/timetable.html",
      controller: 'TimeTableController'
    })
    .state('topic', {
      url: "/topic?ID?studentID",
      templateUrl: "partials/topic.html",
      controller: 'TopicController'
    })
    .state('assignment', {
      url: "/assignment?ID?studentID",
      templateUrl: "partials/assignments.html",
      controller: 'AssignmentController'
    })
    .state('lessonplan', {
      url: "/lessonplan?ID?studentID",
      templateUrl: "partials/lessonplan.html",
      controller: 'LessonPlanController'
    })
    .state('classteacher', {
      url: "/classteacher?ID?studentID",
      templateUrl: "partials/classteacher.html",
      controller: 'ClassTeacherController'
    })
    .state('studentfeedue', {
      url: "/studentfeedue?ID?studentID",
      templateUrl: "partials/studentfees.html",
      controller: 'StudentFeesController'
    })
    .state('studentfines', {
      url: "/studentfines?ID?studentID",
      templateUrl: "partials/studentfine.html",
      controller: 'StudentFinesController'
    })
    .state('studentmarklist', {
      url: "/studentmarklist?ID?studentID",
      templateUrl: "partials/marklist.html",
      controller: 'MarkListController'
    })
    .state('questions', {
      url: "/questions:candidateID?examID?candidateOnlinExamMapID",
      templateUrl: "partials/questions.html",
      controller: 'ExamQuestionController',
      params: {
        CandidateID: null,
        ExamID: null,
        CandidateOnlinExamMapID: null,
      }
    })
    .state('onlinepayment', {
      url: '/onlinepayment',
      templateUrl: "partials/onlinepayment.html",
      controller: 'OnlinePaymentController',
    })
    .state('validateonlinepayment', {
      url: "/validateonlinepayment",
      templateUrl: "partials/validateonlinepayment.html",
      controller: 'OnlinePaymentController'
    })
    .state('gallery', {
      url: "/gallery",
      templateUrl: "partials/gallery.html",
      controller: 'GalleryController'
    })
    .state('events', {
      url: "/events",
      templateUrl: "partials/events.html",
      controller: 'EventsController'
    })
    .state('paymentfailure', {
      url: "/paymentfailure:PaymentID?TrackID?TrackKey?ErrorMessage",
      templateUrl: "partials/paymentfailure.html",
      controller: 'PaymentFailureController',
      params: {
          PaymentID: null,
          TrackID: null,
          TrackKey: null,
          ErrorMessage: null,
      }
    })
    // .state('paymentfailure', {
    //   url: "/paymentfailure",
    //   templateUrl: "partials/paymentfailure.html",
    //   controller: 'OnlinePaymentController',
    // })
    .state('paymentcancellation', {
      url: "/paymentcancellation",
      templateUrl: "partials/paymentcancellation.html",
      controller: 'OnlinePaymentController',
    })
    .state('studentpickuprequestlist', {
      url: "/studentpickuprequestlist",
      templateUrl: "partials/studentpickuprequestlist.html",
      controller: 'StudentPickupRequestListController'
    })
    .state('studentpickuprequest', {
      url: "/studentpickuprequest",
      templateUrl: "partials/studentpickuprequest.html",
      controller: 'StudentPickupRequestController'
    })
    .state('studentdailypickuprequestlist', {
      url: "/studentdailypickuprequestlist",
      templateUrl: "partials/studentdailypickuprequestlist.html",
      controller: 'StudentDailyPickupRequestListController'
    })
    .state('studentdailypickuprequest', {
      url: "/studentdailypickuprequest",
      templateUrl: "partials/studentdailypickuprequest.html",
      controller: 'StudentDailyPickupRequestController'
    })
    .state('defaultstudent', {
      url: "/defaultstudent:redirectURL",
      templateUrl: "partials/defaultstudent.html",
      controller: 'DefaultstudentController',
      params: {
        redirectURL: null,
      }
    })
    .state('allergies', {
      url: "/allergies:redirectURL",
      templateUrl: "partials/allergies.html",
      controller: 'AllergiesController',
      params: {
        redirectURL: null,
      }
    })
    .state('terms', {
      url: "/terms",
      templateUrl: "partials/terms.html",
      controller: 'TermsController'
  })
  .state('selfscan', {
    url: "/selfscan",
    templateUrl: "partials/SelfScan.html",
    controller: 'StudentDailyPickupRequestListController'
})
  .state('inspection', {
    url: "/inspection",
    templateUrl: "partials/inspection.html",
    controller: 'InspectionController'
  })
  .state('notifications', {
    url: "/notifications",
    templateUrl: "partials/notifications.html",
    controller: 'NotificationController'
  })
  .state('appupdate', {
    url: "/appupdate",
    templateUrl: "partials/appupdate.html",
    controller: 'AppUpdateController'
  })
  .state('reportcard', {
    url: "/reportcard:studentID",
    templateUrl: "partials/reportcard.html",
    controller: 'ReportcardController',
    params: {
      studentID: null,
    }
  })
  .state('transportdashboard', {
    url: "/transportdashboard",
    templateUrl: "partials/transportdashboard.html",
    controller: 'TransportDashboardController'
  })
  .state('driverdetails', {
    url: "/driverdetails:studentID",
    templateUrl: "partials/driverdetails.html",
    controller: 'DriverDetailsController',
    params: {
      studentID: null,
    }
  })
  .state('biometricauthentication', {
    url: "/biometricauthentication",
    templateUrl: "partials/biometricauthentication.html",
    controller: 'BiometricAuthenticationController',
  })
  .state('examlogin', {
      url: "/examlogin",
      templateUrl: "partials/examlogin.html",
      controller: 'ExamLoginController'
    })
    .state('studentexamsdashboard', {
      url: "/studentexamsdashboard:candidateID",
      templateUrl: "partials/studentexamsdashboard.html",
      controller: 'StudentExamsDashboardController',
      params: {
        candidateID: null,
      }
    })
   .state('examlist', {
      url: "/examlist:candidateID",
      templateUrl: "partials/examlist.html",
      controller: 'ExamListController',
      params: {
        candidateID: null,
      }
    })
  .state('upcomingexamlist', {
      url: "/upcomingexamlist:candidateID",
      templateUrl: "partials/upcomingexamlist.html",
      controller: 'UpcomingExamListController',
      params: {
        candidateID: null,
      }
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
  // var client = "qaa";
  var client = "eduegate";
  return clientSetting[client];
});

app.factory('rootUrl', function ($http, clientSettings) {
  var environment = "live";
  // var environment = "staging";
  // var environment = "test";
  // var environment = "linux";
  // var environment = "local";

  var urls = appSettings[clientSettings.Client + '-' + environment];
  return {
    RootUrl: urls.RootUrl,
    SchoolServiceUrl: urls.SchoolServiceUrl,
    SecurityServiceUrl: urls.SecurityServiceUrl,
    UserServiceUrl: urls.UserServiceUrl,
    ContentServiceUrl :urls.ContentServiceUrl,
    ErpUrl: urls.ErpUrl,
    ParentUrl: urls.ParentUrl,
    IdentityServerUrl: urls.IdentityServerUrl,

    CurrentAppVersion: urls.CurrentAppVersion,
    AppID: clientSettings.AppID,


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
app.run(function ($state, $rootScope) {
  //FastClick.attach(document.body);
  document.addEventListener("deviceready", onDeviceReady, false);
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
       var modalOpen = document.querySelector(".modal.show");
    if ($state.is("home") || $state.is('biometricauthentication')) {
      // e.preventDefault();
      navigator.notification.confirm("Are you sure you want to exit?", onConfirm, "Please Confirm", "Yes,No");
    }
    else if ($state.is("thankyou")) {
      // e.preventDefault();
      $state.go("home");
    }
    else if ($state.is("feepaymenthistory")) {
      // e.preventDefault();
      $state.go("home");

    }
    else if ($state.is("successfeepayment")) {
      // e.preventDefault();
      $state.go("feepaymenthistory");

    }
    else if ($state.is("failedfeepayment")) {
      // e.preventDefault();
      $state.go("feepaymenthistory");
    }
    else if ($state.is("pendingfeepayment")) {
      // e.preventDefault();
      $state.go("feepaymenthistory");
    }
     else if (modalOpen) {
      e.preventDefault(); // prevent default back action
      $(modalOpen).modal("hide"); // close modal
    } 
    else{
      navigator.app.backHistory();
    }
  }
  function onConfirm(button) {
    if(button==2){//If User selected No, then we just do nothing
        return;
    }else{
        navigator.app.exitApp();// Otherwise we quit the app.
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

  function requestPermission() {
    cordova.plugins.diagnostic.getPermissionsAuthorizationStatus(function(statuses){
      for (var permission in statuses){
          switch(statuses[permission]){
              case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                  console.log("Permission granted to use "+permission);
                  break;
              case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                  console.log("Permission to use "+permission+" has not been requested yet");
                  break;
              case cordova.plugins.diagnostic.permissionStatus.DENIED_ONCE:
                  console.log("Permission denied to use "+permission+" - ask again?");
                  break;
              case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
                  console.log("Permission permanently denied to use "+permission+" - guess we won't be using it then!");
                  break;
          }
      }
  }, function(error){
      console.error("The following error occurred: "+error);
  },[
      cordova.plugins.diagnostic.permission.READ_MEDIA_IMAGES,
      cordova.plugins.diagnostic.permission.READ_MEDIA_VIDEO,
      cordova.plugins.diagnostic.permission.READ_EXTERNAL_STORAGE
  ]);
  }
});
