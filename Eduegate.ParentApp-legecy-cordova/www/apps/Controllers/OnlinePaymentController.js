app.controller('OnlinePaymentController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', '$timeout', '$q', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout, $q) {
  console.log('OnlinePaymentController loaded.');

  var dataService = rootUrl.RootUrl;
  var Context = GetContext.Context();
  var schoolDataService = rootUrl.SchoolServiceUrl;

  //var parentPortal = rootUrl.ParentUrl;

  $scope.IsCancel = false;
  $scope.IsShowLogoLoader = true;
  $scope.LastSession = null;
  $scope.order = null;
  $scope.cartdata = null;

  $scope.init = function (type) {
    $scope.IsShowLogoLoader = true;

    if (type == "Initiate") {

      if ($stateParams.cartID) {
        VerifyAndOrderByCartID($stateParams.cartID).then(function (status) {
          if (!status) {
            $scope.GetMasterSession($stateParams.order);
          }
        });
      } else {
        $http({
          url: dataService + "/GetCartDetails",
          method: "GET",
          headers: {
            Accept: "application/json;charset=UTF-8",
            "Content-type": "application/json; charset=utf-8",
            CallContext: JSON.stringify(Context),
          },
        }).then(function (cart) {
          $scope.cartdata = cart.data;
          VerifyAndOrder(cart.data).then(function (status) {
            if (!status) {
              $scope.order = cart.data;
              $scope.GetMasterSession(cart.data);
            }
          });
        });
      }
    }

    if (type == "Validate") {
      $rootScope.ShowPreLoader = true;
      $rootScope.ShowLoader = true;

      ValidateSaveWebsiteOrder("Success");
    }
  };

  $scope.RetryPayment = function () {
    var cart = $scope.cartdata;
    VerifyAndOrder(cart).then(function (status) {
      if (!status) {
        $http({
          url: dataService + "/GetCartDetails",
          method: "GET",
          headers: {
            Accept: "application/json;charset=UTF-8",
            "Content-type": "application/json; charset=utf-8",
            CallContext: JSON.stringify(Context),
          },
        }).then(function (cart) {
          redirectToMasterCardPayment(cart.data, $scope.LastSession);
        });
      }
    });
  };

  $scope.GetMasterSession = function (cart) {
    $http({
      url:
        schoolDataService +
        "/GetPaymentSession?shoppingCartID=" +
        (cart.ShoppingCartID || cart.CartID) + "&totalAmount=" + cart.Total+ "&paymentMethodID=" + $rootScope.CheckOutPaymentDTO.SelectedPaymentOption,
      method: "GET",
      headers: {
        Accept: "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        CallContext: JSON.stringify(Context),
      },
    }).then(function (result) {
      var sessionData = result.data;
      $scope.LastSession = sessionData.SessionID;
      redirectToMasterCardPayment(
        cart,
        sessionData.BankSession,
        sessionData.RedirectUrl
      );
    });
  };


  function redirectToMasterCardPayment(cart, session, url) {
    var url = $rootScope.ParentPortalUrl + "PaymentGateway/OnlinePaymentFromMobile?loginID=" + Context.LoginID + "&emailID=" + Context.EmailID + "&userID=" + Context.UserId + "&paymentMethodID=" + $rootScope.CheckOutPaymentDTO.SelectedPaymentOption;

    var ref = cordova.InAppBrowser.open(url,
      '_blank', "location=no,hidden=no,closebuttoncaption='',toolbar=no");

    if (ref != null && ref != undefined) {

      ref.addEventListener('exit', function (event) {

      });
      ref.addEventListener('loaderror', function (event) {

      });
      ref.addEventListener('loadstart', function (event) {
      });
      ref.addEventListener('loadstop', function (event) {
        var url = event.url;
        if (url.includes('Validate') || url.includes('success')) {
          ref.close();
          $rootScope.ShowLoader = true;
          var newUrl = new URL(url);
          if (newUrl.href) {

            $state.go("validateonlinepayment");
          }
          else {
            $scope.ShowPaymentFailure();
          }
        }
        else if (url.includes('Cancel')) {
          ref.close();
          $scope.ShowPaymentCancel();
        }
        else if (url.includes('Fail')) {
          ref.close();
          $scope.ShowPaymentFailure();
        }
      });
    }
  }

  $scope.ShowPaymentCancel = function () {

    $scope.IsShowLogoLoader = false;
    $rootScope.ShowPreLoader = false;
    $rootScope.ShowLoader = false;

    $state.go("paymentcancellation");
  }

  // $scope.ShowPaymentFailure = function () {
  //   $scope.IsShowLogoLoader = false;
  //   $rootScope.ShowPreLoader = false;
  //   $rootScope.ShowLoader = false;

  //   $state.go("paymentfailure");
  // }

    $scope.ShowPaymentFailure = function () {
      $scope.IsCancel = true;
      $scope.IsShowLogoLoader = false;

      $timeout(function () {
          $rootScope.ShowLoader = true;
      });

      //$rootScope.CheckOutPaymentDTO.PostObject = merchantReference;

      $http({
          url: dataService + "/PaymentFailure",
          method: 'POST',
          headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
          data:  $rootScope.CheckOutPaymentDTO,
      })
      .then(function (result) {
          $state.go("paymentfailure", {
              PaymentID: result.PaymentID,
              TrackID: result.TrackID,
              TrackKey: result.TrackKey,
              ErrorMessage: result.ErrorMessage,
              SessionID : session,
              Order: JSON.stringify($stateParams.order || $scope.order),
           });
      }, function (err) {
          $state.go("paymentfailure", {
              PaymentID: result.PaymentID,
              TrackID: result.TrackID,
              TrackKey: result.TrackKey,
              ErrorMessage: result.ErrorMessage,
              //SessionID : session,
              Order: JSON.stringify($stateParams.order || $scope.order),
          });
      });
  }

  function VerifyAndOrder(cartdata) {
      return $q(function (resolve, reject) {
        $http({
          url:
            schoolDataService +
            "/ValidateCartPayment?cartID=" +
            $rootScope.CheckOutPaymentDTO.ShoppingCartID +
            "&returnIndicator=" + "&paymentMethodID=" + $rootScope.CheckOutPaymentDTO.SelectedPaymentOption + "&totalCartAmount=" + $rootScope.CheckOutPaymentDTO.TotalCartAmount,
          method: "GET",
          headers: {
            Accept: "application/json;charset=UTF-8",
            "Content-type": "application/json; charset=utf-8",
            CallContext: JSON.stringify(Context),
          },
        }).then(function (result) {
          if (result.data) {
            SaveWebsiteOrder();
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    }

  function VerifyAndOrderByCartID(cartID) {
    return $q(function (resolve, reject) {
      $http({
        url:
        schoolDataService +
          "/ValidateCartPayment?cartID=" +
          cartID +
          "&returnIndicator="  + "&paymentMethodID=" + $rootScope.CheckOutPaymentDTO.SelectedPaymentOption + "&totalCartAmount=" + $rootScope.CheckOutPaymentDTO.TotalCartAmount,
        method: "GET",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(Context),
        },
      }).then(function (result) {
        if (result.data) {
          SaveWebsiteOrder();
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  function ValidateSaveWebsiteOrder(returnIndicator) {

    $http({
      url:
        schoolDataService +
        "/ValidateCartPayment?cartID=" +
        $rootScope.CheckOutPaymentDTO.ShoppingCartID +
        "&returnIndicator=" +
        returnIndicator  + "&paymentMethodID=" + $rootScope.CheckOutPaymentDTO.SelectedPaymentOption + "&totalCartAmount=" + $rootScope.CheckOutPaymentDTO.TotalCartAmount,
      method: "GET",
      headers: {
        Accept: "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        CallContext: JSON.stringify(Context),
      },
    }).then(function (result) {
      if (result.data) {
        SaveWebsiteOrder();
      } else {
        $state.go("paymentfailure", {
          TrackID: $rootScope.CheckOutPaymentDTO.ShoppingCartID,
          Order: JSON.stringify($stateParams.order || $scope.order),
        });
        // $scope.ShowPaymentFailure();
      }
    }),
      function (err) {
        $state.go("paymentfailure", {
          TrackID: $rootScope.CheckOutPaymentDTO.ShoppingCartID,
          Order: JSON.stringify($stateParams.order || $scope.order),
        });
        // $scope.ShowPaymentFailure();
      };
  }

  function SaveWebsiteOrder() {
    $http({
      url: dataService + "/OnlineStoreGenerateOrder",
      method: "POST",
      headers: {
        Accept: "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        CallContext: JSON.stringify(Context),
      },
      data: $rootScope.CheckOutPaymentDTO,
    }).then(function (result) {
      result = result.data;
      if (result.operationResult.operationResult == 1) {
        if (result.RedirectUrl == "" || result.RedirectUrl == null) {
          if ($rootScope.ShowLoader == true) {
            $rootScope.ShowLoader = false;
          }

          $rootScope.LoadingMessage = "";
          $state.go("thankyou", {
            transactionNo: result.TransactionNo,
            Amount:result.Amount,
            cartID: result.CartID,
            transactiondate: result.Transactiondate,
            trackID : result.TrackID,
            orderHistory: JSON.stringify(result.orderHistory),
          });
        }
      } else {
        $rootScope.LoadingMessage = "";
        $rootScope.ErrorMessage = result.operationResult.Message;

        $(".error-msg").removeClass("showMsg");
        $(".error-msg")
          .addClass("showMsg")
          .delay(2000)
          .queue(function () {
            $(this).removeClass("showMsg");
            $(this).dequeue();
          });

        $state.go("singlecheckout");
      }
    }),
      function (err) {
        $rootScope.LoadingMessage = "";
        if ($rootScope.ShowLoader == true) {
          $rootScope.ShowLoader = false;
        }
      };
  }

  // $scope.init();
}]);