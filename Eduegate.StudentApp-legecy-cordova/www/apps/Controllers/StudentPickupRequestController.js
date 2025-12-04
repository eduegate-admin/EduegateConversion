app.controller("StudentPickupRequestController", ["$scope", "$http", "$state", "rootUrl", "$location", "$rootScope", "$stateParams", "GetContext", "$sce", "$timeout", "$q", function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout, $q) {
  console.log("Student pickup request controller loaded.");

  var dataService = rootUrl.SchoolServiceUrl;
  var context = GetContext.Context();

  $scope.StudentPickupRequest = {};

  $scope.Students = [];
  $scope.StudentPickedBy = [];

  $scope.init = function () {

    $rootScope.ShowLoader = true;
    $scope.ShowPreLoader = true;

    $q.all([
      GetStudentsList(),
      GetPickedByList(),
      GetParentDetails(),
    ]).then(function () {
      $rootScope.ShowLoader = false;
      $scope.ShowPreLoader = false;
    });

  };

  function GetStudentsList() {
    return $q(function (resolve, reject) {

      $http({
        method: "GET",
        url: dataService + "/GetParentStudents",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).success(function (result) {

        $timeout(function () {
          result.forEach(x => {
            $scope.Students.push({
              "Key": x.StudentIID,
              "Value": x.AdmissionNumber + " - " + x.FirstName + " " + (x.MiddleName != null ? (x.MiddleName + " ") : "") + x.LastName,
            });
          })
          resolve();
        }, 1000);

      }).error(function () {
        $rootScope.ShowLoader = false;
        $scope.ShowPreLoader = false;
      });

    });
  };

  function GetPickedByList() {
    return $q(function (resolve, reject) {

      $http({
        method: "GET",
        url: dataService + '/GetDynamicLookUpDataForMobileApp?lookType=StudentPickedBy&defaultBlank=false',
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).success(function (result) {

        $timeout(function () {
          $scope.StudentPickedBy = result;

          resolve();
        }, 1000);

      }).error(function () {
        $rootScope.ShowLoader = false;
        $scope.ShowPreLoader = false;
      });

    });
  };

  function GetParentDetails() {
    return $q(function (resolve, reject) {

      $http({
        method: "GET",
        url: dataService + '/GetGuardianDetails',
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).success(function (result) {

        $timeout(function () {
          $scope.$apply(function () {
            $scope.ParentDetails = result;
          });

          resolve();
        }, 1000);

      }).error(function () {
        $rootScope.ShowLoader = false;
        $scope.ShowPreLoader = false;
      });

    });
  };

  $scope.PickedByChanges = function (pickupRequest) {

    $scope.StudentPickupRequest.PickedByID = pickupRequest.PickedByID;

    var pickedBy = $scope.StudentPickedBy.find(p => p.Key == pickupRequest.PickedByID);

    pickupRequest.PickedBy = {
      "Key": pickedBy.Key,
      "Value": pickedBy.Value,
    }

    if (pickupRequest.PickedBy.Value == "Father") {
      pickupRequest.FirstName = $scope.ParentDetails.FatherFirstName;
      pickupRequest.MiddleName = $scope.ParentDetails.FatherMiddleName;
      pickupRequest.LastName = $scope.ParentDetails.FatherLastName;
    }
    else if (pickupRequest.PickedBy.Value == "Mother") {
      pickupRequest.FirstName = $scope.ParentDetails.MotherFirstName;
      pickupRequest.MiddleName = $scope.ParentDetails.MotherMiddleName;
      pickupRequest.LastName = $scope.ParentDetails.MotherLastName;
    }
    else if (pickupRequest.PickedBy.Value == "Guardian") {
      pickupRequest.FirstName = $scope.ParentDetails.GuardianFirstName;
      pickupRequest.MiddleName = $scope.ParentDetails.GuardianMiddleName;
      pickupRequest.LastName = $scope.ParentDetails.GuardianLastName;
    }
    else if (pickupRequest.PickedBy.Value == "Visitor") {
      pickupRequest.FirstName = null;
      pickupRequest.MiddleName = null;
      pickupRequest.LastName = null;

    }
    else {
      pickupRequest.FirstName = null;
      pickupRequest.MiddleName = null;
      pickupRequest.LastName = null;
    }
  };

  $scope.SubmitStudentPickupRequest = function () {

    $rootScope.ShowLoader = true;

    var pickupRequest = $scope.StudentPickupRequest;

    if (pickupRequest != null) {

      if (pickupRequest.PickedDateString == undefined || pickupRequest.PickedDateString == null) {
        $rootScope.ShowToastMessage("Date is required", 'error');
        $rootScope.ShowLoader = false;
        return false;
      }
      else if (pickupRequest.FromTimeString == undefined || pickupRequest.FromTimeString == null) {
        $rootScope.ShowToastMessage("From time is required", 'error');
        $rootScope.ShowLoader = false;
        return false;
      }
      else if (pickupRequest.StudentID == undefined || pickupRequest.StudentID == null) {
        $rootScope.ShowToastMessage("Student is required", 'error');
        $rootScope.ShowLoader = false;
        return false;
      }
      else if (pickupRequest.PickedByID == undefined || pickupRequest.PickedByID == null) {
        $rootScope.ShowToastMessage("Picked by is required", 'error');
        $rootScope.ShowLoader = false;
        return false;
      }
      else if (pickupRequest.FirstName == undefined || pickupRequest.FirstName == null) {
        $rootScope.ShowToastMessage("First name is required", 'error');
        $rootScope.ShowLoader = false;
        return false;
      }

      var requestDateString = pickupRequest.RequestDateString != null ? moment(pickupRequest.RequestDateString).format("DD/MM/YYYY") : null;

      var pickedDateString = pickupRequest.PickedDateString != null ? moment(pickupRequest.PickedDateString).format("DD/MM/YYYY") : null;

      $http({
        method: 'POST',
        url: dataService + '/SubmitStudentPickupRequest',
        data: {
          'StudentPickupRequestIID': pickupRequest.StudentPickupRequestIID != undefined || pickupRequest.StudentPickupRequestIID != null ? pickupRequest.StudentPickupRequestIID : 0,
          'StudentID': pickupRequest.StudentID,
          'RequestStringDate': requestDateString,
          'PickStringDate': pickedDateString,
          'PickedByID': pickupRequest.PickedByID,
          'FirstName': pickupRequest.FirstName,
          'MiddleName': pickupRequest.MiddleName,
          'LastName': pickupRequest.LastName,
          'AdditionalInfo': pickupRequest.AdditionalInfo,
          'FromStringTime': pickupRequest.FromTimeString,
          'ToStringTime': pickupRequest.ToTimeString,
          'RequestStatusID': pickupRequest.RequestStatusID,
        },
        headers: {
          "Accept": "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          "CallContext": JSON.stringify(context)
        },
      }).success(function (result) {
        if (result.operationResult == 2) {

          $rootScope.ShowToastMessage("Saving failed!", 'error');

        } else if (result.operationResult == 1) {

          $rootScope.ShowToastMessage(result.Message, 'success');

          $scope.StudentPickupRequest = {};

        }
        $rootScope.ShowLoader = false;
      }).error(function (err) {
        $rootScope.ShowToastMessage("Something went wrong, please try again later!", 'error');
        $rootScope.ShowLoader = false;
      });
    }
    else {
      $rootScope.ShowToastMessage("Fill all fields !", 'error');
      $rootScope.ShowLoader = false;
      return false;
    }

  };

  $scope.ClearClick = function () {

    $scope.StudentPickupRequest = null

  };

}]);