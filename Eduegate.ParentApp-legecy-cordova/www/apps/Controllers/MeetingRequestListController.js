app.controller('MeetingRequestListController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', 'serviceCartCount', '$state', '$stateParams', '$sce', '$rootScope', 'serviceAddToCart', '$q', "$translate", '$timeout', function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount, $state, $stateParams, $sce, $rootScope, serviceAddToCart, $q, $translate, $timeout) {
    var context = GetContext.Context();
    var appDataUrl = rootUrl.RootUrl;
    var dataService = rootUrl.SchoolServiceUrl;
    $scope.ContentService = rootUrl.ContentServiceUrl;
    $scope.showIcons = false;
    $rootScope.ShowLoader = true;



    $scope.AllTicketDetails = [];
    $scope.TicketCount = 0;

    $scope.ShowPreLoader = true;

    $scope.init = function () {

        $scope.GetMeetingRequestsByParentID();
    };

    $scope.GetMeetingRequestsByParentID = function () {

        $http({
            url:
                dataService + "/GetMeetingRequestsByParentID",
            method: "GET",
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            },
        }).then(function (result) {
            if (result) {
                $scope.MeetingRequests = result.data
                $rootScope.ShowLoader = false;

            }
        });
    };

    $scope.NewRequestButtonClick = function () {
        $state.go("meetingrequest");
    };

}]);