app.controller('MeetingAccountController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', 'serviceCartCount', '$state', '$stateParams', '$sce', '$rootScope', 'serviceAddToCart', '$q', "$translate", '$timeout', function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount, $state, $stateParams, $sce, $rootScope, serviceAddToCart, $q, $translate, $timeout) {
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

        $scope.GetAllTickets();
    };

    $scope.GetAllTickets = function () {

        $http({
            url:
                dataService +'/GetActiveSignupGroups',
            method: "GET",
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            },
        }).then(function (result) {
            if (result) {
                $scope.SignUpGroupDetails = result.data
                $rootScope.ShowLoader = false;

            }
        });
    };


    // $scope.GroupViewClick = function (groupDetails) {
    //     window.location.replace(utility.myHost + "SignUp/EventDetails?groupID=" + groupDetails.SignupGroupID);
    // }

    $scope.GroupViewClick = function(groupDetails){
        $state.go("eventdetails", { SignupGroupID: groupDetails.SignupGroupID });
    }

    $scope.SaveTicketCommunication = function (ticket, notes) {


        $scope.ShowPreLoader = true;

        if (!notes) {
            $rootScope.SuccessMessage = "A message is required.";
            const toastLiveExample = document.getElementById('liveToast')
            const toast = new bootstrap.Toast(toastLiveExample, {
                delay: 2000,
            })
            toast.show()
            return false;
        }

        var communicationDTO = {
            "TicketCommunicationIID": 0,
            "TicketID": ticket.TicketIID,
            "Notes": notes,
        };


        $http({
            url: dataService + "/SaveTicketCommunication",
            method: 'POST',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(context) },
            data: JSON.stringify(communicationDTO),
        }).then(function (result) {

            if (result.data.operationResult == 1) {
                $timeout(function () {
                    $rootScope.SuccessMessage = result.data.Message;
                    const toastLiveExample = document.getElementById('liveToast')
                    const toast = new bootstrap.Toast(toastLiveExample, {
                        delay: 2000,
                    })
                    toast.show()

                    $scope.$apply(function () {
                        $scope.GetAllTickets();
                    });
                }, 1000);
            }
            else{
                $rootScope.ErrorMessage = result.data.Message;
                const toastLiveExample = document.getElementById('liveToastError')
                const toast = new bootstrap.Toast(toastLiveExample, {
                    delay: 2000,
                })
                toast.show()

            }
        });


    };
    $scope.MeetingRequestTabClick = function () {
        $state.go("meetingrequestlist");
    };
    $scope.MeetingRemarksTabClick = function () {
        $state.go("meetingremarks");

    };
    $scope.MeetingHistoryTabClick = function () {
        $state.go("meetingremarks");

    };
}]);