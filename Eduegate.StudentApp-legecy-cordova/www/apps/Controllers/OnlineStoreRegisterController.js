app.controller('OnlineStoreRegisterController', ['$scope', '$http', 'loggedIn', 'rootUrl', 
'$location', 'GetContext', '$state', '$stateParams', '$sce', '$rootScope', '$q', 'serviceCartCount','serviceAddToCart','$translate','$timeout',
function ($scope, $http, loggedIn, rootUrl, $location, GetContext, $state, $stateParams, $sce, $rootScope,
    $q, serviceCartCount,serviceAddToCart,$translate,$timeout) {
        //console.log('Register Controller loaded.');
        var dataService = rootUrl.RootUrl;
        $scope.register = { Customer: {}, Contacts: {} };
        //$scope.register.Customer.IsSubscribeOurNewsLetter = 0;
        $scope.register.Customer.HowKnowText = "";
        //$scope.Register.Customer = {};
        //$scope.Register.Contacts = {};
        $scope.register.Customer.HowKnowOptionID = "";
        $scope.register.Customer.IsTermsAndConditions = true;
        $scope.register.Customer.IsSubscribeOurNewsLetter = true;
        $scope.register.Customer.CountryID = 10003;
        $scope.submitted = false;
        $scope.KnowHowOptions;
        $scope.Countries;
        $scope.Message = "";
        $scope.isEditable = false;
        $scope.TagAddress = "";
        $scope.SelectedStore = "";
        $scope.Branches = [];
        $scope.ShowGuestLogin = false;
        $scope.ShowRegisterHeader = true;
        $scope.GenderModel = "";
        $scope.Genders = [];
        $scope.showPrivacyPolicy = false;
        $scope.IsMapClickable = true;
        $scope.Address = [];

        $translate(['MALE', 'FEMALE']).then(function (translations) {
            $scope.Genders = [
                { GenderID: "1", GenderName: translations.MALE },
                { GenderID: "2", GenderName: translations.FEMALE }];
        });

        var Context = GetContext.Context();
        $scope.ShoppingCartCount = 0;

        $scope.init = function () {
            $rootScope.ShowLoader = true;
            //$scope.GetCountries();
            $scope.GetShoppingCartCount();
            $scope.GetBranches();
            $scope.GetUserDetail();
            $scope.GetAreas();
        }

        $scope.GetUserDetail = function () {
            $http({
                method: 'GET',
                url: dataService + '/GetUserDetails',
                headers: {
                    "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context)
                }
            }).then(function (result) {
                result = result.data;
                $scope.register.Customer.FirstName = result.Customer ? result.Customer.FirstName : null;
                $scope.register.Customer.LastName = result.Customer ? result.Customer.LastName : null;
                $scope.register.LoginEmailID = result.LoginEmailID;
                $scope.register.MobileNumber = result.Customer ? result.Customer.TelephoneNumber : null;
                $scope.register.CustomerAddress = result.CustomerAddress;
                $rootScope.ShowLoader = false;
            }, function (err) {
                $rootScope.ShowLoader = false;
            });
        }

        $scope.GetBranches = function () {
            var url = rootUrl.RootUrl + '/GetBranches';
            $http({
                method: 'GET',
                url: url,
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(Context)
                }
            }).then(function (results) {
                $scope.Branches = results.data;
            }, function (err) {
            });
        }

        $scope.OptionClick = function () {
            $('.rightnav-cont').toggle();
        }

        $scope.GetShoppingCartCount = function () {
            var cartPromise = serviceCartCount.getProductCount(Context, rootUrl.RootUrl);
            cartPromise.then(function (result) {
                $scope.ShoppingCartCount = result;
            }, function () {

            });
        }

        $scope.ShowText = function (knowHowOptionID) {
            var knowHowOption = findID(knowHowOptionID);
            if (knowHowOption[0] != undefined) {
                $scope.isEditable = knowHowOption[0].IsEditable;
            }
            else {
                $scope.isEditable = false;
            }
            $scope.register.Customer.HowKnowText = "";
        }

        function findID(knowhowoptionID) {
            return $scope.KnowHowOptions.filter(function (data) {
                return data.KnowHowOptionIID == knowhowoptionID;
            });
        }

        $scope.GetCountries = function () {
            var url = rootUrl.RootUrl + '/GetCountries';
            $http({
                method: 'GET',
                url: url,
                headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) }
            }).then(function (results) {
                $scope.Countries = results;
                //$rootScope.ShowLoader = false;
            }, function (err) {
                //$rootScope.ShowLoader = false;
            });
        }

        $scope.GenderChange = function (value) {
            $scope.GenderModel = value.toString();
        }

        $scope.BranchChange = function (value) {
            $scope.SelectedStore = value.toString();
        }

        $scope.SignUp = function () {
            // if ($clientSettings.GeolocationEnabled) {
            //   if (!$scope.register.AddressLongitude && $clientSettings.GeolocationMandatory) {
            //     $translate(["PLEASESELECTFROMPICK"]).then(function (translation) {
            //       $rootScope.ShowToastMessage(
            //         translation.PLEASESELECTFROMPICK,
            //         "error"
            //       );
            //     });
      
            //     return;
            //   }
            // } else 
            if (!$scope.register.IsPrivacyPolicy) {
              $translate(["PLEASECONFIRMPRIVACYPOLICY"]).then(function (translation) {
                $rootScope.ErrorMessage = translation.PLEASECONFIRMPRIVACYPOLICY;
                $(".error-msg").removeClass("showMsg");
                $(".error-msg")
                  .addClass("showMsg")
                  .delay(2000)
                  .queue(function () {
                    $(this).removeClass("showMsg");
                    $(this).dequeue();
                  });
              });
              return;
            }
      
            $rootScope.ShowLoader = true;
            $scope.Message = "";
            $scope.submitted = true;
            $rootScope.ErrorMessage = "";
            $rootScope.SuccessMessage = "";
            $scope.register.LoginID = Context.LoginID;
            $scope.register.Customer.TelephoneNumber = $scope.register.MobileNumber;
            $scope.register.Customer.HowKnowOptionID = null;
            $scope.register.Branch = {};
            $scope.register.Branch.BranchIID =
              $scope.SelectedStore != "" ? parseInt($scope.SelectedStore) : 0;
            //$scope.register.CustomerAddress = $scope.TagAddress;
            $scope.register.Customer.GenderID =
              $scope.GenderModel != "" ? parseInt($scope.GenderModel) : 1;
            $scope.register.Contacts = null;
      
            if (this.registerForm.$valid) {
              $http({
                method: "POST",
                url: dataService + "/Register",
                data: $scope.register,
                headers: {
                  Accept: "application/json;charset=UTF-8",
                  "Content-type": "application/json; charset=utf-8",
                  CallContext: JSON.stringify(Context),
                },
              }).then(
                function (result) {
                  result = result.data;
                  if (result.operationResult == 2) {
                    $rootScope.ErrorMessage = result.Message;
                    $(".error-msg").removeClass("showMsg");
                    $(".error-msg")
                      .addClass("showMsg")
                      .delay(2000)
                      .queue(function () {
                        $(this).removeClass("showMsg");
                        $(this).dequeue();
                      });
                  } else if (result.operationResult == 1) {
                    $translate(["YOURINFORMATION"]).then(function (translation) {
                      $rootScope.SuccessMessage = translation.YOURINFORMATION;
                    });
                    $(".success-msg").removeClass("showMsg");
                    $(".success-msg")
                      .addClass("showMsg")
                      .delay(2000)
                      .queue(function () {
                        $(this).removeClass("showMsg");
                        $(this).dequeue();
                      });
      
                    $rootScope.UpdateContext({ IsProfileCompleted: true });
                    $rootScope.NoificationCount = 0;
      
                    if ($stateParams.redirectUrl) {
                      $state.go($stateParams.redirectUrl, {
                        loadBlocks: true,
                      });
                    } else {
                      $state.go("home", {
                        loadBlocks: true,
                      });
                    }
                  }
      
                  if (result && result.WarningMessage) {
                    $timeout(function () {
                      $(".licartClick").notify(result.WarningMessage, {
                        position: "bottom right",
                        arrowSize: 8,
                        className: "info",
                        autoHide: false,
                        clickToHide: false,
                      });
                    }, 500);
                  }
      
                  $rootScope.ShowLoader = false;
                },
                function (err) {
                  $translate(["PLEASETRYLATER"]).then(function (translation) {
                    $rootScope.ErrorMessage = translation.PLEASETRYLATER;
                    $(".error-msg").removeClass("showMsg");
                    $(".error-msg")
                      .addClass("showMsg")
                      .delay(2000)
                      .queue(function () {
                        $(this).removeClass("showMsg");
                        $(this).dequeue();
                      });
                  });
                  //$rootScope.ErrorMessage = "Please try later";
                  $rootScope.ShowLoader = false;
                }
              );
            } else {
              $rootScope.ShowLoader = false;
            }
          }

        $scope.ContineAsGuest = function () {
            $rootScope.UpdateContext({ "MobileNumber": null });
            $rootScope.UpdateContext({ "OTP": null });
            $rootScope.UpdateContext({ "LoginID": null });
            $rootScope.UpdateContext({ "IsGuestUser": true });
            $rootScope.IsGuestUser = true;
            $rootScope.Showhomepage = true;
            $state.go('home', {
                loadBlocks: true
            });
        }

        $scope.AutoLocateYourStore = function () {
            $rootScope.ShowLoader = true;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(setCurrentLocation);
            }
        }

        function setCurrentLocation(position) {
            $scope.$apply(function () {
                $rootScope.LocateYourStore(position.coords.latitude + ',' + position.coords.longitude)
                    .then(function (result) {
                        $timeout(function () {
                            $scope.$apply(function () {
                                $scope.SelectedStore = result.toString();
                                $('#SelectedStore').val($scope.SelectedStore);
                            });
                        });
                    });
            });
            $rootScope.ShowLoader = false;
        }

        $scope.GetAutoTagAddress = function () {
            $rootScope.ShowLoader = true;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(getPlaces);
            }
        }

        function getPlaces(position) {
            $scope.register.AddressLongitude = position.coords.longitude.toString();
            $scope.register.AddressLatitude = position.coords.latitude.toString();
$http({
    method: 'GET',
    url: 'https://maps.googleapis.com/maps/api/geocode/json',
    params: {
        latlng: position.coords.latitude + "," + position.coords.longitude,
        key: rootUrl.GoogleAPIKey
    },
    headers: {
        'custom-xid-header': null
    }
}).then(function(response) {
    var r = response.data;
    $scope.$apply(function () {
        if (r && r.results && r.results[0]) {
            $scope.register.CustomerAddress = r.results[0].formatted_address;
            $scope.register.AddressLongitude = position.coords.longitude.toString();
            $scope.register.AddressLatitude = position.coords.latitude.toString();
        } else {
            $rootScope.ErrorMessage = "Couldn't find any address from the picked location.";
        }
        $rootScope.ShowLoader = false;
    });
}, function(error) {
    $rootScope.ShowLoader = false;
});

        }

        $scope.GetTagAddress = function () {
            if (!$scope.isGoogleMapContainer) {
                $scope.isGoogleMapContainer = true;
            }
            $timeout(function () {
                $(".googleMapContainer").show();
            });
        }

        $scope.SetAddress = function (position) {
            getPlaces(position);
        }

        $scope.PickStoreFromMap = function () {
            if (!$scope.isGoogleMapStoreContainer) {
                $scope.isGoogleMapStoreContainer = true;
            }
            $timeout(function () {
                $(".googleMapStoreContainer").show();
            });
        }

        $scope.SetBranchByMapper = function (map) {
            var selectedStore = $scope.Branches.find(x => parseFloat(x.Latitude) === map.position.lat() &&
                parseFloat(x.Longitude) === map.position.lng());

            if (selectedStore) {
                $timeout(function () {
                    $scope.$apply(function () {
                        $scope.SelectedStore = selectedStore.BranchIID.toString();
                    });
                });
            }
        }

        $scope.LoadPrivacyPolicy = function () {
            $scope.showPrivacyPolicy = true;
            $(".termsWindow").fadeIn();
        }

        $scope.HidePrivacyPolicy = function () {
            $scope.showPrivacyPolicy = false;
            $(".termsWindow").fadeOut();
        }

        $scope.GetTaggedAddressMap = function (Latitude, Longitude) {
            if ($scope.register.AddressLatitude) {
                Latitude = $scope.register.AddressLatitude;
                Longitude = $scope.register.AddressLongitude;
            }
            if (Latitude) {

                $timeout(function () {
                    angular.element(document.getElementById('addressGoogleMap')).scope()
                        .LocateTaggedAddress(Latitude, Longitude);
                    $(".googleMapContainer").show();
                });
            } else {
                $translate(['YOUDONTHAVEANYADDRESS']).then(function (translation) {
                    $rootScope.ErrorMessage = translation.YOUDONTHAVEANYADDRESS;
                    $(".error-msg").removeClass('showMsg');
                    $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                        $(this).removeClass('showMsg');
                        $(this).dequeue();
                    });

                });

            }

        }

        $scope.GetAreas = function (cityID) {
            return $q(function (resolve, reject) {
              $http({
                url: cityID
                  ? dataService + "/GetAreaByCityID?cityID=" + cityID
                  : dataService + "/GetAreaByCityID",
                method: "GET",
                headers: {
                  Accept: "application/json;charset=UTF-8",
                  "Content-type": "application/json; charset=utf-8",
                  CallContext: JSON.stringify(Context),
                },
              }).then(
                function (result) {
                  result = result.data;
                  $scope.Areas = result;
                  if ($scope.Areas.length > 0) {
                    $timeout(function () {
                      $scope.isAreaRequired = true;
                    });
                  } else {
                    $timeout(function () {
                      $scope.isAreaRequired = false;
                    });
                  }
                  resolve();
                },
                function (err) {
                  resolve();
                }
              );
            });
          };

        $scope.LoadPage = function (id, element) {
            $rootScope.GetStaticPage(id).then(function (content) {
                $(element).html(content);
            });
        }

        $scope.init();
    }]);