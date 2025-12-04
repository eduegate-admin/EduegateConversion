app.controller('ProfileController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', 'serviceCartCount', '$state', '$stateParams', '$sce', '$rootScope', function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount, $state, $stateParams, $sce, $rootScope) {

    var schoolService = rootUrl.SchoolServiceUrl;
    var dataService = rootUrl.RootUrl;

    var context = GetContext.Context();

    $scope.SaveForLaterCount = 0;
    $scope.ShoppingCartCount = 0;
    $scope.ContentService = rootUrl.ContentServiceUrl;

    $scope.NewComment = "";
    $rootScope.ShowLoader = false;

    console.log('Profile Controller loaded.');


    $scope.AllergyForm = [
        ward = [
            allergy = [
                Severity = {}
            ]
        ]
    ];

    $scope.forceUnknownOption = function () {
        $scope.data.singleSelect = 'nonsense';
    };


    $scope.init = function () {
        $scope.GetUserDetail();

        $http({
            method: 'GET',
            url: schoolService + '/GetMyStudents',
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
        $scope.GetSeverity();


    }

    $scope.GetUserDetail = function () {
        $rootScope.ShowLoader = true;
        $http({
            method: 'GET',
            url: dataService + '/GetUserDetails',
            headers: {
                "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(context)
            }
        }).then(function (result) {
            $scope.UserDetail = result.data;
            $rootScope.ShowLoader = false;

        }, function (err) {
            $rootScope.ShowLoader = false;

        });
    }

    $scope.GetAllergies = function () {
        $http({
            method: 'GET',
            url: schoolService + '/GetAllergies',
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

    $scope.GetSeverity = function () {
        $http({
            method: 'GET',
            url: schoolService + '/GetSeverity',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            $scope.Severity = result;
            $rootScope.ShowLoader = false;
        });
    }

    $scope.GetStudentAllergies = function () {
        $http({
            method: 'GET',
            url: schoolService + '/GetStudentAllergies',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            $scope.StudentAllergies = result;
            $rootScope.ShowLoader = false;
        });
    }

    $scope.SaveAllergies = function (event, StudentID, allergyID, severityID) {
        $scope.ShowLoader = true;

        $http({
            url: schoolService + "/SaveAllergies?studentID=" + StudentID + "&allergyID=" + allergyID + "&severityID=" + severityID.Key,
            method: 'POST',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            },
            // data: {
            //     studentID : StudentID,
            //     allergyID : modelAllergies.Key,
            // }
        }).then(function (result) {
            result = result.data;
            if (result.operationResult == 1) {

                $rootScope.SuccessMessage = result.Message;
                const toastLiveExample = document.getElementById('liveToast')
                const toast = new bootstrap.Toast(toastLiveExample, {
                    delay: 2000,
                })

                toast.show()
                $scope.GetStudentAllergies()
            }
            if ($rootScope.ShowLoader == true) {
                $rootScope.ShowLoader = false;
            }

        }, function (err) {
            $scope.ShowLoader = false;
        });
    }

    $scope.init();

}]);