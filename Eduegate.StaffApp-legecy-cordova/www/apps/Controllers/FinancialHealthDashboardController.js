app.controller('FinancialHealthDashboardController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', '$state', '$stateParams', '$sce', '$rootScope', function ($scope, $http, loggedIn, rootUrl, $location, GetContext, $state, $stateParams, $sce, $rootScope) {
  var dataService = rootUrl.SchoolServiceUrl;
  $scope.ContentService = rootUrl.ContentServiceUrl;
  var rootUrl = rootUrl.RootUrl;
  var securityService = rootUrl.SecurityServiceUrl;
  var context = GetContext.Context();
  
  $rootScope.UserName = context.EmailID;
  $scope.NewAssignmentCount = 0;
  $scope.MyClassCount = 0;
  $scope.LessonPlanCount = 0;
  $scope.NotificationCount = 0;
  $rootScope.BoilerPlates = [];
  $rootScope.HomeBanners = [];
  var pageInfoPromise = null;
  $rootScope.UserDetails = null;
  $rootScope.Driver = false;
  $scope.Teacher = false;
  $rootScope.Admin = false;
  $rootScope.Director = false;
  $rootScope.UserClaimSets = context.UserClaimSets;
  $scope.attendanceCardSpinner = true;

  if ($rootScope.UserClaimSets.some(code => code.Value === 'Driver')) {
    $rootScope.Driver = true;
      localStorage.setItem("isDriver", "true"); // Set when user logs in as a driver
  }
  if ($rootScope.UserClaimSets.some(code => code.Value === 'Class Teacher')) {
    $scope.Teacher = true;
    localStorage.setItem("isDriver", "false"); // Set when user logs in other than driver

  }
  if ($rootScope.UserClaimSets.some(code => code.Value === 'Super Admin')) {
    $rootScope.Admin = true;
    localStorage.setItem("isDriver", "false"); // Set when user logs in other than driver

  }
  if ($rootScope.UserClaimSets.some(code => code.Value === 'Director')) {
    $rootScope.Director = true;
    $rootScope.Admin = true;
    localStorage.setItem("isDriver", "false"); // Set when user logs in other than driver

  }

  $scope.init = function () {
    $scope.LoadProfileInfo();
    $scope.getPageInfo();
  };

  $scope.getPageInfo = function () {
    if (pageInfoPromise) {
      if (pageInfoPromise.reject) {
        pageInfoPromise.reject("Aborted");
      }
    }

    pageInfoPromise = $http({
      url: rootUrl + '/GetPageInfo?pageID=102&parameter=',
      method: 'GET',
      headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(context) },
    }).then(function (result) {
      pageInfoPromise = null;
      result = result.data;
      $rootScope.LoadingMessage = "";
      if (result != undefined && result != null && result.BoilerPlates != undefined && result.BoilerPlates != null) {
        $rootScope.BoilerPlates = result.BoilerPlates;
        $rootScope.ShowLoader = false;
      }
      else {
        $rootScope.ShowLoader = false;
      }
    }, function (err) {
      pageInfoPromise = null;
      // $scope.getPageInfo();
    });

  };





  $scope.LoadProfileInfo = function () {

    $http({
      method: 'GET',
      url: dataService + '/GetStaffProfile',
      headers: {
        "Accept": "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        "CallContext": JSON.stringify(context)
      }
    }).success(function (result) {
      $scope.Profile = result;

      if ($scope.Profile == null) {
        $scope.onProfileFilling = false;
      }

    }).error(function (err) {
    });

  }





  $scope.init();

}]);