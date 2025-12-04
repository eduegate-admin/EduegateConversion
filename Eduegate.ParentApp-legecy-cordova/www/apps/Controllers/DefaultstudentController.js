app.controller('DefaultstudentController', ['$scope', '$http', 'loggedIn', 'rootUrl',
'$location', 'GetContext', 'serviceCartCount',
'$state', '$stateParams', '$sce', '$rootScope', '$translate', '$timeout', '$q','$controller',
function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount,
    $state, $stateParams, $sce, $rootScope, $translate, $timeout, $q, $controller) {
        console.log('DefaultstudentController loaded.')
        var dataService = rootUrl.SchoolServiceUrl;
        var context = GetContext.Context();
        $scope.ContentService = rootUrl.ContentServiceUrl;


        $scope.init = function () {
            $rootScope.getDefaultStudent();

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
        };



        $scope.saveDefaultStudent = function(events, StudentID) {
            $scope.ShowLoader = true;

            $http({
                url: dataService + "/saveDefaultStudent?studentID=" + StudentID,
                method: 'POST',
                headers: { "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(GetContext.Context()) },
            }).then(function (result) {
                result = result.data;
            $rootScope.getDefaultStudent();

            }
            , function(err) {
                $scope.ShowLoader = false;
            });

        }






        $scope.init();
    }]);