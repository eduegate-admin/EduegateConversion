app.controller('MessageController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', '$timeout', '$translate', 'SignalRService', '$element', '$q',
    function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout, $translate, SignalRService, $element,$q) {
        console.log('MessageController loaded.');
        $scope.PageName = "Message";

        var context = GetContext.Context();
        var CommunicationServiceUrl = rootUrl.CommunicationServiceUrl;
        var dataService = rootUrl.SchoolServiceUrl;
        $scope.ContentService = rootUrl.ContentServiceUrl;

        $scope.recieverID = parseInt($stateParams.RecieverID);
        $scope.parentName = $stateParams.ParentName;
        $scope.listName = $stateParams.ListName;
        $scope.studentID = parseInt($stateParams.StudentID);
        $scope.studentName = $stateParams.StudentName;
        $scope.selectedCommentParentId = null;
        $scope.ParentcommentText = "";
        $scope.ChatMessages = JSON.parse(localStorage.getItem('cachedMessages')) || [];

        $scope.LoginUserID = context.LoginID;
        $scope.Message = null; // Placeholder for the comment message
        $scope.page = 1;
        $scope.pageSize = 20;
        $scope.loading = false; // Track loading status
        $scope.ChatMessages = []; // Array to hold chat messages
        $scope.PhotoContentIID = ''
        $scope.lastCommentID = null;
        $scope.imagePreviewSrc = '';

        // Listen for new messages from SignalR
        $scope.$on('NewMessageReceived', function (event, data) {
            $timeout(function () {
                // $scope.MarkCommentAsRead(data.commentId);
                $scope.onRealTimeMessageView(data);


                var exists = $scope.ChatMessages.some(function (message) {
                    return message.CommentIID === data.commentId;
                });

                if (!exists) {
                    // Add the new message to the chat
                    if ((data.toLoginId === $scope.recieverID || data.fromLoginId === $scope.recieverID) &&
                        data.referenceID === $scope.studentID) {
                        $scope.ChatMessages.push({
                            CommentIID: data.commentId,
                            FromLoginID: data.fromLoginId,
                            ToLoginID: data.toLoginId,
                            CreatedBy: data.CreatedBy,
                            CreatedDate: $rootScope.LastMessageCreatedDate,
                            CommentText: data.message,
                            IsRead: data.isRead,
                            ParentCommentID: data.parentCommentId, // Store parent comment ID
                            ParentComment: data.parentCommentText, // Store parent comment text
                            PhotoContentID: data.photoContentID,
                            ReferenceID: data.referenceID
                        });
                    }
                }
                $timeout($scope.scrollToBottom, 100);

            });
        });

        $scope.onRealTimeMessageView = function (message) {

            if (message && !message.isRead  && message.fromLoginId !== $scope.LoginUserID) {

                $scope.MarkCommentAsRead(message.commentId); // Only call this if the message is from the other user
            }
        };

        // Listen for read message events from SignalR
        // Listen for 'MessageRead' event from SignalR
        $scope.$on('MessageRead', function (event, data) {
            $timeout(function () {
                $scope.ChatMessages.forEach(function (message) {
                    // Check if this is the message and is not from the current user
                    if (message.CommentIID === data.commentId ) {
                        message.IsRead = true;
                    }
                });
            });
        });


        // Mark a comment as read
        $scope.MarkCommentAsRead = function (commentId) {
            $http({
                url: `${CommunicationServiceUrl}/MarkCommentAsRead`,
                method: 'POST',
                data: { commentIID: commentId },
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "CallContext": JSON.stringify(context)
                }
            }).then(function (result) {

                SignalRService.notifyMessageRead(commentId, $scope.recieverID);

            }).catch(function (err) {
                console.error('Error marking comment as read:', err);
            });
        };

        // Handle viewing of a message
        $scope.onMessageView = function (commentId) {
            const message = $scope.ChatMessages.find(msg => msg.CommentIID === commentId);

            // Ensure the message is only marked as read if it was sent by the other user
            if (message && !message.IsRead && message.FromLoginID !== $scope.LoginUserID) {
                $scope.MarkCommentAsRead(commentId); // Only call this if the message is from the other user
            }
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

        // Watch for changes in ChatMessages and scroll to the bottom
        // $scope.$watch('ChatMessages', function (newVal, oldVal) {
        //     if (newVal !== oldVal) {
        //         $timeout($scope.scrollToBottom, 100); // Delay to ensure new messages are rendered
        //     }
        // }, true);

        // Function to save a comment
        $scope.SaveComment = function (message, entityTypeId) {
            if (!message && !$scope.PhotoContentIID) {
                $translate(['ENTERYOURCOMMENT']).then(function (translation) {
                    $rootScope.ToastMessage = translation.ENTERYOURCOMMENT;
                    $rootScope.ShowLoader = false;
                    $('.toast').toast('show');
                });
                return;
            }
            $scope.isSaving = true;

            let fromLoginID = context.LoginID;
            let toLoginID = $scope.recieverID;
            let parentName = $scope.parentName;
            let parentCommentId = $scope.selectedCommentParentId || null;
  

            $http({
                url: `${CommunicationServiceUrl}/SaveComment`,
                method: 'POST',
                data: {
                    CommentText: message,
                    Username: parentName,
                    EntityType: 170,
                    ParentCommentID: parentCommentId,
                    ToLoginID: toLoginID,
                    FromLoginID: fromLoginID,
                    PhotoContentID : $scope.PhotoContentIID,
                    ReferenceID :  $scope.studentID,
                    
                    
                },
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            }).then(function (result) {
                $scope.isSaving = false;
                if (result.data && result.data.CommentIID) {
                    $scope.Message = ''; // Clear the input field
                    $scope.selectedParentId = null;
                    $scope.selectedCommentParentId = null;
                    $scope.ParentcommentText = '';
                    $rootScope.LastMessageCreatedDate = result.data.CreatedDate;
                    $scope.imagePreviewSrc = ''; 
                    $scope.PhotoContentIID = '';
                    $scope.lastCommentID = result.data.CommentIID;
                    $timeout($scope.scrollToBottom, 100);
                    SignalRService.sendMessage(result.data.CommentIID, fromLoginID, toLoginID, context.LoginID, message, result.data.ParentCommentID, result.data.ParentCommentText ,result.data.PhotoContentID , result.data.ReferenceID);
                } else {
                    $rootScope.ToastMessage = 'Comment submission failed';
                    $rootScope.ShowLoader = false;
                    $('.toast').toast('show');
                }
            }).catch(function () {
                $scope.isSaving = false;
                $translate(['PLEASETRYLATER']).then(function (translation) {
                    $rootScope.ToastMessage = translation.PLEASETRYLATER;
                    $rootScope.ShowLoader = false;
                    $('.toast').toast('show');
                });
            });
        };
        $scope.selectParentComment = function (parentId, parentcommentText) {
            $scope.selectedCommentParentId = parentId;
            $scope.ParentcommentText = parentcommentText;

        };
        $scope.clearSelectParentComment = function (parentId, parentcommentText) {
            $scope.selectedCommentParentId = null;
            $scope.ParentcommentText = '';

        };

        function GetParentDetailsByLoginID(loginID) {

            $http({
                method: "GET",
                url: CommunicationServiceUrl + "/GetParentDetailsByLoginID?loginID=" + loginID,
                headers: {
                    Accept: "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    CallContext: JSON.stringify(context),
                },
            }).success(function (result) {
                $scope.ParentDetails = result;
            }).error(function () {
            });

        };

        // Get chat messages with pagination and caching
        $scope.GetChatMessages = function (entityTypeId) {
            return new Promise((resolve, reject) => { // Wrap the function in a new Promise
                if ($scope.loading) return resolve(); // Prevent multiple calls while loading

                $scope.loading = true; // Set loading state
                const fromLoginID = context.LoginID;
                const toLoginID = $scope.recieverID;

                // Get the chat container
                var chatContainer = document.getElementById('kt_drawer_chat_messenger_body');

                // Save the current scroll position
                var currentScrollHeight = chatContainer.scrollHeight;

                $http({
                    url: `${CommunicationServiceUrl}/GetComments?entityTypeId=${entityTypeId}&fromLoginID=${fromLoginID}&toLoginID=${toLoginID}&page=${$scope.page}&pageSize=${$scope.pageSize}&studentID=${$scope.studentID}`,
                    method: 'GET',
                    headers: {
                        "Accept": "application/json;charset=UTF-8",
                        "CallContext": JSON.stringify(context)
                    }
                }).then(function (result) {
                    $scope.newComments = result.data;

                    // Only add unique comments
                        $scope.newComments.forEach(comment => {
                    // Format date only (no time) for comparison
                    const commentDate = new Date(comment.CreatedDate).toDateString();

                    // Only add unique messages
                    if (!$scope.ChatMessages.some(msg => msg.CommentIID === comment.CommentIID)) {
                        if (comment.ParentCommentID) {
                            let parent = $scope.ChatMessages.find(p => p.CommentIID === comment.ParentCommentID) ||
                                        $scope.newComments.find(p => p.CommentIID === comment.ParentCommentID);
                            comment.ParentComment = parent ? parent.CommentText : "Parent message not available";
                        }

                        // Determine display date label (Today, Yesterday, or date)
                        const today = new Date();
                        const yesterday = new Date();
                        yesterday.setDate(today.getDate() - 1);

                        if (commentDate === today.toDateString()) {
                            comment.DisplayDate = "Today";
                        } else if (commentDate === yesterday.toDateString()) {
                            comment.DisplayDate = "Yesterday";
                        } else {
                            comment.DisplayDate = commentDate; // e.g., "Mon May 20 2024"
                        }

                        $scope.ChatMessages.unshift(comment);
                    }
                });
                    $scope.newComments.forEach(function (message) {
                        if (!message.IsRead) {
                            $scope.onMessageView(message.CommentIID);
                        }
                    });

                          // Update the last comment ID
                    if ($scope.newComments.length > 0) {
                        $scope.lastCommentID = $scope.newComments[$scope.newComments.length - 1].CommentIID;
                    }

                    // Cache the messages
                    localStorage.setItem('cachedMessages', JSON.stringify($scope.ChatMessages));

                    // Increment page if new comments were loaded
                    if ($scope.newComments.length) {
                        $scope.page++;
                    }

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

                $scope.GetChatMessages(entityTypeId);
            }
        });

        
        angular.element(document).on('input', 'textarea[ng-model="Message"]', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
    });


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




        // Initialize the controller by loading chat messages
        $scope.init = function () {

            var entityTypeId = 170; // Example entity type
            $scope.GetChatMessages(entityTypeId).then(function () {
                if (chatContainer) {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            });
            GetParentDetailsByLoginID($scope.recieverID);

        };

        $scope.init();
    }
]);
