app.controller("LoginMultiTenantController", [
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
  "clientSettings",
    "AuthService",
    "tenantSettings",
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
     clientSettings,
      AuthService,
      tenantSettings
  ) {
    //console.log('Login Controller loaded.');
    var sercurityService = rootUrl.SecurityServiceUrl;
    $scope.redirectUrl = $stateParams.redirectUrl;
    var userDataService = rootUrl.UserServiceUrl;

    if (
      $scope.redirectUrl == "" ||
      $scope.redirectUrl == undefined ||
      $scope.redirectUrl == null
    ) {
      $scope.redirectUrl = "home";
    }
$rootScope.TenantId  = null;
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

      if ($scope.loginForm.$valid) {
        $http({
          method: "POST",
          url: sercurityService + "/ParentLogin",
          data: {
            LoginEmailID: $scope.user.LoginEmailID,
            Password: $scope.user.Password,
          },
          headers: {
            Accept: "application/json;charset=UTF-8",
            "Content-type": "application/json; charset=utf-8",
            CallContext: null,
          },
        })
          .success(function (result) {
            if (result.operationResult == 2) {
              $rootScope.ErrorMessage = result.Message;
              $rootScope.ShowButtonLoader = false;
              $scope.Message = result.Message;
            } else if (result.operationResult == 1) {
              $rootScope.ShowButtonLoader = true;
              if ($(".lnkOverlay").is(":visible")) {
                $(".lnkOverlay").toggle();
              }

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
          })
          .error(function (err) {
            $rootScope.ErrorMessage = "Please try later";
            $scope.Message = "Please try later";
            $rootScope.ShowButtonLoader = false;
          });
      } else {
        $rootScope.ShowButtonLoader = false;
      }
    };
 

  $scope.switchTenant = function (tenantId) {
    tenantSettings.setTenant(tenantId);
  }
  $scope.SignInMultiTenant = function () {
  $rootScope.ShowButtonLoader = true;
  $scope.submitted = true;
  $rootScope.ErrorMessage = "";
  $scope.Message = "";

  if ($scope.loginForm.$valid) {
    $http({
      method: "POST",
      url: sercurityService + "/ParentLoginMultiTenant",
      data: {
        LoginEmailID: $scope.user.LoginEmailID,
        Password: $scope.user.Password,
      },
      headers: {
        Accept: "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        CallContext: null,
      },
    }).then(function (response) {
      var result = response.data;

      if (result && result.token && result.tenantId) {
        // Save JWT securely
       // Switch to the selected tenant
        AuthService.saveToken(result.token).then(function () {
           $scope.switchTenant(result.tenantId); 
          if ($(".lnkOverlay").is(":visible")) {
            $(".lnkOverlay").toggle();
          }

          // Update context
          $scope.UpdateContext(result.tenantId).then(
            function () {
              $state.go("home");
            },
            function () {
              $rootScope.ErrorMessage =
                "Could not setup user context. Please try later.";
              $scope.Message =
                "Could not setup user context. Please try later.";
              $rootScope.ShowButtonLoader = false;
            }
          );
        }).catch(function () {
          $rootScope.ErrorMessage =
            "Could not securely save session. Please try again.";
          $rootScope.ShowButtonLoader = false;
        });

      } else {
        $rootScope.ErrorMessage = result.Message || "Invalid credentials.";
        $scope.Message = result.Message || "Invalid credentials.";
        $rootScope.ShowButtonLoader = false;
      }
    }).catch(function () {
      $rootScope.ErrorMessage = "A server error occurred. Please try later.";
      $scope.Message = "A server error occurred. Please try later.";
      $rootScope.ShowButtonLoader = false;
    });
  } else {
    $rootScope.ShowButtonLoader = false;
  }
};


    // You can now safely remove the old $scope.SignIn function from this controller,
    // as it should never be used here.
    // delete $scope.SignIn;
    $scope.UpdateContext = function (tenantId) {
      return $q(function (resolve, reject) {
        var localContext = jQuery.parseJSON(
          window.localStorage.getItem("context")
        );
        if (!localContext) {
          localContext = {};
        }
         localContext.TenantID = tenantId; 
         window.localStorage.setItem("context", JSON.stringify(localContext));
          // clientSettings.Tenant = tenantId;
        // Using a regular expression for stricter email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (emailRegex.test($scope.user.LoginEmailID)) {
          // Valid email format, keep it as EmailID
          localContext.EmailID = $scope.user.LoginEmailID;
          localContext.UserId = null;
        } else {
          // Not a valid email format, use UserId instead
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
              // GetContext.SetContext(model.data, null);
              // resolve();

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

      // store the token
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
