app.controller("IdentityLoginController", [
  "$scope",
  "$http",
  "rootUrl",
  "$location",
  "GetContext",
  "$state",
  "$stateParams",
  "$rootScope",
  "loggedIn",
  "$q",
  'serviceAddToCart',
  'serviceCartCount',
  '$compile',
  '$sce',
    "AuthService",

  function (
    $scope,
    $http,
    rootUrl,
    $location,
    GetContext,
    $state,
    $stateParams,
    $rootScope,
    loggedIn,
    $q,
    serviceAddToCart,
    serviceCartCount,
    $compile,
    $sce,
    AuthService
  )     {
    //console.log('Login Controller loaded.');
    var sercurityService = rootUrl.SecurityServiceUrl;
        var IdentityServerUrl = rootUrl.IdentityServerUrl;
    $scope.redirectUrl = $stateParams.redirectUrl;
    var userDataService = rootUrl.UserServiceUrl;
    var schoolService = rootUrl.SchoolServiceUrl;

    if (
      $scope.redirectUrl == "" ||
      $scope.redirectUrl == undefined ||
      $scope.redirectUrl == null
    ) {
      $scope.redirectUrl = "home";
    }

    $scope.LoginType = "qid";
    $scope.Message = "";
    $scope.submitted = false;
    $scope.user = {};

    //var context = { "UserId": "", "LanguageCode": "en", "IPAddress": "1.1.1.1", "Channel": "" };
    // var context = GetContext.Context();

    window.localStorage.removeItem("context");

    $scope.init = function () {
      $rootScope.ShowLoader = false;
      $rootScope.ShowButtonLoader = false;
    };


    $scope.SignIn = function () {
      $rootScope.ShowButtonLoader = true;
      $scope.submitted = true;
      $rootScope.ErrorMessage = "";
      $rootScope.PassportNumber = $scope.user.PassportNumber ;
      $rootScope.QID = $scope.user.QID ;
      $rootScope.SuccessMessage = "";
      $scope.Message = "";
  var payload = {
        GrantType: "visitor_id",
        qid: ($scope.LoginType == 'qid' && $scope.user.QID) ? $scope.user.QID.toString() : null,
        passportNumber: $scope.LoginType == 'passNo' ? $scope.user.PassportNumber : null,
        appId: "school_api",
    };
      if ($scope.loginForm.$valid) {
   $http({
        method: "POST",
        url: IdentityServerUrl + "api/auth/token",
        data: payload,
        headers: { "Content-type": "application/json; charset=utf-8" },
      }).then(
        function (response) {
          var accessToken = response.data.access_token;
          var refreshToken = response.data.refresh_token;

          if (!accessToken) {
            $scope.Message = "Login failed: No token received.";
            $rootScope.ShowButtonLoader = false;
            return;
          }

          AuthService.saveTokens(accessToken, refreshToken).then(function () {
            console.log("Visitor JWT Tokens saved successfully.");
            $scope.FillUserDetails();
          });
        },
        function (error) {
          console.error("Visitor Login failed:", error);
          if (error.status === 401) {
              $state.go("register", {
                QID: $scope.user.QID,
                PassportNumber: $scope.user.PassportNumber,
             });
          } else {
            $rootScope.ErrorMessage = "An error occurred. Please try later.";
          }
          $rootScope.ShowButtonLoader = false;
        }
      );
    };
    };

    $scope.FillUserDetails = function () {

      var qID = "";
      var passportNumber = "";

      if ($scope.QID)
      {
        qID = $scope.QID;
      }

      if ($scope.PassportNumber)
      {
        passportNumber = $scope.PassportNumber;
      }

      $http({
          method: "GET",
          url: schoolService + "/GetVisitorDetails?QID=" + qID + "&passportNumber=" + passportNumber,
          headers: {
              Accept: "application/json;charset=UTF-8",
              "Content-type": "application/json; charset=utf-8",
              CallContext: null,
          },
      }).success(function (result) {
          if (result) {
              $scope.UserDetails = result;

              $scope.UpdateContext().then(
                function () {
                  $state.go("home");
                },
                function () {
                  $rootScope.ErrorMessage = "Please try later";
                  $scope.Message = "Please try later";
                  $rootScope.ShowButtonLoader = false;
                }
              );
          }
          else{
              $rootScope.ShowButtonLoader = false;
              $scope.IsLoggedIn = false;
          }
      }).error(function (err) {
          $rootScope.ErrorMessage = "Please try later";
          $scope.Message = "Please try later";
          $rootScope.ShowButtonLoader = false;
          $scope.IsLoggedIn = false;
      });
  };

    $scope.UpdateContext = function () {
      return $q(function (resolve, reject) {
        var localContext = jQuery.parseJSON(
          window.localStorage.getItem("context")
        );
        if (!localContext) {
          localContext = {};
        }
        localContext.EmailID = $scope.UserDetails.EmailID;
        localContext.UserId = $scope.UserDetails.VisitorNumber;
        var loggedInPromise = loggedIn.CheckLogin(
          localContext,
          sercurityService,
          0
        );
        loggedInPromise.then(function (model) {
          if (model.data != null && model.data != undefined) {
            if (
              model.data.LoginEmailID != null &&
              model.data.LoginEmailID != undefined &&
              model.data.LoginEmailID != ""
            ) {
              // GetContext.SetContext(model.data, null);
              // resolve();

              if (model.data.LoginID) {
                var setContextPrmoise = GetContext.GetApiKey();
                setContextPrmoise.then(function (result) {
                  var isSet = GetContext.SetContext(model.data, result.data)
                  localContext = jQuery.parseJSON(window.localStorage.getItem("context"));
                  if (!(localContext.ApiKey == "" || localContext.ApiKey == undefined || localContext.ApiKey == null)) {
                    if (localContext.GUID != undefined && localContext.GUID != null && localContext.GUID != "") {
                      var mergeCartPromise = serviceAddToCart.mergeCart();
                      mergeCartPromise.then(function (result) {
                        localContext = jQuery.parseJSON(window.localStorage.getItem("context"));
                        localContext.GUID = null;
                        window.localStorage.setItem("context", JSON.stringify(localContext));

                        $scope.RegisterUserDevice();
                      });
                    }
                    else {
                      localContext = jQuery.parseJSON(window.localStorage.getItem("context"));
                      window.localStorage.setItem("context", JSON.stringify(localContext));

                      $scope.RegisterUserDevice();
                    }
                  }
                  else {
                    $translate(['ERRORWHILELOGIN']).then(function (translation) {
                      $rootScope.ErrorMessage = translation.ERRORWHILELOGIN;
                      $(".error-msg").removeClass('showMsg');
                      $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                        $(this).removeClass('showMsg');
                        $(this).dequeue();
                      });

                    });
                  }
                });
              }
            }
          }
        });
      }).then(function () {
        $scope.RegisterUserDevice();
      });
    };

    $scope.RegisterUserDevice = function () {
      var isSuccess = true;
      // store the token
      var token = window.localStorage.getItem("firebasedevicetoken");
      var context = GetContext.Context();
      if (token) {
        $http({
          url: userDataService + '/RegisterUserDevice?token=' + token + '&userType=' + "Parent",
          method: 'GET',
          headers: {
            "Accept": "application/json;charset=UTF-8",
            "Content-type": "application/json; charset=utf-8",
            "CallContext": JSON.stringify(context)
          },
        }).success(function (result) {

          if (result.operationResult == 2) {
            $scope.Message = result.Message;

            $rootScope.ShowLoader = false;
            isSuccess = false;
            window.localStorage.removeItem("context");
          }
          $rootScope.ShowLoader = false;

          if (isSuccess == true) {
            $state.go($scope.redirectUrl, null, { reload: true });
          }

        }).error(function () {
          $rootScope.ShowLoader = false;
        });
      }
      else {
        $state.go($scope.redirectUrl, null, { reload: true });
      }
    };

    $scope.myFunction = function() {
        var password = document.getElementById("password");
        if (password.type === "password") {
            password.type = "text";
      } else {
            password.type = "password";
      }
    }

    $scope.OptionClick = function () {
      $(".rightnav-cont").toggle();
    };

    $scope.GoBack = function () {
      if ($scope.redirectUrl == "home" || $scope.redirectUrl == "myaccount") {
        $state.go("home", { loadBlocks: false }, { reload: true });
      } else {
        $state.go($scope.redirectUrl, null, { reload: true });
      }
    };

    $scope.ShowForgotPassword = function () {
      //$(".forgetpasswd").slideDown();
      $(".forgetpasswd").fadeIn();
    };

    $scope.Register = function () {
      $state.go("userregistration", { isAnonymous: true });
    };

    $scope.ChangeClick = function () {
      $scope.Message = "";
    };

    $scope.init();
  },
]);