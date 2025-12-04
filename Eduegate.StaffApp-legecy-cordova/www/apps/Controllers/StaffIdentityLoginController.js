app.controller("StaffIdentityLoginController", [
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
    $compile,
    $sce,
    AuthService
  ) {
    var sercurityService = rootUrl.SecurityServiceUrl;
    var IdentityServerUrl = rootUrl.IdentityServerUrl;
    var userDataService = rootUrl.UserServiceUrl;

    $scope.redirectUrl = $stateParams.redirectUrl || "home";
    $scope.LoginType = "userid";
    $scope.Message = "";
    $scope.submitted = false;
    $scope.user = {};
    $rootScope.onboardingFlag = true;

    window.localStorage.removeItem("context");

    // 🔹 INIT FUNCTION
    $scope.init = function () {
      $rootScope.ShowLoader = false;
      $rootScope.ShowButtonLoader = false;
      $scope.onboardingFlag = window.localStorage.getItem("OnboardingCompleted");

      if (!$scope.onboardingFlag) {
        $state.go("apponboarding", { loadBlocks: false });
      }
    };

$scope.SignIn = function () {
  $rootScope.ShowButtonLoader = true;
  $scope.submitted = true;
  $rootScope.ErrorMessage = "";
  $rootScope.SuccessMessage = "";
  $scope.Message = "";

  const payload = {
    GrantType: "staff_code",
    username: $scope.user.LoginUserID,
    password: $scope.user.Password,
    appId: "2"
  };

  if ($scope.loginForm.$valid) {
    $http({
      method: "POST",
      url: IdentityServerUrl + "api/auth/token",
      data: payload,
      headers: {
        Accept: "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        CallContext: null
      }
    }).then(function (response) {
        var accessToken = response.data.access_token;
        var refreshToken = response.data.refresh_token;

      if (!accessToken) {
        $scope.Message = "Login failed: No token received from server.";
        $rootScope.ErrorMessage = $scope.Message;
        $rootScope.ShowButtonLoader = false;
        return;
      }

      // ✅ Save token locally
      AuthService.saveTokens(accessToken, refreshToken).then(function () {
        console.log("JWT Token saved successfully for Staff.");

        // ✅ Set context and continue
        $scope.user.LoginEmailID = payload.username;
        $scope.user.LoginUserID = payload.username;

        $scope.UpdateContext()
          .then(function () {
            $state.go("home");
          })
          .catch(function () {
            $rootScope.ErrorMessage = "Could not update user session. Please try later.";
            $scope.Message = $rootScope.ErrorMessage;
            $rootScope.ShowButtonLoader = false;
          });
      });
    }).catch(function (error) {
      console.error("Login failed:", error);
      $rootScope.ErrorMessage = "Login failed. Please check your credentials.";
      $scope.Message = $rootScope.ErrorMessage;
      $rootScope.ShowButtonLoader = false;
    });
  } else {
    $rootScope.ShowButtonLoader = false;
  }
};


$scope.UpdateContext = function () {
  return $q(function (resolve, reject) {
    let localContext = JSON.parse(window.localStorage.getItem("context") || "{}");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test($scope.user.LoginEmailID)) {
      localContext.EmailID = $scope.user.LoginEmailID;
      localContext.UserId = null;
    } else {
      localContext.UserId = $scope.user.LoginEmailID;
      localContext.EmailID = null;
    }

    loggedIn
      .CheckLogin(localContext, rootUrl.SecurityServiceUrl, 0)
      .then(function (model) {
        if (!model?.data?.LoginEmailID || !model?.data?.LoginID) {
          console.warn("CheckLogin returned invalid data", model);
          return reject();
        }

        // ✅ Set context using user data and API key
        return GetContext.GetApiKey()
          .then(function (apiKeyResponse) {
            const isSet = GetContext.SetContext(model.data, apiKeyResponse.data);
            let context = JSON.parse(window.localStorage.getItem("context") || "{}");

            if (!context.ApiKey) {
              console.error("ApiKey missing in context.");
              return reject();
            }

            // ✅ Merge cart if GUID exists
            if (context.GUID) {
              if (typeof serviceAddToCart === "undefined") {
                console.error("serviceAddToCart not injected.");
                return reject();
              }

              return serviceAddToCart.mergeCart().then(function () {
                context = JSON.parse(window.localStorage.getItem("context"));
                context.GUID = null;
                window.localStorage.setItem("context", JSON.stringify(context));
                return resolve();
              });
            } else {
              // No cart merge needed
              window.localStorage.setItem("context", JSON.stringify(context));
              return resolve();
            }
          });
      })
      .catch(function (err) {
        console.error("Error in UpdateContext:", err);
        return reject();
      });
  }).then(function () {
    $scope.RegisterUserDevice();
  });
};



    // 🔹 REGISTER DEVICE FUNCTION
    $scope.RegisterUserDevice = function () {
      var isSuccess = true;
      var token = window.localStorage.getItem("firebasedevicetoken");
      var context = GetContext.Context();

      if (token) {
        $http({
          url: userDataService + "/RegisterUserDevice?token=" + token + "&userType=Staff",
          method: "GET",
          headers: {
            Accept: "application/json;charset=UTF-8",
            "Content-type": "application/json; charset=utf-8",
            CallContext: JSON.stringify(context),
          },
        })
          .success(function (result) {
              console.log("Device registration result:", result);
            if (result.operationResult == 2) {
              $scope.Message = result.Message;
              $rootScope.ShowLoader = false;
              isSuccess = false;
              window.localStorage.removeItem("context");
            }
            $rootScope.ShowLoader = false;

            if (isSuccess) {
              $state.go($scope.redirectUrl, null, { reload: true });
            }
          })
          .error(function () {
              console.log("Device registration result:", result);
            $rootScope.ShowLoader = false;
          });
      } else {
        $state.go($scope.redirectUrl, null, { reload: true });
      }
    };

    // 🔹 PASSWORD SHOW/HIDE
    $scope.myFunction = function () {
      var password = document.getElementById("password");
      password.type = password.type === "password" ? "text" : "password";
    };

    // 🔹 OTHER UI FUNCTIONS
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
