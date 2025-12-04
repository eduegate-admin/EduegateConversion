app.controller('FeedbackController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', 'serviceCartCount', '$state', '$stateParams', '$sce', '$rootScope', '$translate', function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount, $state, $stateParams, $sce, $rootScope,  $translate) {
    var dataService = rootUrl.SchoolServiceUrl;


    var Context = GetContext.Context();
    $scope.Message = null;

    $scope.init = function () {
    }



    $scope.OptionClick = function () {
        $('.rightnav-cont').toggle();
    }

    $scope.LoadPage = function(id, element) {
      $rootScope.GetStaticPage(id).then(function(content) {
        $(element).html(content);
      });
    }

    $scope.SaveFeedback = function(message){
        if(!message) {
            $translate(['ENTERYOURSUGGESTIONORCOMMENTS']).then(function(translation){
                $rootScope.ShowToastMessage(translation.ENTERYOURSUGGESTIONORCOMMENTS, 'error');
           });
           return;
        }

        $http({
            url: dataService + '/CustomerFeedback',
            method: 'POST',
            data : {
                Message : message,
            },
            headers: { "Accept": "application/json;charset=UTF-8",
            "Content-type": "application/json; charset=utf-8",
             "CallContext": JSON.stringify(Context) },
        }).then(function (result) {
            if(result.data.operationResult == 1) {
                $scope.SuccessMessage = 'Send succcesfully'
                $rootScope.ShowToastMessage($scope.SuccessMessage, 'success');
            }
            else {
                $scope.ErrorMessage = 'Send Failed'
                $rootScope.ShowToastMessage($scope.ErrorMessage, 'error');
            }
        }, function (err) {
            $translate(['PLEASETRYLATER']).then(function (translation) {
                $rootScope.ShowToastMessage( translation.PLEASETRYLATER);
            });
        });
    }

    $scope.init();
  }]);