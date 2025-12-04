app.factory('SignalRService', ['$rootScope', 'rootUrl', 'GetContext', function ($rootScope, rootUrl, GetContext) {
    var SignalRhubURL = rootUrl.SignalRhubURL;
    var context = GetContext.Context();
    const userId = context.LoginID;
    // Define the connection with automatic reconnect
    var connection = new signalR.HubConnectionBuilder()
        .withUrl(SignalRhubURL + '/chathub?userId='+ userId
            , {
                withCredentials: false
            })
        .withAutomaticReconnect([0, 2000, 5000, 10000]) // Custom reconnect intervals
        .build();

    // Start the connection and retry on failure
    function startConnection() {
        return connection.start()
            .then(function () {
                console.log('Connected to SignalR');
            })
            .catch(function (err) {
                console.error('SignalR connection failed: ', err.toString());
                // Retry connection after 5 seconds if the start fails
                return setTimeout(startConnection, 5000);
            });
    }

    // Start the connection initially
    var startedPromise = startConnection();

    // Event: Connection is lost and reconnecting attempts start
    connection.onreconnecting(function (error) {
        console.warn('SignalR connection lost, attempting to reconnect...', error);
        $rootScope.$apply(function () {
            $rootScope.$broadcast('SignalRReconnecting');
        });
    });

    // Event: Reconnected successfully
    connection.onreconnected(function (connectionId) {
        console.log('SignalR reconnected successfully. Connection ID:', connectionId);
        $rootScope.$apply(function () {
            $rootScope.$broadcast('SignalRReconnected');
        });
    });

    // Event: All reconnection attempts failed and connection is closed
    connection.onclose(function (error) {
        console.error('SignalR connection closed permanently:', error);
        $rootScope.$apply(function () {
            $rootScope.$broadcast('SignalRDisconnected');
        });
        // Optionally, try restarting the connection after a delay
        setTimeout(startConnection, 10000); // Retry after 10 seconds
    });

    // Listen for incoming messages
    connection.on("ReceiveMessage", function (commentId, fromLoginId, toLoginId, CreatedBy, message, isRead,parentCommentId, parentCommentText,photoContentID ,referenceID) {
        $rootScope.$apply(function () {
            $rootScope.$broadcast('NewMessageReceived', {
                commentId: commentId,
                fromLoginId: fromLoginId,
                toLoginId: toLoginId,
                CreatedBy: CreatedBy,
                message: message,
                isRead: isRead,
                parentCommentId: parentCommentId, // Include parent comment ID
                parentCommentText: parentCommentText ,// Include parent comment text
                photoContentID: photoContentID,
                referenceID : referenceID

            });
        });
    });



    // Listen for Teacher List updates
    connection.on("TeacherListUpdated", function (parentLoginId) {
        $rootScope.$apply(function () {
            $rootScope.$broadcast('TeacherListUpdated', {
                parentLoginId: parentLoginId
            });
        });
    });

    // Listen for Message Read event
    connection.on("MessageRead", function (commentId, toLoginId , isRead) {
        $rootScope.$apply(function () {
            $rootScope.$broadcast('MessageRead', {
                commentId: commentId,
                toLoginId: toLoginId,
                isRead: isRead
            });
        });
    });


    return {
        sendMessage: function (commentId, fromLoginId, toLoginId, CreatedBy, message,ParentCommentID,parentCommentText, photoContentID , referenceID) {
            startedPromise.then(function () {
                return connection.invoke("SendMessage", commentId, fromLoginId, toLoginId, CreatedBy, message, false ,ParentCommentID,parentCommentText ,photoContentID, referenceID);
            }).catch(function (err) {
                return console.error('SignalR send message failed:', err.toString());
            });
        },
        notifyMessageRead: function (commentId, receiverId) { // Add notifyMessageRead function here
            startedPromise.then(function () {
                return connection.invoke("NotifyMessageRead", commentId, receiverId)
                    .catch(function (err) {
                        console.error("SignalR error notifying read status:", err);
                    });
            });
        }
    };
}]);
