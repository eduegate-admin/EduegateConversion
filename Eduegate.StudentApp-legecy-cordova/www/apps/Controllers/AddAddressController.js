app.controller('AddAddressController', ['$scope', '$http', 'loggedIn', 'rootUrl',
    '$location', 'GetContext', 'serviceCartCount',
    '$state', '$stateParams', '$sce', '$rootScope', '$translate', '$timeout', '$q',
    function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount,
        $state, $stateParams, $sce, $rootScope, $translate, $timeout, $q) {
        var dataService = rootUrl.RootUrl;
        var Context = GetContext.Context();
        $scope.register = {};
        $scope.SiteID = Context.SiteID;
        $scope.redirectURL = $stateParams.redirectURL;
        $scope.AddressID = $stateParams.addressID;
        $scope.isSubmitted = false;
        $scope.DefaultDeliveryAddress = false;
        $scope.ShowDefaultDeliveryAddress = false;

        if ($scope.redirectURL && $scope.redirectURL.match("checkout")) {
            $scope.DefaultDeliveryAddress = true;
            $scope.ShowDefaultDeliveryAddress = true;
        }

        $scope.SaveForLaterCount = 0;
        $scope.ShoppingCartCount = 0;
        $scope.isFirstAddress = $stateParams.firstAddress === 'false';
        $scope.Address = { AreaID: "", IsShippingAddress: true };
        $scope.Countries = [];
        $scope.Cities = [];
        $scope.Areas = [];
        $scope.isAreaRequired = false;
        $scope.Address.AddressLine2 = "";

        $scope.init = function () {
            $rootScope.ShowLoader = true;

            $scope.GetShoppingCartCount();
            $scope.GetSaveForCartCount();

            // if ($rootScope.ClientSettings.StoreSelection ||
            //     $rootScope.ClientSettings.GeolocationMandatory) {
            //     $timeout(function () {
            //         $scope.GetTagAddress();
            //     }, 1000);
            // }
            
            $q.all([
                // $scope.GetAreas(),
                // $scope.GetLocations(null)
            ]).then(function () {
                if ($scope.AddressID) {
                    GetAddress();
                    $rootScope.ShowLoader = false;
                }
                else {
                    $scope.GetUserDetail();
                }
            });
        }

        function GetAddress() {
            return $q(function (resolve, reject) {
                $http({
                    url: dataService + "/GetAddressByContactID?addressID=" + $scope.AddressID,
                    method: 'GET',
                    headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
                }).then(function (result) {
                    result = result.data;
                    if (result.LocationID) {
                        result.LocationID = result.LocationID.toString();
                    }

                    $scope.Address = result;
                    resolve();
                }
                    , function (err) {
                        resolve();
                    });
            });
        }

        $scope.GetUserDetail = function () {
            $rootScope.ShowLoader = true;
            $http({
                method: 'GET',
                url: dataService + '/GetUserDetails',
                headers: {
                    "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context)
                }
            }).then(function (result) {
                result = result.data;
                $scope.Address.FirstName = result.Customer.FirstName;
                $scope.Address.LastName = result.Customer.LastName;
                $scope.Address.MobileNo1 = result.Customer.TelephoneNumber;
                $scope.Address.AddressLine1 = result.CustomerAddress;
                $scope.Address.AddressLine2 = result.CustomerAddress2;
                $scope.Address.BuildingNo = result.FlatNumber;
                $scope.Address.LocationID = result.LocationID;
                $scope.Address.AreaID = result.AreaID;
                $rootScope.ShowLoader = false;

            }, function (err) {
                $rootScope.ShowLoader = false;

            });
        }

        $scope.GetShoppingCartCount = function () {
            var cartPromise = serviceCartCount.getProductCount(Context, dataService);
            cartPromise.then(function (result) {
                $scope.ShoppingCartCount = result;
            }, function () {

            });
        }

        $scope.GetSaveForCartCount = function () {
            var loggedInPromise = loggedIn.CheckLogin(Context, dataService);

            loggedInPromise.then(function (model) {
                if (model && model.data) {
                    if (model.data.LoginID) {
                        $scope.LoggedIn = true;
                        var saveForLaterCountPromise = serviceCartCount.getSaveForLaterCount(Context, dataService);
                        saveForLaterCountPromise.then(function (result) {
                            $scope.SaveForLaterCount = result.data;
                        });
                    }
                }
            }, function () { });
        }

        $scope.OptionClick = function () {
            $('.rightnav-cont').toggle();
        }

        $scope.GetAreas = function (cityID) {
            return $q(function (resolve, reject) {
                $http({
                    url: cityID ? dataService + "/GetAreaByCityID?cityID=" + cityID : dataService + "/GetAreaByCityID",
                    method: 'GET',
                    headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
                }).then(function (result) {
                    result = result.data;
                    $scope.Areas = result;
                    if ($scope.Areas.length > 0) {
                        $scope.isAreaRequired = true;
                    }
                    else {
                        $scope.isAreaRequired = false;
                    }
                    resolve();
                }, function (err) {
                    resolve();
                })
            });
        }

        $scope.GetLocationsChangeEvent = function (areaID, event) {
            if (!event) return;
            $scope.GetLocations(areaID);
            $scope.Address.LocationID = "";
        }

        $scope.GetLocations = function (areaID) {
            return $q(function (resolve, reject) {
                $http({
                    url: areaID ? dataService + "/GetLocationByArea?areaID=" + areaID : dataService + "/GetLocationByArea",
                    method: 'GET',
                    headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },

                }).then(function (result) {
                    result = result.data;
                    $scope.Locations = result;
                    resolve();
                }, function (err) {
                    resolve();
                });
            });
        }

        $scope.GetCountries = function () {
            var url = dataService + '/GetCountries';

            $http({
                method: 'GET',
                url: url,
                headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) }
            }).then(function (results) {
                $scope.Countries = results;
            }, function (err) {

            });
        }

        $scope.CountryChange = function (countryID) {
            $scope.Cities = [];
            $scope.Areas = [];
            if (countryID != "" && countryID != undefined && countryID <= 10003) {
                $scope.GetCities(countryID);
            }
        }

        $scope.GetCities = function (countryID) {
            $http({
                url: dataService + "/GetCityByCountryID?countryID=" + countryID,
                method: 'GET',
                headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },

            }).then(function (result) {
                result = result.data;
                $scope.Cities = result;
            }, function (err) {

            });
        }

        $scope.CityChange = function (cityID) {
            if (cityID != "" && cityID != undefined) {
                $scope.GetAreas(cityID);
            }
            else {
                $scope.Areas = [];
            }
        }

        $scope.SaveAddress = function () {
            if ($rootScope.ShowLoader == false) {
                $rootScope.ShowLoader = true;
            }

            $rootScope.ErrorMessage = '';
            $rootScope.SuccessMessage = '';
            $scope.isSubmitted = true;

            if ($scope.addForm.$valid) {
                if ($scope.Address.CityID == "")
                    $scope.Address.CityID = null;

                if ($scope.Address.AreaID == "")
                    $scope.Address.AreaID = null;

                if ($stateParams.addressID) {
                    $scope.Address.ContactID = $stateParams.addressID;
                }

                $scope.Address.BranchID = $rootScope.StoreID ? $rootScope.StoreID.toString() 
                : Context.BranchID?.toString();
               
                $http({
                    url: dataService + "/OnlineStoreAddContact",
                    method: 'POST',
                    headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
                    data: $scope.Address,
                }).then(function (result) {
                    result = result.data;
                    if (result.operationResult && result.operationResult == 2) {
                        $rootScope.ShowToastMessage(result.Message, 'error');
                        
                        if ($rootScope.ShowLoader == true) {
                            $rootScope.ShowLoader = false;
                        }

                        return;
                    }

                    if (result != 0) {
                        if ($rootScope.ShowLoader == true) {
                            $rootScope.ShowLoader = false;
                        }

                        $rootScope.DeliveryAddress = result;
                        $rootScope.goBack();
                    }
                    else {
                        if ($rootScope.ShowLoader == true) {
                            $rootScope.ShowLoader = false;
                        }
                        $translate('PLEASETRYLATER').then(function (translation) {
                            $rootScope.ShowToastMessage(translation, 'error');
                        });
                    }

                }, function (err) {
                    if ($rootScope.ShowLoader == true) {
                        $rootScope.ShowLoader = false;
                    }
                    $translate('PLEASETRYLATER').then(function (translation) {
                        $rootScope.ShowToastMessage(translation, 'error');
                    });
                });
            }
            else {
                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }
            }
        }

        $scope.CancelAddAddress = function () {
            $rootScope.goBack();
        }

        $scope.GetCurrentLocation = function () {
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
            $rootScope.ContainsGeoLocationCheck(position.coords).then(function () {
                $scope.register.AddressLongitude = position.coords.longitude;
                $scope.register.AddressLatitude = position.coords.latitude;

               var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='
                    + position.coords.latitude + ',' + position.coords.longitude
                    + '&key=' + rootUrl.GoogleAPIKey;

                $http({
                    method: 'GET',
                    url: url,
                    headers: {
                        'custom-xid-header': null
                    }
                }).then(function (response) {
                    var r = response.data;

                    if (r && r.results[0]) {
                        $scope.Address.AddressLine1 = r.results[0].formatted_address;
                        $scope.register.AddressLongitude = position.coords.longitude;
                        $scope.register.AddressLatitude = position.coords.latitude;
                    }

                    $rootScope.ShowLoader = false;

                }, function (error) {
                    $rootScope.ShowLoader = false;
                });

            }, function () {
                $rootScope.ShowLoader = false;
            })
        }

        $scope.GetTagAddress = function () {
            $(".googleMapContainer").show();
        }


        $scope.SetAddress = function (position) {
            getPlaces(position);
            $rootScope.ShowLoader = false;
        }

        $scope.GetTaggedAddressMap = function (Latitude, Longitude) {
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


        $scope.init();
    }]);