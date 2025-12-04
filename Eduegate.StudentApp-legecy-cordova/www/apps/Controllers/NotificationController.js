app.controller("NotificationController", ["$scope", "$http", "$state", "rootUrl", "$location", "$rootScope", "$stateParams", "GetContext", "$sce", "$timeout", function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
  console.log("Notification controller loaded.");

  var dataService = rootUrl.SchoolServiceUrl;
  var context = GetContext.Context();

  $scope.MailBoxes = [];

  $rootScope.ShowLoader = true;

  $scope.init = function() {
    $scope.GetMyNotifications();
  }

  $scope.GetMyNotifications = function(){
    $http({
        method: 'GET',
        url: dataService + '/GetMyNotification',
        data: $scope.user,
        headers: { 
            "Accept": "application/json;charset=UTF-8", 
            "Content-type": "application/json; charset=utf-8", 
            "CallContext": JSON.stringify(context) 
        }
    }).success(function (result) {
        $scope.MailBoxes = result;
        $scope.NotificationCounts = $scope.MailBoxes.length;

        $rootScope.ShowLoader = false;
    })
    .error(function(){
        $rootScope.ShowLoader = false;
    });
  }


$scope.MarkAsRead = function(requestedID){
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
      $timeout(function () {
        $scope.$apply(function () {
          $scope.GetMyNotifications();
        });
      }, 1000);
    }
  }).error(function (err) {
    $rootScope.ErrorMessage = "Please try later";
    $scope.Message = "Please try later";
    $rootScope.ShowButtonLoader = false;
  });
}

  // $scope.init();
}]);
