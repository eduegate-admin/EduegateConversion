app.controller('TimeTableController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', "$timeout", function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
    console.log('Time Table Controller loaded.');

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();

    $rootScope.ShowPreLoader = true;
    $rootScope.ShowLoader = true;

    $scope.StudentID = $stateParams.studentID;

    $scope.TimeTableMapping = [];



    $scope.init = function () {
        $scope.GetLookUpDatas();
        $scope.loadGlobalTimeTable();
    };

    $scope.GetLookUpDatas = function () {
        $http({
            method: 'Get',
            url: dataService + '/GetDynamicLookUpDataForMobileApp?lookType=TimeTable&defaultBlank=false',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).then(function (result) {
            $scope.TableMasterData = result.data;
        });

        //Classes
        $http({
            method: 'Get',
            url: dataService + "/GetDynamicLookUpDataForMobileApp?lookType=Classes&defaultBlank=false",
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).then(function (result) {
            $scope.Classes = result.data;
        });

        //Sections
        $http({
            method: 'Get',
            url: dataService + "/GetDynamicLookUpDataForMobileApp?lookType=AllSectionsFilter&defaultBlank=false",
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).then(function (result) {
            $scope.Sections = result.data;
        });

        //Week Days
        $http({
            method: 'Get',
            url: dataService + "/GetDynamicLookUpDataForMobileApp?lookType=WeekDay&defaultBlank=false",
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).then(function (result) {
            $scope.WeekDays = result.data;
        });

        //Class times
        $http({
            method: 'Get',
            url: dataService + "/GetDynamicLookUpDataForMobileApp?lookType=ClassTime&defaultBlank=false",
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).then(function (result) {
            $scope.ClassTime = result.data;
        });

    };

    $scope.GetTimeTableSlot = function (clasTime, day) {
        var slot = null;
        if ($scope.TimeTableMapping.length != 0) {
            var slot = $scope.TimeTableMapping[0].AllocInfoDetails.find(x => x.WeekDayID == day && x.ClassTimingID == clasTime.Key);
        }
        return slot ? slot.Subject.Value : '';
    }

    $scope.DayClick = function ($event) {
        $($event.currentTarget).closest('.Week').toggleClass('active');
    }

    //To load class-wise section and saved time tables
    $scope.loadGlobalTimeTable = function () {

        $http({
            method: 'Get',
            url: dataService + "/GetTimeTableByStudentID?studentID=" + $scope.StudentID,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {

            $timeout(function () {
                $scope.$apply(function () {
                    $scope.TimeTableMapping = result;
                });
            });

            $rootScope.ShowLoader = false;

        }).error(function () {
            $rootScope.ShowLoader = false;
        });
    }

    $scope.loadClasswiseSubject = function () {
        $scope.Subjects = [];
      $http({
    method: 'GET',
    url: dataService + "/GetSubjectsByStudentID",
    params: { studentID: $scope.StudentID },
    headers: { 'Content-Type': 'application/json;charset=utf-8' }
}).then(function(response) {
    var result = response.data;
    if (!result.IsError && result != null) {
        $scope.Subjects = result;
        $rootScope.ShowLoader = false;
    }
}, function(error) {
    // handle error if needed
}).finally(function() {
    // optional cleanup after success or error
});

    }

    $scope.init();

}]);