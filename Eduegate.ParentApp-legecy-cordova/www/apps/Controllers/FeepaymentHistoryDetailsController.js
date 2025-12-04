app.controller('FeepaymentHistoryDetailsController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', '$timeout', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
    console.log('FeepaymentHistoryDetailsController loaded.');

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();

    $scope.TransactionNumber = $stateParams.transactionNumber;

    $scope.init = function () {
        $rootScope.ShowPreLoader = true;
        $rootScope.ShowLoader = true;

        $scope.GetCollectionDetails();
    }

    $scope.GetCollectionDetails = function () {

        $scope.FeeCollectionDetails= [];

        $http({
            method: 'GET',
            url: dataService + '/GetFeeCollectionDetailsByTransactionNumber?transactionNumber=' + $scope.TransactionNumber,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {

            $scope.FeeCollectionDetails = result;

            $rootScope.ShowPreLoader = false;
            $rootScope.ShowLoader = false;
        }).error(function () {
            $rootScope.ShowPreLoader = false;
            $rootScope.ShowLoader = false;
        });
    }
 
}]);