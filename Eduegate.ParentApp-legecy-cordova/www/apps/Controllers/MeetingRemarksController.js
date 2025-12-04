app.controller("MeetingRemarksController", [
    '$scope', '$http', '$location', '$rootScope', '$timeout', '$state', 'GetContext', 'rootUrl',
    function ($scope, $http, $location, $rootScope, $timeout, $state, GetContext, rootUrl) {

        var context = GetContext.Context();
        var dataService = rootUrl.SchoolServiceUrl;
        var appDataUrl = rootUrl.RootUrl;
        $rootScope.ShowLoader = true;
        $scope.SignUpDetails = [];
        $scope.Students = [];
        $scope.Employees = [];
        $scope.IsShowSlotDetails = false;
        $scope.IsError = false;
        $scope.ErrorMessage = "";
        var dateFormat = null;

        $scope.init = function (model) {
            $scope.FillAllotedMeetings();
        };

        $scope.FillAllotedMeetings = function () {
            $rootScope.ShowLoader = true;

            $http({
                url: `${dataService}/GetParentAllotedMeetings`,
                method: 'GET',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            }).then(function (response) {
                if (response.data && !response.data.IsError) {
                    $scope.AllottedMeetings = response.data;
                } else {
                    // Handle error or empty response case if needed
                }
                $rootScope.ShowLoader = false;
            }).catch(function (error) {
                $rootScope.ShowLoader = false;
            });
        };

        $scope.SubmitRemarkEntry = function (slotDet) {
            var remarkEntry = slotDet.SignupSlotRemarkMap;

            if (!remarkEntry.ParentRemarks) {
                // $().showGlobalMessage($root, $timeout, true, "Enter a remark before submitting!", 2000);
                return true;
            } else {
                $rootScope.ShowLoader = true;

                $http({
                    url: `${dataService}/SubmitMeetingRemarks`,
                    method: 'POST',
                    headers: {
                        "Accept": "application/json;charset=UTF-8",
                        "Content-Type": "application/json;charset=UTF-8",
                        "CallContext": JSON.stringify(context)
                    },
                    data: JSON.stringify(remarkEntry)
                }).then(function (response) {
                    if (response.data && !response.data.IsError) {
                        // $().showGlobalMessage($root, $timeout, false, "Saved successfully!", 2000);
                        $rootScope.SuccessMessage = 'Saved Successfully';
                        $(".success-msg").removeClass('showMsg');
                        $(".success-msg").addClass('showMsg').delay(2000).queue(function () {
                            $(this).removeClass('showMsg');
                            $(this).dequeue();
                        });
                        $timeout(function () {
                            $scope.$apply(function () {
                                $scope.FillAllotedMeetings();
                            });
                        });
                    } else {
                        // $().showGlobalMessage($root, $timeout, true, "Saving failed!");
                        $rootScope.ShowToastMessage("Saving failed!");
                    }
                }).catch(function (error) {
                    $rootScope.ShowLoader = false;

                }).finally(function () {
                    $rootScope.ShowLoader = false;
                    // hideOverlay();
                });
            }
        };


    }
]);
