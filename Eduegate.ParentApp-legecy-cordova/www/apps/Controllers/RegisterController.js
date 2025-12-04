app.controller('RegisterController', ['$scope', '$http', 'rootUrl', /*'serviceCartCount',*/ 'GetContext', '$rootScope', function ($scope, $http, rootUrl, /*serviceCartCount,*/ GetContext, $rootScope) {
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
    var Context = GetContext.Context();
    $scope.ShoppingCartCount = 0;
    $scope.init = function () {
        $scope.GetKnowHowOption();
        $rootScope.ShowLoader = true;
        $scope.GetCountries();
        $scope.GetShoppingCartCount();
    }
    $scope.OptionClick = function () {
        $('.rightnav-cont').toggle();
    }

    $scope.GetShoppingCartCount = function () {
        //var cartPromise = serviceCartCount.getProductCount(Context, rootUrl.RootUrl);
        //cartPromise.then(function (result) {
        //    $scope.ShoppingCartCount = result.data;
        //});

    }

    $scope.GetKnowHowOption = function () {
        var url = rootUrl.RootUrl + '/GetKnowHowOptions';
        //$http.get(url).then(function (results) {
        //    $scope.KnowHowOptions = results.data;
        //});
        $http({
            method: 'GET',
            url: url,
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) }
        }).success(function (results) {
            $scope.KnowHowOptions = results;
            //$rootScope.ShowLoader = false;
        }).error(function (err) {
            //$rootScope.ShowLoader = false;
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
        }).success(function (results) {
            $scope.Countries = results;
            $rootScope.ShowLoader = false;
        }).error(function (err) {
            $rootScope.ShowLoader = false;
        });

        //$http.get(url).then(function (results) {
        //    $scope.Countries = results.data;
        //    $rootScope.ShowLoader = false;
        //});
    }

    $scope.SignUp = function () {
        if ($scope.register.Customer.HowKnowOptionID == '') {
            $scope.register.Customer.HowKnowOptionID = null;
        }
        $rootScope.ShowLoader = true;
        $scope.Message = "";
        $scope.submitted = true;
        $rootScope.ErrorMessage = '';
        $rootScope.SuccessMessage = '';
        if ($scope.registerForm.$valid) {

            $http({
                method: 'POST',
                url: dataService + '/Register',
                data: $scope.register,
                headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) }
            }).success(function (result) {
                if (result.operationResult == 2) {
                    //$("#spnMessage").css("color", "Red");
                    $rootScope.ErrorMessage = result.Message;
                }
                else if (result.operationResult == 1) {
                    //$("#spnMessage").css("color", "Green");
                    $rootScope.SuccessMessage = result.Message;
                }
                $rootScope.ShowLoader = false;
                //$scope.Message = result.Message;
            }).error(function (err) {
                $rootScope.ErrorMessage = "Please try later";
                $rootScope.ShowLoader = false;
            });
        }
        else { $rootScope.ShowLoader = false; }
    }

    $scope.init();

}]);