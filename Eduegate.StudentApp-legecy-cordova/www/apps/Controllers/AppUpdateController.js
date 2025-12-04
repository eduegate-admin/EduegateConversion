app.controller('AppUpdateController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', 'serviceCartCount', '$state', '$stateParams', '$sce', '$rootScope','serviceAddToCart', function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount, $state, $stateParams, $sce, $rootScope, serviceAddToCart) {
    var context = GetContext.Context();
    var appDataUrl = rootUrl.RootUrl;
    var dataService = rootUrl.SchoolServiceUrl;


    $scope.ClientAppDownloadLink = '';


    $scope.init = function() {
        $scope.GetSettingValues();
        if (device.platform.toLowerCase() == "android") {
            $scope.IsAndroidDevice = true;
        }
        else{
            $scope.IsAndroidDevice = false;

        }

        $http({
            url: dataService + '/CheckAppVersion?currentAppVersion='
                    + rootUrl.CurrentAppVersion + "&appID="
                    + (rootUrl.AppID ? rootUrl.AppID : ''),
            method: 'GET',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(context) },
        }).then(function (result) {
            checkVersionPromise = null;
            result = result.data;
            $rootScope.IsForceAppUpdate = result.IsMajor;

            if(result.RedirectUrl){
                $rootScope.RedirectUrlForAppUpdate = result.RedirectUrl;
            }
            else {
                $rootScope.IsForceAppUpdate = false;
            }

        }, function (err) {
            checkVersionPromise = null;
        });

    }

    $scope.GetSettingValues = function () {
        $http({
            method: 'GET',
            url: appDataUrl + '/GetSettingValueByKey?settingKey=' + 'STUDENT_CLIENT_APPSTORELINK',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {

            $scope.ClientAppstoreLink = result;
        }).error(function () {
        });

        $http({
            method: 'GET',
            url: appDataUrl + '/GetSettingValueByKey?settingKey=' + 'CLIENT_APPSTORELOGO',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {

            $scope.ClientAppstoreLogo = result;
        }).error(function () {
        });

        $http({
            method: 'GET',
            url: appDataUrl + '/GetSettingValueByKey?settingKey=' + 'STUDENT_CLIENT_PLAYSTORELINK',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {

            $scope.ClientPlaystoreLink = result;
        }).error(function () {
        });

        $http({
            method: 'GET',
            url: appDataUrl + '/GetSettingValueByKey?settingKey=' + 'CLIENT_PLAYSTORELOGO',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {

            $scope.ClientPlaystoreLogo = result;
        }).error(function () {
        });
    }


  $scope.ClickAppDownloadLink = function () {
        if (device.platform.toLowerCase() == "android") {
            $scope.ClientAppDownloadLink = $scope.ClientPlaystoreLink;
            $scope.IsAndroidDevice = true;
        }
        else{
            $scope.ClientAppDownloadLink = $scope.ClientAppstoreLink;
            $scope.IsAndroidDevice = false;

        }
        window.open($scope.ClientAppDownloadLink, '_system');
  }


    if(rootUrl.CurrentAppVersion) {
        $scope.init();
    }
    else{
        $rootScope.IsForceAppUpdate = false;
    }
  }]);