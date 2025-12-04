app.controller('CustomerSearchController', ['$scope', '$http', 'loggedIn', 'rootUrl', 
'$location', 'GetContext', 'serviceCartCount', '$state', '$stateParams', '$sce', '$rootScope', 
function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount, $state, 
    $stateParams, $sce, $rootScope) {
    var dataService = rootUrl.RootUrl;
    var Context = GetContext.Context();
    $scope.SearchText = '';
    $scope.PageNos = 1;
    $scope.PageSize = 50;
    $scope.Customers = [];

    $scope.CloseCustomerSearch = function () {
        $('.cart-header').show();
        $('.productlisting').show();
        $(".filtersection").hide();
    }

    $scope.SelectCustomer = function (customer) {
        $scope.ChangeCustomer(customer);
        $scope.CloseCustomerSearch();
    }

    $scope.init = function () {
        $scope.SearchCustomer();   
    }
  
    $scope.SearchCustomer = function() {
        $http({
            url: dataService + "/GetCustomers?searchText=" + $scope.SearchText
            + '&pageNos=' + $scope.PageNos + '&pageSize' + $scope.PageSize ,
            method: 'GET',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
        })
            .then(function (result) {
                $scope.Customers = result.data;
            })
            , function (err) {

                $scope.isLoaded = true;
                $scope.totalCount += 1;
            };
    }
    
    //$scope.init();
  }]);