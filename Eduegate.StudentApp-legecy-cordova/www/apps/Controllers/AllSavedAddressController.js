app.controller('AllSavedAddressController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', 'serviceCartCount', '$state', '$stateParams', '$sce', '$rootScope', '$translate', '$timeout','$q', function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount, $state, $stateParams, $sce, $rootScope, $translate, $timeout ,$q) {

    var dataService = rootUrl.RootUrl;
    var Context = GetContext.Context();
    $scope.redirectURL = $stateParams.redirectURL;
    $scope.IsMapClickable = false;
    $scope.SaveForLaterCount = 0;
    $scope.ShoppingCartCount = 0;
    $rootScope.ShowLoader = true;

    $scope.AddressList = [];
    $scope.UseThisAddress = true;
    $scope.register = {};
    $scope.Address = {};

    $scope.location = null;

    $scope.init = function () {
        if ($stateParams.redirectURL === "myaccount") {
            $scope.UseThisAddress = false;
        }

        if(Context.IsGuestUser) {
            $translate(['PLEASELOGINWITHNO']).then(function (translation) {
                $rootScope.ShowToastMessage(translation.PLEASELOGINWITHNO, 'error');
            });
            $state.go('login');
            $rootScope.ShowLoader = false;
            return;
        }

        $rootScope.ShowLoader = true;
        $scope.GetAddress();
        $scope.GetShoppingCartCount();
        $scope.GetSaveForCartCount();
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
                    //Loggedin User
                    $scope.LoggedIn = true;
                    var SaveForLaterCountPromise = serviceCartCount.getSaveForLaterCount(Context, dataService);
                    SaveForLaterCountPromise.then(function (result) {
                        $scope.SaveForLaterCount = result.data;
                    });
                }
            }
        }, function () { });
    }

    $scope.GetAddress = function () {
        $rootScope.ErrorMessage = '';
        $rootScope.SuccessMessage = '';
        if ($rootScope.ShowLoader == false) {
            $rootScope.ShowLoader = true;
        }
        $http({
            url: dataService + '/GetShippingAddressContacts',
            method: 'GET',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
        }).then(function (result) {
            result = result.data;
            $scope.AddressList = result;
            if ($rootScope.ShowLoader == true) {
                $rootScope.ShowLoader = false;
            }
        })
            , function (err) {
                //alert("Pl try later");
                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }
                $translate(['PLEASETRYLATER']).then(function (translation) {
                    $rootScope.VoucherError = translation.PLEASETRYLATER;
                });
                //$rootScope.ErrorMessage = 'Please try later';
            };
    }

    $translate(['MOBILENO1', 'MOBILENO2', 'AREA', 'LANDMARK', 'LOCATION', 'HouseBuildingNo']).then(function (translation) {
        $scope.mobileno1 = translation.MOBILENO1;
        $scope.mobileno2 = translation.MOBILENO2;
        $scope.area = translation.AREA;
        $scope.landmark = translation.LANDMARK;
        $scope.location = translation.LOCATION;
        $scope.HouseBuildingNo = translation.HouseBuildingNo;
    });

    $scope.SetAddress = function (Address) {
        var FinalAddress = "";
        if (Address != null && Address != undefined && Address != "") {
            if (Address.AddressLine1) {
                FinalAddress = FinalAddress.concat(Address.AddressLine1, " ");
            }
            
            if (Address.AddressLine) {
                FinalAddress = FinalAddress.concat('- ' + Address.AddressLine);
            }

            if (Address.AddressLine2) {
                FinalAddress = FinalAddress.concat('- ' + Address.AddressLine2);
            }

            if(FinalAddress) {
                FinalAddress = FinalAddress.concat("&lt;br&gt;");
            }

            if (Address.Areas) {
                if (Address.Areas.Value != undefined && Address.Areas.Value != "" && Address.Areas.Value != null) {
                    FinalAddress = FinalAddress.concat($scope.area, Address.Areas.Value, "&lt;br&gt;");
                }
            }
            if (Address.Location) {
                FinalAddress = FinalAddress.concat($scope.location, Address.Location, "&lt;br&gt;", );
            }
            if (Address.LandMark) {
                FinalAddress = FinalAddress.concat($scope.landmark, Address.LandMark, "&lt;br&gt;", );
            }
            if (Address.MobileNo1 != undefined && Address.MobileNo1 != "" && Address.MobileNo1 != null) {
                FinalAddress = FinalAddress.concat($scope.mobileno1, Address.MobileNo1, "&lt;br&gt;",);
            }
            if (Address.MobileNo2 != undefined && Address.MobileNo2 != "" && Address.MobileNo2 != null) {
                FinalAddress = FinalAddress.concat($scope.mobileno2, Address.MobileNo2, "&lt;br&gt;",);
            }
            // if (Address.Block != undefined && Address.Block != "" && Address.Block != null) {
            //     FinalAddress = FinalAddress.concat("Block : ", Address.Block, ",");
            // }
            // if (Address.Street != undefined && Address.Street != "" && Address.Street != null) {
            //     FinalAddress = FinalAddress.concat("Street : ", Address.Street, ",&lt;br&gt;");
            // }
            if (Address.BuildingNo != undefined && Address.BuildingNo != "" && Address.BuildingNo != null) {
                FinalAddress = FinalAddress.concat( $scope.HouseBuildingNo , Address.BuildingNo);
            }
            // if (Address.Flat != undefined && Address.Flat != "" && Address.Flat != null) {
            //     FinalAddress = FinalAddress.concat("Flat : ", Address.Flat, ",");
            // }
            // if (Address.Floor != undefined && Address.Floor != "" && Address.Floor != null) {
            //     FinalAddress = FinalAddress.concat("Floor : ", Address.Floor, ",&lt;br&gt;");
            // }
            // if (Address.Avenue != undefined && Address.Avenue != "" && Address.Avenue != null) {
            //     FinalAddress = FinalAddress.concat("Jadda/Avenue : ", Address.Avenue, ",&lt;br&gt;");
            // }
            // if (Address.District != undefined && Address.District != "" && Address.District != null) {
            //     FinalAddress = FinalAddress.concat("District : ", Address.District, ",&lt;br&gt;");
            // }

            // if (Address.IntlArea != undefined && Address.IntlArea != "" && Address.IntlArea != null) {
            //     FinalAddress = FinalAddress.concat(Address.IntlArea, ",");
            // }
            // if (Address.City != undefined && Address.City != "" && Address.City != null) {
            //     FinalAddress = FinalAddress.concat(Address.City, ",");
            // }
            // if (Address.IntlCity != undefined && Address.IntlCity != "" && Address.IntlCity != null) {
            //     FinalAddress = FinalAddress.concat(Address.IntlCity, ",");
            // }
            return $scope.SkipValidation(FinalAddress);
        }
        return "";


    }

    $scope.SkipValidation = function (value) {
        if (value) {
            return $sce.trustAsHtml(jQuery.parseHTML(value)[0].textContent)
        }
    };

    $scope.PreviousClick = function () {
        //   if ($scope.redirectURL.match("checkout")) {
        //       $state.go($scope.redirectURL, { DeliveryAddress: null, ShowAddressView: true });
        //   }
        $rootScope.goBack();
    }

    $scope.OptionClick = function () {
        $('.rightnav-cont').toggle();
    }

    $scope.EditAddress = function (contactID) {
        $state.go('addaddress', { addressID: contactID, redirectURL: "allsavedaddress" });
    }

    $scope.SelectAddress = function (address) {
        UpdateAddressShoppingCart(address).then(function(){
            $state.go($scope.redirectURL, { ShowAddressView: true, DeliveryAddress: address.ContactID });
        } );
    }

    function UpdateAddressShoppingCart(address) {
        return $q(function (resolve, reject) {
            var data = {
            "Branch" : address.BranchID,
            "BranchID" : address.BranchID,
            "IsCartLevelBranch": true,
            "ContactID" : address.ContactID,
            "SelectedShippingAddress" : address.ContactID
            };

            $rootScope.ShowLoader = true;

            $http({
                url: dataService + '/UpdateAddressinShoppingCart',
                method: 'POST',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(Context)
                },
                data: data,
            }).then(function (result) {
                result = result.data;
                $rootScope.StoreID = address.BranchID;
                $rootScope.UpdateContext({"BranchID" : address.BranchID});
                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }

                if (result.operationResult == 1) {
                    $rootScope.StoreID = $scope.DefaultStore;

                    resolve();
                    return;
                }
                else {
                    $rootScope.ShowToastMessage(result.Message);
                    reject(result);
                    return;
                }

            }, function (err) {
                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }
                reject();
            });
        });
    }

    $scope.DeleteAddress = function (contactID) {
        $rootScope.ErrorMessage = '';
        $rootScope.SuccessMessage = '';
        if ($rootScope.ShowLoader == false) {
            $rootScope.ShowLoader = true;
        }
        $http({
            url: dataService + "/RemoveContact?contactID=" + contactID,
            method: 'GET',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) }        }).then(function (result) {
            result = result.data;
            if (result.operationResult == 1) {
                //alert(result.Message);
                for (var i = 0; i < $scope.AddressList.length; i++) {
                    if ($scope.AddressList[i].ContactID == contactID) {
                        $scope.AddressList.splice(i, 1);
                        break;
                    }
                }
                $rootScope.SuccessMessage = result.Message;
                $(".success-msg").removeClass('showMsg');
                $(".success-msg").addClass('showMsg').delay(2000).queue(function () {
                    $(this).removeClass('showMsg');
                    $(this).dequeue();
                });
            }
            else {
                //alert(result.Message);
                $rootScope.ErrorMessage = result.Message;
                $(".error-msg").removeClass('showMsg');
                $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                    $(this).removeClass('showMsg');
                    $(this).dequeue();
                });

            }
            if ($rootScope.ShowLoader == true) {
                $rootScope.ShowLoader = false;
            }
        })
            , function (err) {
                //alert("Pl try later")
                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }
                $translate(['PLEASETRYLATER']).then(function (translation) {
                    $rootScope.VoucherError = translation.PLEASETRYLATER;
                });
                //$rootScope.ErrorMessage = 'Please try later';
            };
    }

    $scope.AddAddress = function () {
        $state.go("addaddress", { redirectURL: "allsavedaddress", firstAddress: false });
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