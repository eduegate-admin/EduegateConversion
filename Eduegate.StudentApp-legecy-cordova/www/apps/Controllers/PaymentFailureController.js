app.controller("PaymentFailureController", [
  "$scope",
  "$http",
  "loggedIn",
  "rootUrl",
  "$location",
  "GetContext",
  "serviceCartCount",
  "$state",
  "$stateParams",
  "$sce",
  "$rootScope",
  "$timeout",
  "$interval",
  function (
    $scope,
    $http,
    loggedIn,
    rootUrl,
    $location,
    GetContext,
    serviceCartCount,
    $state,
    $stateParams,
    $sce,
    $rootScope,
    $timeout,
    $interval
  ) {
    var dataService = rootUrl.RootUrl;
    var Context = GetContext.Context();

    $scope.PaymentID = $stateParams.PaymentID;
    //alert($stateParams.PaymentID)
    $scope.TrackID = $stateParams.TrackID;
    $scope.Order = JSON.parse($stateParams.Order);
    //alert($stateParams.TrackID)
    $scope.TrackKey = $stateParams.TrackKey;
    //alert($stateParams.TrackKey)
    $scope.ErrorMessage = $stateParams.ErrorMessage;
    //alert($stateParams.ErrorMessage)

    $scope.SaveForLaterCount = 0;
    $scope.ShoppingCartCount = 0;

    $scope.init = function () {
      $scope.GetShoppingCartCount();
      $scope.GetSaveForCartCount();
    };

    $scope.GetShoppingCartCount = function () {
      var cartPromise = serviceCartCount.getProductCount(Context, dataService);
      cartPromise.then(
        function (result) {
          $scope.ShoppingCartCount = result;
          $rootScope.ShowLoader = false;
        },
        function () {}
      );
    };

    $scope.GetSaveForCartCount = function () {
      var loggedInPromise = loggedIn.CheckLogin(Context, dataService);
      loggedInPromise.then(
        function (model) {
          if (model.data) {
            if (model.data.LoginID) {
              //Loggedin User
              $scope.LoggedIn = true;
              var SaveForLaterCountPromise =
                serviceCartCount.getSaveForLaterCount(Context, dataService);
              SaveForLaterCountPromise.then(function (result) {
                $scope.SaveForLaterCount = result.data;
              });
            }
          }
        },
        function () {}
      );
    };

    $scope.ProceedPayment = function () {
        var order = $scope.Order;
        if(!$rootScope.CheckOutPaymentDTO) {
            $rootScope.CheckOutPaymentDTO = {};
        }
        
        $rootScope.CheckOutPaymentDTO.ShoppingCartID = order.ShoppingCartID;
        // $rootScope.CheckOutPaymentDTO.SelectedShippingAddress = order.DeliveryAddress.ContactID;
        $rootScope.CheckOutPaymentDTO.Branch = order.BranchID;
        $rootScope.CheckOutPaymentDTO.BranchID = order.BranchID;
        $rootScope.CheckOutPaymentDTO.IsCartLevelBranch = true;
        $rootScope.CheckOutPaymentDTO.SelectedPaymentOption = order.CartPaymentMethod;
        $rootScope.CheckOutPaymentDTO.VoucherNo = order.VoucherNumber;
        $rootScope.CheckOutPaymentDTO.VoucherAmount = order.VoucherAmount || 0;

        if(window.device)
        {
            $rootScope.CheckOutPaymentDTO.DevicePlatorm = device.platform;
            $rootScope.CheckOutPaymentDTO.DeviceVersion = device.version;
        }

        //if (order.PaymentMethod == 16) {                
            $state.go('onlinepayment',{
                cartID: order.ShoppingCartID,
                order: JSON.stringify(order),
              });
            return;
        //}
    };

    $scope.OptionClick = function () {
      $(".rightnav-cont").toggle();
    };

    $scope.GoHome = function () {
      $state.go("home", { loadBlocks: false });
    };

    $scope.SkipValidation = function (value) {
      if (value) {
        return $sce.trustAsHtml(jQuery.parseHTML(value)[0].textContent);
      }
    };
    $scope.init();
  },
]);
