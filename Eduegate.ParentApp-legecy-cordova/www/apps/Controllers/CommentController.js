app.controller('CommentController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', 
    'serviceCartCount', '$state', '$stateParams', '$sce', '$rootScope', '$timeout', '$translate',
        function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount, 
            $state, $stateParams, $sce, $rootScope, $timeout,  $translate) {
    var dataService = rootUrl.RootUrl;
    var Context = GetContext.Context();
    $scope.Comments = [];
    $scope.NewComment = "";
    $scope.HeadID = null;
    $scope.ShowLoader = false;

    $scope.init = function () {
        $scope.GetShoppingCartCount();  
    }
  
    $scope.GetShoppingCartCount = function () {
        var cartPromise = serviceCartCount.getProductCount(Context, dataService);
        cartPromise.then(function (result) {
            $scope.ShoppingCartCount = result;
        }, function() {
            
      });  
    }  
  
    $scope.GetComments = function (headID) {
        $scope.ShowLoader = true;
        $scope.NewComment = '';
        $scope.HeadID = headID;        
        $http({
            url: rootUrl.EcommerceServiceUrl + "/GetComments?entityTypeID=5&referenceID=" + headID,
            method: 'GET',
            headers: { "Accept": "application/json;charset=UTF-8", 
                "Content-type": "application/json; charset=utf-8", 
                "CallContext": JSON.stringify(GetContext.Context()) },
        }).then(function (result) {
            result = result.data;
            $scope.Comments = result; 
            $scope.ShowLoader = false;
        }
        , function(err) {
            $scope.ShowLoader = false;
        });
    }   

    $scope.SaveComment = function(commentText) {
        $scope.ShowLoader = true;

        $http({
            url: rootUrl.EcommerceServiceUrl + "/SaveComment",
            method: 'POST',
            headers: { "Accept": "application/json;charset=UTF-8", 
                "Content-type": "application/json; charset=utf-8", 
                "CallContext": JSON.stringify(GetContext.Context()) },
            data: {
                EntityType : 5,
                ReferenceID : $scope.HeadID,
                CommentText : commentText,
                Username : Context.LoginEmailID
            }
        }).then(function (result) {
            result = result.data;

            $translate(['COMMENTSUCCESS']).then(function(translation){
                $rootScope.ShowToastMessage( translation.COMMENTSUCCESS, 'success');
            }); 

            $scope.GetComments($scope.HeadID);
            $scope.ShowLoader = false;
        }
        , function(err) {
            $translate(['PLEASETRYLATER']).then(function(translation){
                $rootScope.ShowToastMessage( translation.PLEASETRYLATER);
            });
            $scope.ShowLoader = false;
        });
    }
       
    $scope.init();
  }]);