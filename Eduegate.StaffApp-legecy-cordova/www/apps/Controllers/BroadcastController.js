app.controller('BroadcastController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', '$timeout', '$translate', 'SignalRService', '$element', '$q',
    function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout, $translate, SignalRService, $element ,$q) {
        console.log('BroadcastController loaded.');
        $scope.PageName = "Message";

        var context = GetContext.Context();
        var CommunicationServiceUrl = rootUrl.CommunicationServiceUrl;
        var dataService = rootUrl.SchoolServiceUrl;
        $scope.ContentService = rootUrl.ContentServiceUrl;

        $scope.BroadcastListName = $stateParams.ParentName;
        $scope.BroadcastName = $stateParams.BroadcastName;
        $scope.BroadcastID = $stateParams.BroadcastID;
        $scope.listName = JSON.parse($stateParams.ListName);
        $scope.selectedCommentParentId = null;
        $scope.ParentcommentText = "";

        $scope.LoginUserID = context.LoginID;
        $scope.Message = null; // Placeholder for the comment message
        $scope.page = 1;
        $scope.pageSize = 20;
        $scope.loading = false; // Track loading status
        $scope.ChatMessages = []; // Array to hold chat messages
        $scope.PhotoContentIID = ''
        $scope.imagePreviewSrc = '';

        
        $scope.EditBroadcastListClick = function () {
            var modalElement = document.getElementById('infoModal');
            var modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();

            $state.go('editbroadcast', {
                BroadcastID:  $stateParams.BroadcastID
            });
        };
        
        const chatContainer = $element[0].querySelector('#kt_drawer_chat_messenger_body');

        // Scroll to the bottom of the chat container
        $scope.scrollToBottom = function () {
            if (chatContainer) {
                chatContainer.scrollTo({
                    top: chatContainer.scrollHeight,
                    behavior: 'smooth' // Enable smooth scrolling
                });
            }
        };

        $scope.selectParentComment = function (parentId, parentcommentText) {
            $scope.selectedCommentParentId = parentId;
            $scope.ParentcommentText = parentcommentText;

        };
        $scope.clearSelectParentComment = function (parentId, parentcommentText) {
            $scope.selectedCommentParentId = null;
            $scope.ParentcommentText = '';

        };

        // Get chat messages with pagination and caching
        $scope.GetBroadcastMessages = function () {
            return new Promise((resolve, reject) => { // Wrap the function in a new Promise
                if ($scope.loading) return resolve(); // Prevent multiple calls while loading

                $scope.loading = true; // Set loading state

                // Get the chat container
                var chatContainer = document.getElementById('kt_drawer_chat_messenger_body');

                // Save the current scroll position
                var currentScrollHeight = chatContainer.scrollHeight;

                $http({
                    url: `${CommunicationServiceUrl}/GetBroadcastDetailsById?broadcastLoginIDs=` + $scope.BroadcastID,
                    method: 'GET',
                    headers: {
                        "Accept": "application/json;charset=UTF-8",
                        "CallContext": JSON.stringify(context)
                    }
                }).then(function (result) {
                    const groupedMessages = [];
                    const seenMessages = new Set();

                 result.data.Messages.forEach((message) => { // message is a CommentDTO
                    if (!seenMessages.has(message.CommentText)) { // This groups by CommentText
                        groupedMessages.push({
                            CommentIID: message.CommentID, // Ensure CommentID is preserved (original code used message.CommentID as CommentIID, which is fine)
                            CommentText: message.CommentText,
                            PhotoContentID: message.PhotoContentID,
                            ReferenceID: message.ReferenceID, // ✅ Preserve StudentID
                            // Explicitly map other needed properties from 'message'
                            FromLoginID: message.FromLoginID,
                            ToLoginID: message.ToLoginID,
                            CreatedDate: message.CreatedDate,
                            IsRead: message.IsRead,
                            BroadcastID: message.BroadcastID // If available and needed
                            // ... any other properties from 'message' you want to carry over
                        });
                        seenMessages.add(message.CommentText);
                    }
                });
                $scope.ChatMessages = groupedMessages; // Assign consolidated messages to scope variable


                    $scope.loading = false;
                    $timeout(function () {
                        chatContainer.scrollTop = chatContainer.scrollHeight - currentScrollHeight; // Adjust scroll position
                    }, 0);
                    resolve(); // Resolve the promise when done
                }).catch(function (error) {
                    $scope.loading = false; // Reset loading flag in case of error
                    reject(error); // Reject the promise
                    $translate(['PLEASETRYLATER']).then(function (translation) {

                        $rootScope.ToastMessage = translation.PLEASETRYLATER;
                        $rootScope.ShowLoader = false;
                        $('.toast').toast('show');
                    });
                });
            });
        };

        chatContainer.addEventListener("scroll", function () {
            if (chatContainer.scrollTop === 0) {
                var entityTypeId = 170; // Example entity type

                $scope.GetBroadcastMessages(entityTypeId);
            }
        });


        $scope.SaveBroadcast = function (message) {
            if (!message && !$scope.PhotoContentIID) {
                $translate(['ENTERYOURCOMMENT']).then(function (translation) {
                    $rootScope.ToastMessage = translation.ENTERYOURCOMMENT;
                    $rootScope.ShowLoader = false;
                    $('.toast').toast('show');
                });
                return;
            }

            if (!$scope.listName) {
                $translate(['NORECIPIENTSSELECTED']).then(function (translation) {
                    $rootScope.ToastMessage = translation.NORECIPIENTSSELECTED;
                    $rootScope.ShowLoader = false;
                    $('.toast').toast('show');
                });
                return;
            }

            $scope.isSaving = true;
            let fromLoginID = context.LoginID;

            // Extract recipient IDs from the broadcast list
            let broadcastLoginIDs = $scope.listName;

            // Prepare data to send to the backend
            let data = {
                Comment: {
                    BroadcastName: $scope.broadcastName || 'General Broadcast', // Default name if none provided
                    CommentText: message,
                    FromLoginID: fromLoginID,
                    EntityTypeID: 170,
                    BroadcastID: $scope.BroadcastID,
                    PhotoContentID : $scope.PhotoContentIID

                },
                BroadcastLoginIDs: broadcastLoginIDs
            };

            // Make the API call to save the broadcast
            $http({
                url: `${CommunicationServiceUrl}/SaveBroadcast`,
                method: 'POST',
                data: data,
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            }).then(function (response) {
                if (response.data && response.data.length > 0) {
                    const groupedMessages = [];
                    const seenMessages = new Set();
                    response.data.forEach((message) => {
                        if (!seenMessages.has(message.CommentText)) {
                            groupedMessages.push({
                                CommentIID: message.CommentID, // Ensure CommentID is preserved
                                CommentText: message.CommentText,
                                PhotoContentID: message.PhotoContentID,
                                ...message // Include other properties if needed
                            });
                            seenMessages.add(message.CommentText);
                        }
                    });

                        $scope.ChatMessages.push(...groupedMessages); // Use spread operator to merge new messages into ChatMessages



                    $scope.Message = '';
                    $scope.broadcastName = '';
                    $scope.broadcastList = [];
                    $scope.imagePreviewSrc = ''; 
                    $scope.PhotoContentIID = ''

                    var image = document.getElementById('myImage');
                    image.src = '';
                    $timeout($scope.scrollToBottom, 100);

                    // Notify recipients in real-time
                    angular.forEach(response.data, function (comment) {
                        SignalRService.sendMessage(
                            comment.CommentIID,
                            comment.FromLoginID,
                            comment.ToLoginID,
                            context.LoginID,
                            comment.CommentText,
                            comment.BroadcastID,
                            $scope.broadcastName,
                            comment.PhotoContentID,
                            comment.ReferenceID 
                        );
                    });


                    $rootScope.ToastMessage = 'Broadcast sent successfully!';
                } else {
                    $rootScope.ToastMessage = 'Broadcast submission failed.';
                }
                $('.toast').toast('show');
            }).catch(function () {
                $translate(['PLEASETRYLATER']).then(function (translation) {
                    $rootScope.ToastMessage = 'Broadcast submission failed: ' + translation.PLEASETRYLATER;
                });
                $('.toast').toast('show');
            }).finally(function () {
                $scope.isSaving = false; // Reset saving state
            });
        };

        document.getElementById("UploadPicture").addEventListener
        ("click", uploadFromGallery);

    document.getElementById("cameraTakePicture").addEventListener
    ("click", cameraTakePicture);
    function cameraTakePicture() {
        var str = "? undefined:undefined ?";

    
        navigator.camera.getPicture(onSuccess, onFail, {
        quality: 40,
        destinationType: Camera.DestinationType.DATA_URL,
        correctOrientation: true

        });

        function onSuccess(imageData) {
        $scope.$apply(function() {
                    $scope.imagePreviewSrc = imageData;
        });
        var fileName = $scope.recieverID + "_" + $scope.parentName + "_" +  $scope.lastCommentID+ ".jpg";
        saveUploadedDocument(imageData, fileName);
        }

        function onFail(message) {
        return false;
        alert('Failed because: ' + message);
        }
    }
    function uploadFromGallery() {

        var str = "? undefined:undefined ?";

        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            correctOrientation: true
        });

        function onSuccess(imageURL) {
          $scope.$apply(function() {
                    $scope.imagePreviewSrc = imageURL;
                });
            var fileName = $scope.recieverID + "_" + $scope.parentName + "_" +  $scope.lastCommentID+ ".jpg";

            saveUploadedDocument(imageURL, fileName);
        }

        function onFail(message) {
            return false;
            alert('Failed because: ' + message);
        }
    }


    function saveUploadedDocument(data, fileName) {
         var base64Content = data.replace(/^data:image\/[a-z]+;base64,/, "");
         $scope.isUploading = true; 

        return $q(function (resolve, reject) {
            $http({
                method: 'POST',
                url: $scope.ContentService + '/UploadContentAsString',
                data:
                {
                    "ContentDataString": base64Content,
                    "ContentFileName": fileName,
                },
                headers: {
                    Accept: "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    CallContext: JSON.stringify(context),
                },
            })
                .success(function (result) {

                    $timeout(function () {
                        $scope.$apply(function () {
                            $scope.PhotoContentIID = result;
                            $scope.isUploading = false; 

                        });

                        resolve();
                    }, 1000);

                }).error(function () {
                    $rootScope.ShowLoader = false;
                    $scope.ShowPreLoader = false;
                });
        });
    }

    $scope.GetStudentDetailsFromBrodcasts = function () {
        $http({
            method: 'GET',
            url: `${CommunicationServiceUrl}/GetStudentsByBroadCastID`,
            params: { broadcastID: $scope.BroadcastID },
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "CallContext": JSON.stringify(context)
            }
        }).then(function (response) {
            $scope.StudentsInBroadcasts = response.data;
            $scope.BroadcatsMembers = response.data.length;
        }).catch(function () {
            $scope.loading = false;
            $rootScope.ShowLoader = false;
    
            $translate(['PLEASETRYLATER']).then(function (translation) {
                $rootScope.ToastMessage = translation.PLEASETRYLATER;
                $('.toast').toast('show');
            });
        });
    };    

        angular.element(document).on('input', 'textarea[ng-model="Message"]', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
    });
        $scope.init = function () {
            var entityTypeId = 170; // Example entity type
            $scope.GetBroadcastMessages(entityTypeId).then(function () {
                if (chatContainer) {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            });

        };



        $scope.init();
    }
]);
