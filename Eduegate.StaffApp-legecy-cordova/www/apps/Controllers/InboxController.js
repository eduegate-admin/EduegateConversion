app.controller('InboxController', ['$scope', '$http', 'rootUrl', 'GetContext', '$stateParams', '$state', 'SignalRService', "$window",
    function ($scope, $http, rootUrl, GetContext, $stateParams, $state, SignalRService, $window) {

        // Initialize lists
        $scope.teacherEmailList = [];
        $scope.parentList = [];
        $scope.teacherList = [];
        $scope.isCommunicationEnabled = false;
        $scope.searchText = '';
        $scope.filterBy = '';
        $scope.isRefreshing = false;
        $scope.broadcastList = [];
        $scope.savedBroadcastLists = {};

        // Get context and service URL
        var context = GetContext.Context();
        var CommunicationServiceUrl = rootUrl.CommunicationServiceUrl;
        $scope.ContentService = rootUrl.ContentServiceUrl;

        // Initialize controller by fetching data
        $scope.init = function () {
            $scope.GetIsEnableCommunication();
            $scope.loadBroadcastList($scope.broadcastList)
            // Load saved broadcast lists from storage on app load
            // loadBroadcastListsFromStorage();

            // Check if ParentDetails data exists in local storage
            const storedParentDetails = $window.localStorage.getItem('MinimalParentDetails');

            if (storedParentDetails) {
                // Use the data from local storage
                $scope.ParentDetails = JSON.parse(storedParentDetails);
            } else {
                // Fetch from the API if not already stored
                $scope.GetParentDetailsByTeacherLoginID();
            }
            $scope.GetParentsWithLatestMessageByTeacherLoginID();
            //$scope.GetParentsByTeacherLoginIDGroupedByClass();
            if ($stateParams.ListName) {
                try {
                    // Parse the JSON string to get the array of recipient objects
                    $scope.listName = JSON.parse($stateParams.ListName);
                    // $scope.listName is now an array of objects like {LoginID: ..., StudentID: ...}
                    // This will be used by $scope.SaveBroadcast function
                } catch (e) {
                    console.error("Error parsing ListName from state params:", e);
                    $scope.listName = []; // Default to empty list on error
                }
            }
            if ($stateParams.BroadcastName) {
                $scope.broadcastName = $stateParams.BroadcastName;
            }
            if ($stateParams.BroadcastID) {
                $scope.BroadcastID = $stateParams.BroadcastID;
                // If loading an existing broadcast, fetch its messages
                $scope.GetBroadcastMessages();
            }

        };
        $scope.refreshParentDetails = function () {

            $scope.GetParentDetailsByTeacherLoginID();
        };

        // Listen for real-time Parent List updates
        $scope.$on('ParentListUpdated', function (event, data) {
            $scope.$applyAsync(() => {
                $scope.GetParentsWithLatestMessageByTeacherLoginID(data.teacherLoginId);
            });
        });


        // Listen for real-time Teacher List updates


        // Function to fetch Parent details based on teacher login ID
        $scope.GetParentDetailsByTeacherLoginID = function () {
            $scope.isRefreshing = true;
            $http({
                url: CommunicationServiceUrl + '/GetParentDetailsByTeacherLoginID',  // API endpoint
                method: 'GET',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            }).then(function (result) {

                $scope.ParentDetails = result.data;
                $scope.isRefreshing = false;
                const minimalParentDetails = $scope.ParentDetails.map(parent => {
                    return {
                        LoginID: parent.LoginID,
                        GuardianFirstName: parent.GuardianFirstName,
                        GuardianLastName: parent.GuardianLastName,
                        FatherFirstName: parent.FatherFirstName,
                        FatherMiddleName: parent.FatherMiddleName,
                        FatherLastName: parent.FatherLastName,
                        FatherEmailID: parent.FatherEmailID,
                        PhoneNumber: parent.PhoneNumber,
                        // Students: parent.Students,
                        // StudentFullName: parent.StudentFullName,
                        // StudentID: parent.StudentID,
                        // StudentProfilePhoto: parent.StudentProfilePhoto,
                        Student: parent.Student,                     
                    };
                });

                // Store in local storage
                localStorage.setItem('MinimalParentDetails', JSON.stringify(minimalParentDetails));

            }, function (error) {
                console.log("Error fetching teacher emails: ", error);
            });
        };

        $scope.GetParentsWithLatestMessageByTeacherLoginID = function (parentLoginId) {
            $http({
                //url: CommunicationServiceUrl + '/GetParentsWithLatestMessageByTeacherLoginID',
                url: parentLoginId
                    ? CommunicationServiceUrl + '/GetParentsWithLatestMessageByTeacherLoginID?parentLoginId=' + parentLoginId
                    : CommunicationServiceUrl + '/GetParentsWithLatestMessageByTeacherLoginID',
                method: 'GET',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            }).then(function (result) {
                $scope.ParentsWithLatestMessages = result.data;
            }, function (error) {
                console.log("Error fetching parents with latest messages: ", error);
            });
        };

        // On clicking a chat list item, navigate to the chat state
        $scope.ChatListClick = function (recieverID, parentName, studentID, studentName) {
            $state.go("message", { 
                RecieverID: recieverID, 
                ParentName: parentName, 
                StudentID: studentID ,
                StudentName: studentName ,

            });
        };

        $scope.BroadcastListClick = function (Participants, broadcastName, broadcastID) {
            // Participants is an array of BroadcastRecipientsDTO, which should now include StudentID
            // (due to backend changes in GetBroadcastDetailsByUserId)

            const recipientsData = Participants.map(participant => ({
                LoginID: participant.ToLoginID,    // Parent's/Recipient's LoginID
                StudentID: participant.StudentID,  // Associated StudentID
                // You might want to include other details like names if available and needed by the 'broadcast' state
                // e.g., StudentName: participant.StudentName (if participant DTO has it)
            }));

            $state.go('broadcast', {
                ListName: JSON.stringify(recipientsData), // ✅ Pass array of objects with LoginID and StudentID
                BroadcastName: broadcastName,
                BroadcastID: broadcastID
            });
        };




        // Custom filter function
        $scope.customNameFilter = function (parent) {
            if (!$scope.searchText) return true; // If no search text, show all
            const search = $scope.searchText.toLowerCase();
            // Check against all relevant fields for parents
            const matchesParent = (parent.GuardianFirstName?.toLowerCase().includes(search) ||
                parent.GuardianLastName?.toLowerCase().includes(search) ||
                parent.FatherFirstName?.toLowerCase().includes(search) ||
                parent.FatherMiddleName?.toLowerCase().includes(search) ||
                parent.FatherLastName?.toLowerCase().includes(search));
            // Check against all relevant fields for students
            const matchesStudent = parent.Students?.some(student =>
                student.FirstName?.toLowerCase().includes(search) ||
                student.MiddleName?.toLowerCase().includes(search) ||
                student.LastName?.toLowerCase().includes(search)
            );

            return matchesParent || matchesStudent;
        };

        $scope.DisplaySearchPopover = function () {
            $("#fullPageSearch").show();

            $("#fullTextSearchInput").focus();
        };
        $scope.HideSearchPopover = function () {
            $("#fullPageSearch").hide();

        };
        $scope.GetIsEnableCommunication = function () {
            $http({
                url: CommunicationServiceUrl + '/GetIsEnableCommunication?loginID=' + context.LoginID,
                method: "GET",
                headers: {
                    Accept: "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    CallContext: JSON.stringify(context),
                },
            }).then(function (result) {
                if (result && result.data !== null) {
                    $scope.isCommunicationEnabled = result.data; // This will be true or false

                } else {
                    console.error("Teacher not found or no data returned.");
                }
            }).catch(function (error) {
                console.error("Error checking communication status:", error);
            });
        };

        $scope.toggleCommunication = function (enable) {

            $scope.teacherLoginID = context.LoginID,


                // Make an HTTP POST request to the backend
                $http({
                    url: CommunicationServiceUrl + "/MarkEnableCommunication?LoginID=" + $scope.teacherLoginID + "&enableCommunication=" + enable,
                    method: "POST",
                    headers: {
                        Accept: "application/json;charset=UTF-8",
                        "Content-type": "application/json; charset=utf-8"
                    }
                }).then(function (response) {
                    // Handle the successful response
                    if (response.data.success) {
                        console.log(response.data.message);
                        // Optionally update the UI or notify the user
                    } else {
                        console.error(response.data.message);
                        // Notify the user that the teacher was not found
                    }
                }).catch(function (error) {
                    // Handle any errors that occur during the request
                    console.error("Error updating communication status:", error);
                    // Optionally notify the user of the error
                });
        };

        $scope.GetParentsByTeacherLoginIDGroupedByClass = function () {
            $scope.isRefreshing = true;
            $http({
                url: CommunicationServiceUrl + '/GetParentsByTeacherLoginIDGroupedByClass',  // API endpoint
                method: 'GET',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            }).then(function (result) {

                $scope.classSectionGroups = result.data;

            }, function (error) {
                console.log("Error fetching teacher emails: ", error);
            });
        };

        // Initialize the broadcast lists
        $scope.savedBroadcastLists = [];
        $scope.broadcastList = [];
        // Function to update the broadcast list selection
        $scope.updateBroadcastList = function (parent) {
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

        // Save the current broadcast list to the backend
        $scope.saveBroadcastList = function () {
            if ($scope.broadcastList.length === 0) {
                navigator.notification.alert(
                    "No parents selected for broadcast.",
                    null,
                    "Warning",
                    "OK"
                );
                return;
            }

            navigator.notification.prompt(
                "Enter a name for the broadcast list:",
                function (result) {
                    if (result.buttonIndex === 1) { // "OK" button index
                        const listName = result.input1;
                        if (!listName) {
                            navigator.notification.alert(
                                "Broadcast list name is required.",
                                null,
                                "Error",
                                "OK"
                            );
                            return;
                        }

                        // Prepare data for the backend
                        const broadcastData = $scope.broadcastList.map(parent => ({
                            BroadcastName: listName,
                            FromLoginID: context.LoginID, // Assuming the sender's login ID is available in $scope.currentUser
                            ToLoginID: parent.LoginID,
                            StudentID: parent.Student.StudentIID 
                        }));

                        $http({
                            url: `${CommunicationServiceUrl}/SaveBroadcastList`,
                            method: 'POST',
                            data: broadcastData,
                            headers: {
                                "Accept": "application/json;charset=UTF-8",
                                "Content-type": "application/json; charset=utf-8",
                                "CallContext": JSON.stringify(context)
                            }
                        }).then(function (response) {
                            navigator.notification.alert(
                                "Broadcast list saved successfully!",
                                null,
                                "Success",
                                "OK"
                            );
                            $scope.broadcastList = []; // Clear the current list after saving
                            $scope.loadBroadcastList();
                        })
                            .catch(function (error) {
                                navigator.notification.alert(
                                    "Failed to save broadcast list. Please try again.",
                                    null,
                                    "Error",
                                    "OK"
                                );
                                console.error(error);
                            });
                    }
                },
                "Save Broadcast", // Title
                ["OK", "Cancel"], // Button labels
                "" // Default input value
            );
        };

        // Load a saved broadcast list by name
        $scope.loadBroadcastList = function (listName) {
            // Fetch the list from the backend if needed, or local saved list
            $http({
                url: `${CommunicationServiceUrl}/GetBroadcastDetailsByUserId?userId=${context.LoginID}`,
                method: 'GET',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "CallContext": JSON.stringify(context)
                }
            }).then(function (response) {
                $scope.savedBroadcastLists = response.data; // Load the broadcast list from the backend
            })
                .catch(function (error) {
                    navigator.notification.alert(
                        "Failed to load the broadcast list.",
                        null,
                        "Error",
                        "OK"
                    );
                    console.error(error);
                });
        };



        document.addEventListener('DOMContentLoaded', () => {
            const navList = document.querySelector('.nav.nav-stretch');
            const activeTab = navList.querySelector('.nav-link.active');

            if (activeTab) {
                navList.style.display = 'none'; // Hides the <ul> element
            }
        });

        $scope.isToday = function (date) {
            const d = new Date(date);
            const today = new Date();
            return d.toDateString() === today.toDateString();
        };

        $scope.isYesterday = function (date) {
            const d = new Date(date);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return d.toDateString() === yesterday.toDateString();
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
                item.Student.StudentFullName
            ].join(" ").toLowerCase();
        
            return fullName.includes(search);
        };
        
        $scope.init();
    }]);
