app.controller("ResetPasswordController", ["$scope", "$http", "rootUrl", "$location", "GetContext", "$state", "$stateParams", "$rootScope", "loggedIn", "$q", function ($scope, $http, rootUrl, $location, GetContext, $state, $stateParams, $rootScope, loggedIn, $q) {
  //console.log('Reset Password Controller loaded.');

  var sercurityService = rootUrl.SecurityServiceUrl;

  $rootScope.ErrorMessage = "";
  $rootScope.SuccessMessage = "";
  $scope.Message = "";

  $scope.User = {};
  $scope.PasswordResetModel = null;
  var context = GetContext.Context();

  $scope.init = function () {
    $rootScope.ShowLoader = false;
  };

  $scope.OTPGenerate = function () {
    $rootScope.ShowLoader = true;

    $rootScope.ErrorMessage = "";
    $rootScope.SuccessMessage = "";
    $scope.Message = "";

    $scope.EmailID = $("#email").val();

    if ($scope.EmailID == undefined || $scope.EmailID == "") {
      $rootScope.ErrorMessage = "Email is required";
      $rootScope.ShowLoader = false;
      return false;
    }
    else {
      var emaillength = $scope.EmailID.length;
      var emailshort = $scope.EmailID.substring(0, 2) + "*****" + $scope.EmailID.substring(emaillength / 2, (emaillength / 2) + 3) + "***" + $scope.EmailID.substring(emaillength - 3, emaillength);
    }

    if ($scope.resetForm_Step1.$valid) {

      $http({
        method: 'GET',
        url: sercurityService + '/ResetPasswordOTPGenerate?emailID=' + $scope.EmailID,
        headers: {
          "Accept": "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          "CallContext": JSON.stringify(context)
        },
      }).success(function (result) {
        if (result.operationResult == 2) {

          $rootScope.ErrorMessage = result.Message;
          $rootScope.ShowLoader = false;

        } else if (result.operationResult == 1) {

          $scope.SuccessMessage = "OTP has been sent to " + emailshort;

          var form1 = document.getElementById("resetForm_Step1");

          var form2 = document.getElementById("resetForm_Step2");

          if (form1.style.display === "none") {
            form1.style.display = "block";
          } else {
            form1.style.display = "none";
          }

          if (form2.style.display === "none") {
            form2.style.display = "block";
          } else {
            form2.style.display = "none";
          }

          $rootScope.ShowLoader = false;

        }
      }).error(function (err) {
        $rootScope.ErrorMessage = "Something went wrong, please try again later!";
        $rootScope.ShowLoader = false;
        return false;
      });
    }
    else {
      $rootScope.ErrorMessage = "Enter a valid email";
      $scope.Message = "Enter a valid email";
      $rootScope.ShowLoader = false;
      return false;
    }

  };

  var isOTPverify = false;
  $scope.VerifyOTP = function () {
    $rootScope.ShowLoader = true;

    var OTP = $("#OTP").val();

    if (OTP == undefined || OTP == "") {
      $rootScope.ErrorMessage = "OTP is required";
      $rootScope.ShowLoader = false;
      return false;
    }

    if ($scope.resetForm_Step2.$valid) {

      $http({
        method: 'GET',
        url: sercurityService + '/ResetPasswordVerifyOTP?OTP=' + OTP + "&email=" + $scope.EmailID,
        headers: {
          "Accept": "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          "CallContext": JSON.stringify(context)
        },
      }).success(function (result) {
        if (result.operationResult == 2) {

          $rootScope.ErrorMessage = result.Message;
          $rootScope.ShowLoader = false;

        } else if (result.operationResult == 1) {

          var form2 = document.getElementById("resetForm_Step2");

          var form3 = document.getElementById("resetForm_Step3");

          if (form2.style.display === "none") {
            form2.style.display = "block";
          } else {
            form2.style.display = "none";
          }

          if (form3.style.display === "none") {
            form3.style.display = "block";
          } else {
            form3.style.display = "none";
          }

          $rootScope.ShowLoader = false;
        }
      }).error(function (err) {
        $rootScope.ErrorMessage = "Something went wrong, please try again later!";
        $rootScope.ShowLoader = false;
        return false;
      });
    }
    else {
      $rootScope.ErrorMessage = "Enter a valid email";
      $scope.Message = "Enter a valid email";
      $rootScope.ShowLoader = false;
      return false;
    }

  };

  $scope.SubmitChangePassword = function () {
    $rootScope.ShowLoader = true;

    $rootScope.ErrorMessage = "";
    $rootScope.SuccessMessage = "";
    $scope.Message = "";

    var passWord = $("#newPassword").val();
    var confirmPassWord = $("#confirmPassword").val();

    if (passWord == undefined || passWord == "") {
      $rootScope.ErrorMessage = "Password is required";
      $rootScope.ShowLoader = false;
      return false;
    }
    else if (confirmPassWord == undefined || confirmPassWord == "") {
      $rootScope.ErrorMessage = "Confirm password is required";
      $rootScope.ShowLoader = false;
      return false;
    }
    else if (passWord != confirmPassWord) {
      $rootScope.ErrorMessage = "The password and confirmation password do not match";
      $rootScope.ShowLoader = false;
      return false;
    }

    if ($scope.resetForm_Step3.$valid) {

      $http({
        method: 'GET',
        url: sercurityService + '/SubmitPasswordChange?email=' + $scope.EmailID + "&password=" + passWord,
        headers: {
          "Accept": "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          "CallContext": JSON.stringify(context)
        },
      }).success(function (result) {
        if (result.operationResult == 2) {

          $rootScope.ErrorMessage = result.Message;
          $rootScope.ShowLoader = false;

        } else if (result.operationResult == 1) {

          $scope.Message = result.Message;

          var form3 = document.getElementById("resetForm_Step3");

          var confirmForm = document.getElementById("resetForm_Confirm");

          form3.style.display = "none";

          confirmForm.style.display = "block";

          $rootScope.ShowLoader = false;
        }
      }).error(function (err) {
        $rootScope.ErrorMessage = "Something went wrong, please try again later!";
        $rootScope.ShowLoader = false;
        return false;
      });
    }
    else {
      $rootScope.ErrorMessage = "Check password";
      $rootScope.ShowLoader = false;
      return false;
    }

  }

  $scope.ChangeClick = function () {
    $rootScope.ErrorMessage = "";
    $scope.Message = "";
  };

  // $scope.init();
}]);