app.controller("LoginController", [
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
    $sce
  )     {
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

    $scope.LoginType = "userid";
    $scope.Message = "";
    $scope.submitted = false;
    $scope.user = {};

    //var context = { "UserId": "", "LanguageCode": "en", "IPAddress": "1.1.1.1", "Channel": "" };
    // var context = GetContext.Context();

    window.localStorage.removeItem("context");

    $scope.init = function () {
      $rootScope.ShowLoader = false;
      $rootScope.ShowButtonLoader = false;

      // $scope.GetShoppingCartCount();

      // var swipeContainer = document.querySelector('.swipeData');
      // var hammerEvent = new Hammer(swipeContainer);
      // hammerEvent.on('swipe', function (e) {
      //     if (e.deltaX >= 50) {
      //         console.log("swiped Right");
      //         $(".orderTabs .tabItem[data-tab='offlineOrders']").trigger('click');
      //     }
      //     else if (e.deltaX <= -50) {
      //         console.log("swiped Left");
      //         $(".orderTabs .tabItem[data-tab='onlineOrders']").trigger('click');
      //     }
      // });
    };


    $scope.SignIn = function () {
      $rootScope.ShowButtonLoader = true;
      $scope.submitted = true;
      $rootScope.ErrorMessage = "";
      $rootScope.SuccessMessage = "";
      $scope.Message = "";
      //$state.go("home");

      if ($scope.loginForm.$valid) {
        $http({
          method: "POST",
          url: sercurityService + "/StudentLogin",
          data: {
            'LoginEmailID':  $scope.user.LoginEmailID ,
            'Password': $scope.user.Password
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

    $scope.UpdateContext = function () {
      return $q(function (resolve, reject) {
        var localContext = jQuery.parseJSON(
          window.localStorage.getItem("context")
        );
        if (!localContext) {
          localContext = {};
        }

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

    // $scope.GetShoppingCartCount = function () {
    //   var cartPromise = serviceCartCount.getProductCount(context, rootUrl.RootUrl);
    //   cartPromise.then(function (result) {
    //     $scope.ShoppingCartCount = result;
    //     $rootScope.ShowLoader = false;
    //   }, function () {

    //   });
    // };
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