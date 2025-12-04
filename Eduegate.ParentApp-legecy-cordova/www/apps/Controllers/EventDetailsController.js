app.controller('EventDetailsController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', 'serviceCartCount', '$state', '$stateParams', '$sce', '$rootScope', 'serviceAddToCart', '$q', "$translate", '$timeout', function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount, $state, $stateParams, $sce, $rootScope, serviceAddToCart, $q, $translate, $timeout) {
    var context = GetContext.Context();
    var appDataUrl = rootUrl.RootUrl;
    var dataService = rootUrl.SchoolServiceUrl;
    $scope.ContentService = rootUrl.ContentServiceUrl;
    $scope.showIcons = false;
    $scope.GroupID = $stateParams.SignupGroupID;

    $scope.SignUpDetails = [];
    $scope.FreeSlotCount = 0;
    $scope.Students = [];

    $scope.SelectedStudent = {
        "Key": null,
        "Value": null,
    };

    $scope.IsError = false;
    $scope.ErrorMessage = "";


    $scope.AllTicketDetails = [];
    $scope.TicketCount = 0;

    $scope.ShowPreLoader = true;

    $scope.init = function (screenType, groupID) {

        $scope.GetUserDetail();
        $scope.FillSignUpDetailsByGroupID($scope.GroupID);


    };

    $scope.GetUserDetail = function () {
        $rootScope.ShowLoader = true;
        $http({
            method: 'GET',
            url: appDataUrl + '/GetUserDetails',
            headers: {
                "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(context)
            }
        }).then(function (result) {
            $scope.UserDetails = result.data;
            $rootScope.ShowLoader = false;
            $scope.ParentID = $scope.UserDetails != null && $scope.UserDetails.Parent != null ? $scope.UserDetails.Parent.ParentIID : null;


        }, function (err) {
            $rootScope.ShowLoader = false;

        });
    }

    $scope.FillSignUpDetailsByGroupID = function (groupID) {

        $http({
            url:
                dataService + '/FillSignUpDetailsByGroupID?groupID=' + groupID,
            method: "GET",
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            },
        }).then(function (result) {
            if (result) {
                $timeout(function () {
                    $scope.$apply(function () {
                        $scope.GroupDetails = result.data;
                        $scope.SignUpDetails = $scope.GroupDetails.SignUpDTOs;

                        $scope.Students = $scope.GroupDetails.Students;

                        if ($scope.GroupDetails != null) {
                            $scope.FreeSlotCount = 0;
                            $scope.SignUpDetails.forEach(signup => {
                                $scope.FreeSlotCount += signup.SlotAvailableCount;
                            });
                        }
                    });

                });
            }
        });

    };

    $scope.SlotSelectionClick = function (timeSlot, slotMap, signUpDetail) {

        $scope.SelectedTimeSlot = timeSlot;
        $scope.SelectedSignupSlot = slotMap;
        $scope.SelectedSignup = signUpDetail;

        if ($scope.Students.length == 1) {
            $scope.SelectedStudent.Key = $scope.Students[0].Key;
            $scope.SelectedStudent.Value = $scope.Students[0].Value;

            var radioButton = document.getElementById("student_" + $scope.SelectedStudent.Key);
            if (radioButton) {
                radioButton.checked = true;
            }
        }
        else {
            $scope.SelectedStudent = {
                "Key": null,
                "Value": null,
            };

            var radioButtons = document.querySelectorAll('[id*="student_"]');
            // Loop through all radio buttons with IDs containing "student_"
            radioButtons.forEach(function (radioButton) {
                radioButton.checked = false; // Uncheck the radio button
            });
        }

        $scope.IsError = false;
        $scope.ErrorMessage = "";

        $('#SlotBookingConfirmationModal').modal('show');
    };

    $scope.StudentSelectionChange = function (student) {
        $scope.SelectedStudent.Key = student.Key;
        $scope.SelectedStudent.Value = student.Value;

        var radioButton = document.getElementById("student_" + student.Key);
        if (radioButton) {
            radioButton.checked = true;
        }

        $scope.IsError = false;
        $scope.ErrorMessage = "";
    };

    $scope.ConfirmAndSaveSlot = function () {

        if (!$scope.SelectedStudent.Key) {
            $scope.IsError = true;
            $scope.ErrorMessage = "Select an student";
            return false;
        }

        var isError = false;
        var errorMessage = "";
        var studentID = parseInt($scope.SelectedStudent.Key);

        $scope.SelectedSignup.SignupSlotMaps.forEach(slot => {
            slot.SignupSlotMapTimes.forEach(time => {
                if (time.ParentID == $scope.ParentID && time.StudentID == studentID) {
                    isError = true;
                    errorMessage = "You have already booked another slot for the same meetup for this student. If you wish to book this slot, please cancel the previously booked one.";
                }
            });
        });

        if (!isError) {
            $scope.SignUpDetails.forEach(signup => {
                signup.SignupSlotMaps.forEach(slot => {
                    slot.SignupSlotMapTimes.forEach(time => {
                        if (time.ParentID == $scope.ParentID && time.StudentID == studentID) {

                            if (time.SlotDateString == $scope.SelectedTimeSlot.SlotDateString) {
                                if (time.StartTimeString == $scope.SelectedTimeSlot.StartTimeString) {
                                    isError = true;
                                    errorMessage = "Unable to book at the same time for multiple meetups within one event for same student.";
                                }
                            }
                        }
                    });
                });
            });
        }

        if (isError) {
            // error messgae here
            // $().showGlobalMessage($root, $timeout, true, errorMessage, 5000);
            $rootScope.ShowToastMessage(errorMessage, 'error');
            $('#SlotBookingConfirmationModal').modal('hide');
            return false;

        }
        else {

            $('#SlotBookingConfirmationModal').modal('hide');

            var timeSlot = $scope.SelectedTimeSlot;
            timeSlot.StudentID = $scope.SelectedStudent.Key;
            timeSlot.SignupOrganizerEmployeeID = $scope.SelectedSignup.OrganizerEmployeeID;
            timeSlot.SignupOrganizerEmployeeName = $scope.SelectedSignup.OrganizerEmployeeName;


            $http({
                url: dataService + '/SaveSelectedSignUpSlot',
                method: 'POST',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                },
                data: timeSlot,
            }).then(function (result) {
                if (result.data.operationResult == 1) {
                    $rootScope.ShowToastMessage(result.data.Message, 'success');

                    $scope.FillSignUpDetailsByGroupID($scope.GroupID);

                }
                else {
                    $rootScope.ShowPreLoader = false;
                    $rootScope.ShowLoader = false;

                    $rootScope.ShowToastMessage(result.data.Message, 'error');
                    return false;
                }

            });
        }
    };
    $scope.SlotCancelClick = function (timeSlot, slotMap, signUpDetail) {

        $scope.SelectedTimeSlot = timeSlot;
        $scope.SelectedSignupSlot = slotMap;
        $scope.SelectedSignup = signUpDetail;

        $('#SlotCancelConfirmationModal').modal('show');
    };

    $scope.ConfirmAndCancelSlot = function () {

        $('#SlotCancelConfirmationModal').modal('hide');

        var timeSlot = $scope.SelectedTimeSlot;
        timeSlot.StudentID = $scope.SelectedStudent.Key;
        timeSlot.SignupOrganizerEmployeeID = $scope.SelectedSignup.OrganizerEmployeeID;
        timeSlot.SignupOrganizerEmployeeName = $scope.SelectedSignup.OrganizerEmployeeName;
        $http({
            url: dataService + '/CancelSelectedSignUpSlot',
            method: 'POST',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            },
            data: timeSlot,
        }).then(function (result) {
            if (result.data.operationResult == 1) {
                $rootScope.ShowToastMessage("Slot cancellation successful!", 'success');

                $scope.FillSignUpDetailsByGroupID($scope.GroupID);
            }
            else {
                $rootScope.ShowPreLoader = false;
                $rootScope.ShowLoader = false;

                $rootScope.ShowToastMessage(result.data.Message, 'error');
                return false;
            }

        });
    };


}]);