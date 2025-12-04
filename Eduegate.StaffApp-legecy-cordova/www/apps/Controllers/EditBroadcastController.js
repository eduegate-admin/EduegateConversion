app.controller('EditBroadcastController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', '$timeout', '$translate', 'SignalRService', '$element', '$q',
    function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout, $translate, SignalRService, $element ,$q) {
        $scope.PageName = "Edit Broadcast";
        
        var CommunicationServiceUrl = rootUrl.CommunicationServiceUrl;
        var context = GetContext.Context();
        $scope.broadcastList = [];

        $scope.init = function () {
            $scope.BroadcastID = parseInt($stateParams.BroadcastID) || null;

            $scope.GetParentDetailsByTeacherLoginID();
            if ($scope.BroadcastID) {
                $scope.GetStudentDetailsFromBroadcast();
            }
        };
        $scope.GetStudentDetailsFromBroadcast = function () {
            $http({
                method: 'GET',
                url: `${CommunicationServiceUrl}/GetStudentsByBroadCastID`,
                params: { broadcastID: $scope.BroadcastID },
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "CallContext": JSON.stringify(context)
                }
            }).then(function (response) {
                $scope.PreselectedBroadcastIDs = response.data.map(item => item.ParentIID);
                // Do not call markSelectedBroadcastParticipants here
            }).catch(function (error) {
                console.error("Error loading broadcast participants", error);
            });
        };
        
                

        $scope.toggleBroadcastSelection  = function (parent) {
            if (parent.selectedForBroadcast) {
                if (!$scope.broadcastList.includes(parent)) {
                    $scope.broadcastList.push(parent);
                }
            } else {
                const index = $scope.broadcastList.indexOf(parent);
                if (index > -1) {
                    $scope.broadcastList.splice(index, 1);
                }
            }
        };
        
        $scope.updateBroadcastList = function () {
            if ($scope.broadcastList.length === 0) {
                navigator.notification.alert(
                    "No parents selected for broadcast.",
                    null,
                    "Warning",
                    "OK"
                );
                return;
            }
        
            const broadcastData = $scope.broadcastList.map(parent => ({
                BroadcastIID: $scope.BroadcastID, // update existing broadcast
                FromLoginID: context.LoginID,
                ToLoginID: parent.LoginID,
                StudentID: parent.StudentID 

            }));
        
            $http({
                url: `${CommunicationServiceUrl}/UpdateBroadcastList`,
                method: 'POST',
                data: broadcastData,
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            }).then(function (response) {
                navigator.notification.alert(
                    "Broadcast list updated successfully!",
                    null,
                    "Success",
                    "OK"
                );
                $scope.broadcastList = [];
                $scope.loadBroadcastList();
            }).catch(function (error) {
                navigator.notification.alert(
                    "Failed to update broadcast list. Please try again.",
                    null,
                    "Error",
                    "OK"
                );
                console.error(error);
            });
        };
        
        $scope.loadBroadcastList = function () {
            $http({
                url: `${CommunicationServiceUrl}/GetBroadcastDetailsByUserId?userId=${context.LoginID}`,
                method: 'GET',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "CallContext": JSON.stringify(context)
                }
            }).then(function (response) {
                $scope.savedBroadcastLists = response.data;
            }).catch(function (error) {
                navigator.notification.alert(
                    "Failed to load the broadcast list.",
                    null,
                    "Error",
                    "OK"
                );
                console.error(error);
            });
        };
        
        $scope.GetParentDetailsByTeacherLoginID = function () {
            $http({
                url: CommunicationServiceUrl + '/GetParentDetailsByTeacherLoginID',
                method: 'GET',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            }).then(function (result) {
                $scope.ParentDetailsByTeacherLoginID = result.data;
        
                // Only now call markSelectedBroadcastParticipants
                if ($scope.PreselectedBroadcastIDs && $scope.PreselectedBroadcastIDs.length > 0) {
                    $scope.markSelectedBroadcastParticipants();
                }
            }, function (error) {
                console.log("Error fetching parent details: ", error);
            });
        };
        
        $scope.markSelectedBroadcastParticipants = function () {
            if (!$scope.ParentDetailsByTeacherLoginID || !$scope.PreselectedBroadcastIDs) return;
        
            $scope.ParentDetailsByTeacherLoginID.forEach(parent => {
                if ($scope.PreselectedBroadcastIDs.includes(parent.ParentIID)) {
                    parent.selectedForBroadcast = true;
        
                    if (!$scope.broadcastList.includes(parent)) {
                        $scope.broadcastList.push(parent);
                    }
                }
            });
        };
        $scope.parentSearchFilter = function (item) {
            if (!$scope.searchText) return true;
        
            const search = $scope.searchText.toLowerCase();
        
            const fullName = [
                item.GuardianFirstName,
                item.GuardianLastName,
                item.FatherFirstName,
                item.FatherMiddleName,
                item.FatherLastName,
                item.StudentFullName
            ].join(" ").toLowerCase();
        
            return fullName.includes(search);
        };
        
        $scope.init();

    }
]);
