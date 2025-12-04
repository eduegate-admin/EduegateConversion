app.controller("LayoutController", [
  "$scope",
  "$http",
  "$rootScope",
  "$state",
  "$window",
  "rootUrl",
  "$timeout",
  "GetContext",
  "clientSettings",
  "$translate",
  'AuthService',
  'clientSettings',
  function (
    $scope,
    $http,
    $rootScope,
    $state,
    $window,
    rootUrl,
    $timeout,
    GetContext,
    $clientSettings,
    $translate,
    AuthService,
    clientSettings
  ) {
    console.log("Layout Controller loaded.");
    var context = GetContext.Context();

    $rootScope.ClientSettings = $clientSettings;
    $rootScope.ShowSettingDialog = null;
    $rootScope.LoadingMessage = "";
    $rootScope.ShowLoader = false;
    $translate.use($rootScope.UserLanguage || "en");

    $rootScope.IsOnline = true;
    $rootScope.BoilerPlates = [];
    var pageInfoPromise = null;


    $scope.Init = function () {
      $rootScope.menuNewUrl();
      $scope.RemoveOverlay();
    };

    $rootScope.DarkMode = function () {
      KTThemeMode.setMode("dark");
  }
  $rootScope.Lightmode = function () {
      KTThemeMode.setMode("light");
  }
    $rootScope.UpdateContext = function (contextData) {
      var context = window.localStorage.getItem("context");
      if (!context) {
        Context = GetContext.Context();
        context = window.localStorage.getItem("context");
      }

      var localContext = jQuery.parseJSON(context);

      for (key in contextData) {
        localContext[key] = contextData[key];
      }

      window.localStorage.setItem("context", JSON.stringify(localContext));
    };

    $rootScope.CheckLogin = function () {
      var localContext = jQuery.parseJSON(
        window.localStorage.getItem("context")
      );
      var loggedInPromise = loggedIn.CheckLogin(localContext, dataService, 0);
      loggedInPromise.then(
        function (model) {
          if (model.data) {
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
                      $state.go($scope.redirectUrl, null, { reload: true });
                    });
                  } else {
                    $state.go($scope.redirectUrl, null, { reload: true });
                  }
                } else {
                  $translate(["ERRORWHILELOGIN"]).then(function (translation) {
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
                  //$rootScope.ErrorMessage = "Error while logging in";
                }
              });
            }
          }
        },
        function () {}
      );
    };

    $scope.RemoveOverlay = function () {
      if ($(".lnkOverlay").is(":visible")) {
        $(".lnkOverlay").toggle();
      }
    };

    $rootScope.menuNewUrl = function () {
      var random = Math.random();
      $rootScope.menuUrl = "partials/user-settings.html?random=" + random;
    };

    $scope.RemoveSideMenu = function () {
      $("body").removeClass("active");
      $("html").removeClass("active");
    };

    $scope.LoadOverlay = function (e) {
      if (!$(".lnkOverlay").is(":visible")) {
        $(".lnkOverlay").toggle();
      }
      if ($(".lnkOverlay").is(":visible")) {
        //e.preventDefault();
        $scope.BodyActive = true;
        $("body").addClass("active");
        $("html").addClass("active");
        $(".other_options li div.signup").hide();
      }
    };

    $("body").on("click", function (e) {
      if ($(e.target).closest("#searchbutton, .searchbar").length === 0) {
        $(".searchbar").hide();
      }
    });

    $rootScope.goBack = function () {
      $(".sidenav").sidenav("close");
      $window.history.back();
    };

    $rootScope.SignOut = function () {
      $(".sidenav").sidenav("close");
      $http({
        url: rootUrl.SecurityServiceUrl + "/Logout",
        method: "GET",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).success(function (result) {
        if ($(".lnkOverlay").is(":visible")) {
          $(".lnkOverlay").toggle();
        }

        // context = jQuery.parseJSON(window.localStorage.getItem("context"));
        // context.CompanyID = $rootScope.UserCountry;
        // context.SiteID = $rootScope.UserCountry;
        // context.LanguageCode = $rootScope.UserLanguage;
        // context.LoginID = null;
        // context.MobileNumber = null;
        // context.OTP = null;
        // context.IsGuestUser = false;
        // window.localStorage.setItem("context", JSON.stringify(context));
        // window.localStorage.setItem("customerName", "");
        //$scope.CheckLogin();
      });
      window.localStorage.removeItem("context");
      window.localStorage.removeItem('MinimalParentDetails');
      window.localStorage.removeItem('cachedMessages');
      window.localStorage.removeItem('isDriver');
      
      AuthService.clearTokens().then(function() {
                console.log("Tokens cleared.");
                        $state.go(clientSettings.DefaultLoginState, null, { reload: true });

            });
    };

            $rootScope.ShowToastMessage = function (message, type = 'error') {
            if (type == 'error') {
                $rootScope.ErrorMessage = message;
                $(".error-msg").removeClass('showMsg');
                $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                    $(this).removeClass('showMsg');
                    $(this).dequeue();
                });
                if ($(".lnkOverlay").is(':visible')) {
                    $(".lnkOverlay").toggle();
                }
            }
            else if (type == 'success') {
                $rootScope.SuccessMessage = message;
                M.toast({ html: message })
                $(".success-msg").removeClass('showMsg');
                $(".success-msg").addClass('showMsg').delay(2000).queue(function () {
                    $(this).removeClass('showMsg');
                    $(this).dequeue();
                });
            }
        }
  },
]);
