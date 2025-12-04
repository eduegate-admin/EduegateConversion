app.controller('LoginController', ['$scope', '$http', 'rootUrl', '$location', 'GetContext', '$state', '$stateParams', '$rootScope', 'loggedIn', '$q', function ($scope, $http, rootUrl, $location, GetContext, $state, $stateParams, $rootScope, loggedIn, $q) {
    //console.log('Login Controller loaded.');
    var sercurityService = rootUrl.SecurityServiceUrl;
    $scope.redirectUrl = $stateParams.redirectUrl;
    var userDataService = rootUrl.UserServiceUrl;

    if (
        $scope.redirectUrl == '' ||
         $scope.redirectUrl == undefined ||
         $scope.redirectUrl == null
    ) {
        $scope.redirectUrl = 'home';
    }
    $scope.LoginType = "userid";
    $scope.Message = "";
    $scope.submitted = false;
    $scope.user = {};
    //var cotext = { "UserId": "", "LanguageCode": "en", "IPAddress": "1.1.1.1", "Channel": "" };
    // var context = GetContext.Context();

    window.localStorage.removeItem("context");

    $scope.init = function () {
        $rootScope.ShowLoader = false;

        $scope.onboardingFlag = window.localStorage.getItem("OnboardingCompleted");

        if (!$scope.onboardingFlag) {
            // Redirect to onboarding if not completed
            $state.go('apponboarding', {
                loadBlocks: false,
            });
            // return; // Exit Init function to prevent further execution
        }
    };

    $scope.SignIn = function () {
        $rootScope.ShowLoader = true;
        $scope.submitted = true;
        $rootScope.ErrorMessage = '';
        $rootScope.SuccessMessage = '';
        //$state.go("home");

        if ($scope.loginForm.$valid) {
            $http({
                method: 'POST',
                url: sercurityService + '/StaffLogin',
                data: {
                    'LoginEmailID' : $scope.LoginType == 'email' ? $scope.user.LoginEmailID : null,
                    'LoginUserID' : $scope.LoginType == 'userid' ? $scope.user.LoginUserID : null,
                    'Password': $scope.user.Password
                  },
                headers: { "Accept": "application/json;charset=UTF-8",
                 "Content-type": "application/json; charset=utf-8",
                 "CallContext": null,
                },
            }).success(function (result) {
                if (result.operationResult == 2) {
                  $rootScope.ErrorMessage = result.Message;
                  $rootScope.ShowLoader = false;
                  $scope.Message = result.Message;
                } else if (result.operationResult == 1) {
                  $rootScope.ShowLoader = true;
                  if ($(".lnkOverlay").is(":visible")) {
                    $(".lnkOverlay").toggle();
                  }

                    $scope.UpdateContext().
                    then(function () {
                        $state.go("home");
                    }, function () {
                        $rootScope.ErrorMessage = "Please try later";
                        $scope.Message = "Please try later";
                        $rootScope.ShowLoader = false;
                    });
                }
            }).error(function (err) {
                $rootScope.ErrorMessage = "Login error please contact admin!";
                $scope.Message = "Login error please contact admin!";
                $rootScope.ShowLoader = false;
            });
        }
        else {
            $rootScope.ShowLoader = false;
        }
    };

$scope.UpdateContext = function () {
    return $q(function (resolve, reject) {
        var localContext = jQuery.parseJSON(window.localStorage.getItem("context"));
        if (!localContext) {
            localContext = {};
        }

        localContext.EmailID = $scope.user.LoginEmailID;
        localContext.UserId = $scope.user.LoginUserID;

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
                    // ✅ Add SchoolID from model.data
                    localContext.SchoolID = model.data.SchoolID;
                    localContext.SchoolID = model.data.SchoolID;

                    if (model.data.LoginID) {
                        var setContextPrmoise = GetContext.GetApiKey();
                        setContextPrmoise.then(function (result) {
                            var isSet = GetContext.SetContext(model.data, result.data);

                            localContext = jQuery.parseJSON(window.localStorage.getItem("context"));

                            // Ensure SchoolID is retained after SetContext
                            localContext.SchoolID = model.data.SchoolID;
                            window.localStorage.setItem("context", JSON.stringify(localContext));

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
                url: userDataService + '/RegisterUserDevice?token=' + token + '&userType=' + "Staff",
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

                if(isSuccess == true)
                {
                    $state.go($scope.redirectUrl, null, { reload: true });
                }

            }).error(function () {
                $rootScope.ShowLoader = false;
            });
        }
        else{
            $state.go($scope.redirectUrl, null, { reload: true });
        }
    };

    $scope.OptionClick = function () {
        $('.rightnav-cont').toggle();
    };

    $scope.GoBack = function () {
        if ($scope.redirectUrl == 'home' || $scope.redirectUrl == "myaccount") {
            $state.go("home", { loadBlocks: false }, { reload: true });
        }

        else { $state.go($scope.redirectUrl, null, { reload: true }); }
    };

    $scope.ShowForgotPassword = function () {
        //$(".forgetpasswd").slideDown();
        $(".forgetpasswd").fadeIn();
    };


    $scope.Register = function () {
       $state.go("userregistration", {isAnonymous : true});
    };

    $scope.ChangeClick = function () {
        $scope.Message = "";
    };

    $scope.init();
},
]);