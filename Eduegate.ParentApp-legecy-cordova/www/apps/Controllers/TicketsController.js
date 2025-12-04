app.controller("TicketsController", [
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
  "serviceAddToCart",
  "$q",
  "$translate",
  "$timeout",
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
    serviceAddToCart,
    $q,
    $translate,
    $timeout
  ) {
    var context = GetContext.Context();
    var appDataUrl = rootUrl.RootUrl;
    var dataService = rootUrl.SchoolServiceUrl;
    $scope.ContentService = rootUrl.ContentServiceUrl;
    $scope.showIcons = false;

    $scope.AllTicketDetails = [];
    $scope.TicketCount = 0;

    $scope.ShowPreLoader = true;

    $scope.init = function () {
      $scope.GetAllTickets();
    };

    $scope.GetAllTickets = function () {
      $http({
        url: dataService + "/GetAllTickets",
        method: "GET",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).then(function (result) {
        if (result) {
          // $timeout(function () {
          //     $scope.$apply(function () {

          $scope.AllTicketDetails = result.data;
          //     });
          // }, 1000);
          // $scope.TicketCount = $scope.AllTicketDetails.length();
        }
      });
    };

    $scope.SaveTicketCommunication = function (ticket, notes) {
      // Set loading state on the specific ticket object
      ticket.isSending = true;

      if (!notes) {
        $rootScope.SuccessMessage = "A message is required.";
        const toast = new bootstrap.Toast(
          document.getElementById("liveToast"),
          { delay: 2000 }
        );
        toast.show();
        ticket.isSending = false; // Reset state immediately
        return;
      }

      var communicationDTO = {
        TicketCommunicationIID: 0,
        TicketID: ticket.TicketIID,
        Notes: notes,
      };

      $http({
        url: dataService + "/SaveTicketCommunication",
        method: "POST",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
        data: JSON.stringify(communicationDTO),
      })
        .then(function (response) {
          if (response.data.operationResult == 1) {
            $rootScope.SuccessMessage = response.data.Message;
            const toast = new bootstrap.Toast(
              document.getElementById("liveToast"),
              { delay: 2000 }
            );
            toast.show();
            const newComm = response.data.NewCommunicationObject;

            if (newComm) {
              ticket.TicketCommunications.push(newComm);
            } else {
              $scope.GetAllTickets();
            }
            ticket.CommunicationNotes = "";
          } else {
            $rootScope.ErrorMessage = response.data.Message;
            const toast = new bootstrap.Toast(
              document.getElementById("liveToastError"),
              { delay: 2000 }
            );
            toast.show();
          }
        })
        .finally(function () {
          ticket.isSending = false;
        });
    };

    $scope.GenerateTicketTabClick = function () {
      $state.go("generatetickets");
    };
    $scope.GoHome = function () {
      $state.go("home");
    };
  },
]);
