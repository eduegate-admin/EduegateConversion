app.controller('MessageController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', "$timeout", '$translate', 'SignalRService', '$element','$q',
    function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout, $translate, SignalRService, $element,$q) {
        console.log('MessageController loaded.');
        $scope.PageName = "Message";

        var dataService = rootUrl.SchoolServiceUrl;
        var context = GetContext.Context();
        $scope.ContentService = rootUrl.ContentServiceUrl;
        var CommunicationServiceUrl = rootUrl.CommunicationServiceUrl;
        $scope.recieverID = parseInt($stateParams.RecieverID);
        $scope.employeeName = $stateParams.EmployeeName;
        $scope.studentID = parseInt($stateParams.StudentID);
        $scope.admissionNumber = $stateParams.AdmissionNumber;
        $scope.studentName = $stateParams.StudentName;
        $scope.LoginUserID = context.LoginID;
        $scope.ChatMessages = JSON.parse(localStorage.getItem('cachedMessages')) || [];

        $scope.ChatMessages = []; // Array to hold chat messages
        $scope.selectedCommentParentId = null;
        $scope.ParentcommentText = "";
        $scope.page = 1;
        $scope.pageSize = 20;
        $scope.loading = false; // Track loading status
        $scope.PhotoContentIID = ''
        $scope.lastCommentID = null;
        $scope.imagePreviewSrc = '';

        // Listen for new messages from SignalR
        $scope.$on('NewMessageReceived', function (event, data) {
            $timeout(function () {
                $scope.onRealTimeMessageView(data);


                if (!$scope.ChatMessages.some(function (message) {
                    return message.CommentIID === data.commentId;
                })) {
                    if ((data.toLoginId === $scope.recieverID || data.fromLoginId === $scope.recieverID) &&data.referenceID === $scope.studentID) {
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
                            PhotoContentID: data.photoContentID
                        });
                    }
                }
                $timeout($scope.scrollToBottom, 100);

            });
        });

        $scope.onRealTimeMessageView = function (message) {
            if (message && !message.isRead && message.fromLoginId !== $scope.LoginUserID) {
                $scope.MarkCommentAsRead(message.commentId); // Only call this if the message is from the other user
            }
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


        // Scroll to bottom of chat container
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
        //         $timeout(function () {
        //             $scope.scrollToBottom();
        //         }, 100);  // Delay to ensure new messages are rendered
        //     }
        // }, true);

        // Save a comment
        $scope.SaveComment = function (message) {
            if (!message && !$scope.PhotoContentIID) {
                $translate(['ENTERYOURCOMMENT']).then(function (translation) {
                    $rootScope.ShowToastMessage(translation.ENTERYOURCOMMENT);
                });
                return;
            }
            let fromLoginID = context.LoginID;
            let toLoginID = $scope.recieverID;
            let employeeName = $scope.employeeName;
            let parentCommentId = $scope.selectedCommentParentId || null;

            $http({
                url: CommunicationServiceUrl + '/SaveComment',
                method: 'POST',
                data: {
                    CommentText: message,
                    Username: employeeName,
                    EntityType: 170,
                    ParentCommentID: parentCommentId,
                    ToLoginID: toLoginID,
                    FromLoginID: fromLoginID,
                    PhotoContentID: $scope.PhotoContentIID,
                    ReferenceID :  $scope.studentID,
                    ReferenceID: $scope.studentID,                     
                    StudentName: $scope.studentName,                  
                    AdmissionNumber: $scope.admissionNumber     

                },
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            }).then(function (result) {
                if (result.data && result.data.CommentIID) {
                    $scope.ChatMessage = ''; // Clear the input field
                    $scope.selectedParentId = null;

                    $scope.selectedCommentParentId = null;
                    $scope.ParentcommentText = '';
                    $scope.imagePreviewSrc = ''; 
                    $scope.PhotoContentIID = ''

                    $scope.lastCommentID = result.data.CommentIID;
                    $rootScope.LastMessageCreatedDate = result.data.CreatedDate;

                    $timeout($scope.scrollToBottom, 100);

                    SignalRService.sendMessage(result.data.CommentIID, fromLoginID, toLoginID, context.LoginID, message, result.data.ParentCommentID, result.data.ParentCommentText,result.data.PhotoContentID ,result.data.ReferenceID);
                } else {
                    $rootScope.ShowToastMessage('Comment submission failed', 'error');
                }
            }, function () {
                $translate(['PLEASETRYLATER']).then(function (translation) {
                    $rootScope.ShowToastMessage(translation.PLEASETRYLATER, 'error');
                });
            });
        };
        $scope.selectParentComment = function (parentId, parentcommentText) {
            $scope.selectedCommentParentId = parentId;
            $scope.ParentcommentText = parentcommentText;

        };

        // Retrieve chat messages
        $scope.GetChatMessages = function (entityTypeId) {
            return new Promise((resolve, reject) => { // Wrap the function in a new Promise
                if ($scope.loading) return resolve(); // Prevent multiple calls while loading

                $scope.loading = true; // Set loading state
                let fromLoginID = context.LoginID;
                let toLoginID = $scope.recieverID;


                if (fromLoginID > toLoginID) {
                    [fromLoginID, toLoginID] = [toLoginID, fromLoginID]; // Swap to ensure correct order
                }
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
                    // $scope.ChatMessages = result.data;
                    // Mark unread messages as read
                    $scope.ChatMessages.forEach(function (message) {
                        if (!message.IsRead) {
                            $scope.MarkCommentAsRead(message.CommentIID);
                        }
                    });
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
                        $rootScope.ShowToastMessage(translation.PLEASETRYLATER, 'error');
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

        // Listen for 'MessageRead' event from SignalR
        $scope.$on('MessageRead', function (event, data) {
            $timeout(function () {
                $scope.ChatMessages.forEach(function (message) {
                    // Check if this is the MessageRead and is  from the current user
                    if (message.CommentIID === data.commentId ) {
                        message.IsRead = true;
                    }
                });
            });
        });

        $scope.$on('SignalRReconnecting', function () {
            console.warn('Reconnecting to SignalR...');
            $rootScope.ShowToastMessage('Reconnecting to chat...', 'warning');
        });

        $scope.$on('SignalRReconnected', function () {
            console.log('Reconnected to SignalR!');
            $rootScope.ShowToastMessage('Reconnected to chat', 'success');
        });

        $scope.$on('SignalRDisconnected', function () {
            console.error('SignalR connection lost. Will attempt to reconnect.');
            $rootScope.ShowToastMessage('Connection lost. Retrying...', 'error');
        });

        $scope.GetIsEnableCommunication = function () {
            $http({
                url: CommunicationServiceUrl + '/GetIsEnableCommunication?loginID=' + $scope.recieverID,
                method: "GET",
                headers: {
                    Accept: "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    CallContext: JSON.stringify(context),
                },
            }).then(function (result) {
                if (result && result.data !== null) {
                    $scope.IsTeacherAvailableForCommunication = result.data; // This will be true or false

                    // Check if communication is enabled
                    if (!$scope.IsTeacherAvailableForCommunication) {
                        // If false, show message that teacher is not available for communication
                        $translate(['TEACHERNOTAVAILABLEFORCHAT']).then(function (translation) {
                            $rootScope.ShowToastMessage(translation.TEACHERNOTAVAILABLEFORCHAT);
                        });
                        $scope.isMessageSendingEnabled = false;
                        return;
                    }

                    // Proceed with the communication setup if communication is enabled (true)
                    $scope.isMessageSendingEnabled = true;

                } else {
                    console.error("Teacher not found or no data returned.");
                }
            }).catch(function (error) {
                console.error("Error checking communication status:", error);
            });
        };


        angular.element(document).on('input', 'textarea[ng-model="ChatMessage"]', function () {
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
                destinationType: Camera.DestinationType.DATA_URL
            });

            function onSuccess(imageData) {

                $scope.$apply(function() {
                    $scope.imagePreviewSrc = imageData;
                });
                var fileName = $scope.recieverID + "_" + $scope.lastCommentID + ".jpg";
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
                var fileName = $scope.recieverID + "_" + $scope.lastCommentID + ".jpg";

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
            $scope.GetIsEnableCommunication()
            var entityTypeId = 170; // Example entity type

            $scope.GetChatMessages(entityTypeId).then(function () {
                if (chatContainer) {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            });
        };

        $scope.init();
    }
]);
