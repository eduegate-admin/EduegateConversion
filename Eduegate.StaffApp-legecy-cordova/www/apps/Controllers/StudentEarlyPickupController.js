app.controller("StudentEarlyPickupController", [
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
    console.log("StudentEarlyPickup Controller loaded.");
    $scope.PageName = "Early Pickup Requests";

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
    $scope.isCollapsed = function ($event, classData) {
      const accordionElement = $event.target.closest(".accordion-button");
      const isCollapsed = accordionElement.classList.contains("collapsed");

      if (!isCollapsed) {
        var date = new Date().toISOString().split("T")[0];
        $scope.LoadPickupRequests(classData, classData.ClassID, classData.SectionID ,date);
      }
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


    $scope.LoadPickupRequests = function (classData, classID, sectionID, date) {

      $http({
        method: "GET",
        url:
          dataService +
          "/GetPickupRequestsByClassSectionDate?classID=" +
          classID + "&sectionID=" + sectionID + "&date=" + date,
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      })
        .success(function (result) {
          classData.PickupRequests = result;

          $rootScope.ShowLoader = false;
          $rootScope.ShowPreLoader = false;
        })
        .error(function (err) {
          $rootScope.ShowLoader = false;
          $rootScope.ShowPreLoader = false;
        });
    };

  },
]);
