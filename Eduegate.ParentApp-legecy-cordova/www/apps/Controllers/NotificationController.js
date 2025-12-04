app.controller("NotificationController", ["$scope", "$http", "$state", "rootUrl", "$location", "$rootScope", "$stateParams", "GetContext", "$sce", "$timeout", function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
  console.log("Notification controller loaded.");

  var dataService = rootUrl.SchoolServiceUrl;
  var context = GetContext.Context();


    $scope.MailBoxes = [];
    $scope.page = 1;
    $scope.pageSize = 20;
    $scope.loading = false; // 👈 Prevent duplicate API calls
    $scope.noMoreData = false; // 👈 Optional: Stop calling when all data loaded

    $scope.init = function () {
        if ($scope.loading || $scope.noMoreData) return;

        $scope.loading = true;
        $rootScope.ShowLoader = true;

        $http({
            method: 'GET',
            url: `${dataService}/GetMyNotification?page=${$scope.page}&pageSize=${$scope.pageSize}`,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            if (result && result.length > 0) {
                $scope.MailBoxes = $scope.MailBoxes.concat(result);
                $scope.page++;
                if (result.length < $scope.pageSize) {
                    $scope.noMoreData = true; // 👈 No more data available
                }
            } else {
                $scope.noMoreData = true; // 👈 No data returned
            }
            $scope.loading = false;
            $rootScope.ShowLoader = false;
        }).error(function () {
            $scope.loading = false;
            $rootScope.ShowLoader = false;
        });
    };

    angular.element(document).ready(function () {
        var container = document.getElementById('mailbox-container');

        if (container) {
            container.addEventListener('scroll', function () {
                if (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
                    $scope.$applyAsync(function () {
                        $scope.init(); // 👈 Will be blocked if already loading
                    });
                }
            });
        }

        // Initial load
        $scope.init();
    });



$scope.MarkAsRead = function(requestedID) {
  var IID = requestedID == undefined || requestedID == null ? 0 : requestedID;

  $http({
    method: "POST",
    url: dataService + "/MarkNotificationAsRead?notificationAlertID=" + IID,
    headers: {
      Accept: "application/json;charset=UTF-8",
      "Content-type": "application/json; charset=utf-8",
      CallContext: JSON.stringify(context),
    },
  }).success(function (result) {
    if (result) {
      // reset paging and reload
      $scope.page = 1;
      $scope.noMoreData = false;
      $scope.MailBoxes = [];

      $timeout(function () {
        $scope.init();   // 👈 reload notifications
      }, 300);
    }
  }).error(function (err) {
    $rootScope.ErrorMessage = "Please try later";
    $scope.Message = "Please try later";
    $rootScope.ShowButtonLoader = false;
  });
};


  // $scope.init();
}]);
