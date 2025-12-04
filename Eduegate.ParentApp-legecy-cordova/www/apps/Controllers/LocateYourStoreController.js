app.controller('LocateYourStoreController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'serviceCartCount', 'GetContext', 'loggedIn', '$rootScope', 'mySharedService', '$timeout', '$translate',
    function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, serviceCartCount, GetContext, loggedIn, $rootScope, mySharedService, $timeout, $translate) {
        console.log('LocateYourStoreController loaded.');
        var dataService = rootUrl.RootUrl;
        var Context = GetContext.Context();
        $scope.Branches = [];
        $scope.SelectedStore = "";
        $scope.redirectUrl = $stateParams.redirectUrl;

        $scope.init = function () {

            $rootScope.ShowLoader = true;
            $translate(['GETTINGYOURDEFAULTSTORE']).then(function (translation) {
                $rootScope.LoadingMessage = translation.GETTINGYOURDEFAULTSTORE;
            });
            //$rootScope.LoadingMessage = 'Geting your default store!!';
            $scope.GetBranches();
        }

        $scope.GetUserDetail = function () {
            $http({
                method: 'GET',
                url: dataService + '/GetUserDetails',
                headers: {
                    "Accept": "application/json;charset=UTF-8", 
                    "Content-type": "application/json; charset=utf-8", 
                    "CallContext": JSON.stringify(Context)
                }
            }).then(function (result) {
                result = result.data;
                $scope.SelectedStore = result.Branch ? result.Branch.BranchIID.toString() : null;
                $rootScope.LoadingMessage = '';
                $rootScope.ShowLoader = false;
            }, function (err) {
                $rootScope.ShowLoader = false;
            });
        }

        $scope.BranchChange = function (value) {
            $scope.SelectedStore = value;
        }

        $scope.SetBranchByMapper = function (map) {
            var selectedStore = $scope.Branches.find(x => parseFloat(x.Latitude) == map.position.lat() &&
            parseFloat(x.Longitude) == map.position.lng());

            if (selectedStore) {
                $timeout(function () {
                    $scope.$apply(function () {
                        $scope.SelectedStore = selectedStore.BranchIID.toString();
                    });
                });
            }
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
                $scope.GetUserDetail();
            }, function (err) {
            });
        }

        $scope.PickStoreFromMap = function () {
            if (!$scope.isGoogleMapStoreContainer) {
                $scope.isGoogleMapStoreContainer = true;
            }
            $timeout(function () {
                $(".googleMapStoreContainer").show();
            });
        }


        $scope.GetNearestBranch = function () {
            $rootScope.ShowLoader = true;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(setCurrentLocation);
            }
        }

        function setCurrentLocation(position) {
            $rootScope.LocateYourStore(position.coords.latitude + ',' + position.coords.longitude)
                .then(function (result) {
                    $timeout(function () {
                        $scope.$apply(function () {
                            $scope.SelectedStore = result.toString();
                            $('#SelectedStore').val($scope.SelectedStore);
                        });
                    });
                });
            $rootScope.ShowLoader = false;
        }

        $scope.Save = function () {
            $rootScope.ShowLoader = true;
            $http({
                method: 'GET',
                url: dataService + '/UpdateUserDefaultBranch?branchID=' + $scope.SelectedStore,
                headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) }
            }).then(function (result) {
                result = result.data;
                //reset the stores
                $rootScope.StoreID = $scope.SelectedStore;
                $rootScope.UpdateContext({"BranchID" : $scope.SelectedStore});

                $translate(['Changedyourdefaultstoreto']).then(function (translation) {
                    $scope.Changedyourdefaultstoreto = translation.Changedyourdefaultstoreto;

                    $rootScope.SuccessMessage = $scope.Changedyourdefaultstoreto + $('#SelectedStore option:selected').text() + "!!";
                    $(".success-msg").removeClass('showMsg');
                    $(".success-msg").addClass('showMsg').delay(2000).queue(function () {
                        $(this).removeClass('showMsg');
                        $(this).dequeue();
                    });
                });

                $rootScope.ShowLoader = false;
                $rootScope.StoreID = $scope.SelectedStore;

                if ($scope.redirectUrl) {
                    $state.go($scope.redirectUrl, null, { reload: true });
                }
                else {
                    $state.go('home', null, { reload: true });
                }
                $rootScope.ShowLoader = false;
            }, function (err) {
                $translate(['PLEASETRYLATER']).then(function (translation) {
                    $rootScope.VoucherError = translation.PLEASETRYLATER;
                });
                //$rootScope.ErrorMessage = "Please try later";
                $rootScope.ShowLoader = false;
            });
        }

        $rootScope.storeList = function (BranchIID) {
            $scope.SelectedStore = BranchIID.toString();
            $(".googleMapStoreContainer").hide();
        }

        $scope.init();
    }]);