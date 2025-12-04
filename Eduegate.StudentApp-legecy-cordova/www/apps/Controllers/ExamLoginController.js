app.controller("ExamLoginController", [
  "$scope",
  "$http",
  "rootUrl",
  "$location",
  "GetContext",
  "$state",
  "$stateParams",
  "$rootScope",
  "loggedIn",
  "$q",
  "serviceAddToCart",
  "serviceCartCount",
  "$compile",
  "$sce",
  function (
    $scope,
    $http,
    rootUrl,
    $location,
    GetContext,
    $state,
    $stateParams,
    $rootScope,
    loggedIn,
    $q,
    serviceAddToCart,
    serviceCartCount,
    $compile,
    $sce
  ) {
    var sercurityService = rootUrl.SecurityServiceUrl;
    $scope.redirectUrl = $stateParams.redirectUrl;
    var userDataService = rootUrl.UserServiceUrl;

 

    $scope.LoginType = "userid";
    $scope.Message = "";
    $scope.submitted = false;
    $scope.user = {};

    $scope.init = function () {
      $rootScope.ShowLoader = false;
      $rootScope.ShowButtonLoader = false;
    };

    $scope.SignIn = function () {
      $rootScope.ShowButtonLoader = true;
      $scope.submitted = true;
      $rootScope.ErrorMessage = "";
      $rootScope.SuccessMessage = "";
      $scope.Message = "";

      if ($scope.loginForm.$valid) {
        $http({
          method: "POST",
          url: sercurityService + "/StudentExamLogin",
          data: {
            UserName: $scope.user.LoginEmailID,
            Password: $scope.user.Password,
          },
          headers: {
            Accept: "application/json;charset=UTF-8",
            "Content-type": "application/json; charset=utf-8",
            CallContext: null,
          },
        })
          .success(function (result) {
            if (result.operationResult == 2) {
              $rootScope.ErrorMessage = result.Message;
              $rootScope.ShowButtonLoader = false;
              $scope.Message = result.Message;
            } else if (result.operationResult == 1) {
              $state.go("studentexamsdashboard", { candidateID: result.Candidate.CandidateIID });
            }
          })
          .error(function (err) {
            $rootScope.ErrorMessage = "Please try later";
            $scope.Message = "Please try later";
            $rootScope.ShowButtonLoader = false;
          });
      } else {
        $rootScope.ShowButtonLoader = false;
      }
    };

    $scope.myFunction = function () {
      var password = document.getElementById("password");
      if (password.type === "password") {
        password.type = "text";
      } else {
        password.type = "password";
      }
    };

    $scope.ChangeClick = function () {
      $scope.Message = "";
    };

    $scope.init();
  },
]);
