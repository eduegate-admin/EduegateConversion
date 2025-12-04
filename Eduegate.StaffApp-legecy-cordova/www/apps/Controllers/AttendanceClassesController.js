app.controller("AttendanceClassesController", [
  "$scope",
  "$http",
  "$state",
  "rootUrl",
  "$location",
  "$rootScope",
  "$stateParams",
  "GetContext",
  "$sce",
  function (
    $scope,
    $http,
    $state,
    rootUrl,
    $location,
    $rootScope,
    $stateParams,
    GetContext,
    $sce
  ) {
    console.log("Attendance Classes Controller loaded.");
    $scope.PageName = "Attendance Classes";

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();
    $scope.ContentService = rootUrl.ContentServiceUrl;

    $rootScope.ShowLoader = true;
    $rootScope.ShowPreLoader = true;

    $scope.TeacherClasses = [];

    $scope.Init = function () {
      $scope.LoadTeacherClassInfo();
    };

    $scope.LoadTeacherClassInfo = function () {
      $http({
        method: "GET",
        url: dataService + "/GetTeacherClass",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      })
        .success(function (result) {
          $scope.TeacherClasses = result;

          $rootScope.ShowLoader = false;
          $rootScope.ShowPreLoader = false;
        })
        .error(function (err) {
          $rootScope.ShowLoader = false;
          $rootScope.ShowPreLoader = false;
        });
    };

    $scope.LoadStudentInfo = function (classID, sectionID) {
      $scope.StudentDetails = [];
      $http({
        method: "GET",
        url:
          dataService +
          "/GetStudentsByTeacherClassAndSection?classID=" +
          classID +
          "&sectionID=" +
          sectionID,
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      })
        .success(function (result) {
          $scope.StudentDetails = result;

          $rootScope.ShowLoader = false;
          $rootScope.ShowPreLoader = false;
        })
        .error(function (err) {
          $rootScope.ShowLoader = false;
          $rootScope.ShowPreLoader = false;
        });
    };
    $scope.ExtractClassNumber = function (className) {
      const match = className.match(/\d+/); // Extracts the first number
      return match ? match[0] : className;
    };
$scope.ClassBgMap = {};

$scope.GetRandomBgClass = function (classID) {
    if (!$scope.ClassBgMap[classID]) {
        const bgClasses = ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-danger', 'bg-dark'];
        const index = Math.floor(Math.random() * bgClasses.length);
        $scope.ClassBgMap[classID] = bgClasses[index];
    }
    return $scope.ClassBgMap[classID];
};

    $scope.ClassStudentsAttendanceViewClick = function (classID, sectionID) {
      $state.go("attendancestudents", {
        classId: classID,
        sectionId: sectionID,
      });
    };
  },
]);
