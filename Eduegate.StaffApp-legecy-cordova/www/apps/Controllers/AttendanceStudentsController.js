

app.controller('AttendanceStudentsController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce) {
    console.log('AttendanceStudentsController loaded.');
    $scope.PageName = "Today's Attendance";

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();
      $scope.ContentService = rootUrl.ContentServiceUrl;

    $rootScope.ShowLoader = true;
    $rootScope.ShowPreLoader = true;

    $scope.TeacherClasses = [];
        $scope.classID = parseInt($stateParams.classId);
        $scope.sectionID = parseInt($stateParams.sectionId);


    $scope.Init = function () {
        $scope.LoadStudentInfo($scope.classID , $scope.sectionID);
    }

    

   
    $scope.LoadStudentInfo = function (classID, sectionID) {
        $scope.StudentDetails = [];
        $http({
            method: 'GET',
            url: dataService + '/GetStudentAttendanceForTodayByClassAndSection?classID=' + classID + '&sectionID=' + sectionID,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            $scope.Students = result;

            $rootScope.ShowLoader = false;
            $rootScope.ShowPreLoader = false;
        }).error(function (err) {
            $rootScope.ShowLoader = false;
            $rootScope.ShowPreLoader = false;
        });

    }

    $scope.StudentsAttendanceDetailsViewClick = function (studentID, studentName) {
        $state.go("attendancestudentdetail", {studentID: studentID,studentName: studentName});
    }
    $scope.Init();


}]);