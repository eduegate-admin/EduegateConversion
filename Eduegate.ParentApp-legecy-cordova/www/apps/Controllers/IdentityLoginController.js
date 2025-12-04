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
  "serviceAddToCart",
  "serviceCartCount",
  "$compile",
  "$sce",
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
  ) {
    var sercurityService = rootUrl.SecurityServiceUrl;
    var IdentityServerUrl = rootUrl.IdentityServerUrl;
    $scope.redirectUrl = $stateParams.redirectUrl;
    var userDataService = rootUrl.UserServiceUrl;

    if (
      $scope.redirectUrl == "" ||
      $scope.redirectUrl == undefined ||
      $scope.redirectUrl == null
    ) {
      $scope.redirectUrl = "home";
    }

    $scope.LoginType = "userid";
    $scope.Message = "";
    $scope.submitted = false;
    $scope.user = {};
    $rootScope.onboardingFlag = true;

    window.localStorage.removeItem("context");
    $scope.init = function () {
      $rootScope.ShowLoader = false;
      $rootScope.ShowButtonLoader = false;
      $scope.onboardingFlag = window.localStorage.getItem(
        "OnboardingCompleted"
      );
      if (!$scope.onboardingFlag) {
        $state.go("apponboarding", {
          loadBlocks: false,
        });
      }
    };

    $scope.SignIn = function () {
      $rootScope.ShowButtonLoader = true;
      $scope.submitted = true;
      $rootScope.ErrorMessage = "";
      $rootScope.SuccessMessage = "";
      $scope.Message = "";

      var payload = {
        GrantType: "parent_code",
        username: $scope.user.LoginEmailID,
        password: $scope.user.Password,
        appId: "school_api",
      };

      if ($scope.loginForm.$valid) {
        $http({
          method: "POST",
          url: IdentityServerUrl + "api/auth/token",
          data: payload,
          headers: {
            "Content-type": "application/json; charset=utf-8",
          },
        }).then(
          function (response) {
            var accessToken = response.data.access_token;
            var refreshToken = response.data.refresh_token;

            if (!accessToken) {
              $scope.Message = "Login failed: No token received from server.";
              $rootScope.ErrorMessage =
                "Login failed: No token received from server.";
              $rootScope.ShowButtonLoader = false;
              return;
            }

            AuthService.saveTokens(accessToken, refreshToken).then(function () {
              console.log("JWT Tokens saved successfully.");
              $scope.user.LoginEmailID = payload.username;
              $scope.user.LoginUserID = payload.username;
              $scope.UpdateContext().then(
                function () {
                  $state.go("home");
                },
                function () {
                  $rootScope.ErrorMessage =
                    "Could not update user session. Please try later.";
                  $scope.Message =
                    "Could not update user session. Please try later.";
                  $rootScope.ShowButtonLoader = false;
                }
              );
            });
          },
          function (error) {
            console.error("Login failed:", error);
            $rootScope.ErrorMessage =
              "Login failed. Please check your credentials.";
            $scope.Message = "Login failed. Please check your credentials.";
            $rootScope.ShowButtonLoader = false;
          }
        );
      } else {
        $rootScope.ShowButtonLoader = false;
      }
    };

    $scope.UpdateContext = function () {
      return $q(function (resolve, reject) {
        var localContext = jQuery.parseJSON(
          window.localStorage.getItem("context")
        );
        if (!localContext) {
          localContext = {};
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (emailRegex.test($scope.user.LoginEmailID)) {
          localContext.EmailID = $scope.user.LoginEmailID;
          localContext.UserId = null;
        } else {
          localContext.UserId = $scope.user.LoginEmailID;
        }
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

              if (model.data.LoginID) {
                var setContextPrmoise = GetContext.GetApiKey();
                setContextPrmoise.then(function (result) {
                  var isSet = GetContext.SetContext(model.data, result.data);
                  localContext = jQuery.parseJSON(
                    window.localStorage.getItem("context")
                  );
                  if (
                    !(
                      localContext.ApiKey == "" ||
                      localContext.ApiKey == undefined ||
                      localContext.ApiKey == null
                    )
                  ) {
                    if (
                      localContext.GUID != undefined &&
                      localContext.GUID != null &&
                      localContext.GUID != ""
                    ) {
                      var mergeCartPromise = serviceAddToCart.mergeCart();
                      mergeCartPromise.then(function (result) {
                        localContext = jQuery.parseJSON(
                          window.localStorage.getItem("context")
                        );
                        localContext.GUID = null;
                        window.localStorage.setItem(
                          "context",
                          JSON.stringify(localContext)
                        );

                        $scope.RegisterUserDevice();
                      });
                    } else {
                      localContext = jQuery.parseJSON(
                        window.localStorage.getItem("context")
                      );
                      window.localStorage.setItem(
                        "context",
                        JSON.stringify(localContext)
                      );

                      $scope.RegisterUserDevice();
                    }
                  } else {
                    $translate(["ERRORWHILELOGIN"]).then(function (
                      translation
                    ) {
                      $rootScope.ErrorMessage = translation.ERRORWHILELOGIN;
                      $(".error-msg").removeClass("showMsg");
                      $(".error-msg")
                        .addClass("showMsg")
                        .delay(2000)
                        .queue(function () {
                          $(this).removeClass("showMsg");
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
      var token = window.localStorage.getItem("firebasedevicetoken");
      var context = GetContext.Context();
      if (token) {
        $http({
          url:
            userDataService +
            "/RegisterUserDevice?token=" +
            token +
            "&userType=" +
            "Parent",
          method: "GET",
          headers: {
            Accept: "application/json;charset=UTF-8",
            "Content-type": "application/json; charset=utf-8",
            CallContext: JSON.stringify(context),
          },
        })
          .success(function (result) {
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
          })
          .error(function () {
            $rootScope.ShowLoader = false;
          });
      } else {
        $state.go($scope.redirectUrl, null, { reload: true });
      }
    };

    $scope.myFunction = function () {
      var password = document.getElementById("password");
      if (password.type === "password") {
        password.type = "text";
      } else {
        password.type = "password";
      }
    };

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
