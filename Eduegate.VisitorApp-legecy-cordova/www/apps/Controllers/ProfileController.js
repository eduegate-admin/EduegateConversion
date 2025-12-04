app.controller('ProfileController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', 'serviceCartCount', '$state', '$stateParams', '$sce', '$rootScope', function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount, $state, $stateParams, $sce, $rootScope) {

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();
    $scope.SaveForLaterCount = 0;
    $scope.ShoppingCartCount = 0;

    $scope.NewComment = "";
    $rootScope.ShowLoader = false;
    console.log('Prifile Controller loaded.');

    $scope.data = {
        multipleSelect: [],
        option1: 'option-1'
       };
    
       $scope.forceUnknownOption = function() {
         $scope.data.singleSelect = 'nonsense';
       };


    var Context = GetContext.Context();
    $scope.init = function() {
        $http({
            method: 'GET',
            url: dataService + '/GetMyStudents',
            headers: { 
                "Accept": "application/json;charset=UTF-8", 
                "Content-type": "application/json; charset=utf-8", 
                "CallContext": JSON.stringify(context) 
            }
        }).success(function (result) {
            $scope.MyWards = result;
            $scope.SelectedWard = $scope.MyWards[0];
            $rootScope.ShowLoader = false;
   
        });

        $scope.GetAllergies();
        $scope.GetStudentAllergies();
        
    }
    

    $scope.GetAllergies = function() {
        $http({
            method: 'GET',
            url: dataService + '/GetAllergies',
            headers: { 
                "Accept": "application/json;charset=UTF-8", 
                "Content-type": "application/json; charset=utf-8", 
                "CallContext": JSON.stringify(context) 
            }
        }).success(function (result) {
            $scope.Allergies = result;
            $rootScope.ShowLoader = false;
            
   
        });
    }


    $scope.GetStudentAllergies = function() {
        $http({
            method: 'GET',
            url: dataService + '/GetStudentAllergies',
            headers: { 
                "Accept": "application/json;charset=UTF-8", 
                "Content-type": "application/json; charset=utf-8", 
                "CallContext": JSON.stringify(context) 
            }
        }).success(function (result) {
            $scope.GetStudentAllergies = result;
            $rootScope.ShowLoader = false;
            
   
        });
    }

    $scope.SaveAllergies = function(events, StudentID, modelAllergies) {
        $scope.ShowLoader = true;

        $http({
            url: dataService + "/SaveAllergies?studentID=" + StudentID + "&allergyID=" + modelAllergies.Key,
            method: 'POST',
            headers: { "Accept": "application/json;charset=UTF-8", 
                "Content-type": "application/json; charset=utf-8", 
                "CallContext": JSON.stringify(GetContext.Context()) },
            // data: {
            //     studentID : StudentID,
            //     allergyID : modelAllergies.Key,
            // }
        }).then(function (result) {
            result = result.data;
            if (result.operationResult == 1) {
                
                $rootScope.SuccessMessage = result.Message;
                const toastLiveExample = document.getElementById('liveToast')
                const toast = new bootstrap.Toast(toastLiveExample , {
                    delay:2000,
                })

                toast.show()
            }
            if ($rootScope.ShowLoader == true) {
                $rootScope.ShowLoader = false;
            }
 
        }
        , function(err) {
     
            $scope.ShowLoader = false;
        });
    }


    $scope.init();
    
}]);