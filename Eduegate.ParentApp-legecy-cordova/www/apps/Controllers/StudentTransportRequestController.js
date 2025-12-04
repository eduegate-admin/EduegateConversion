app.controller("StudentTransportRequestController", [
  "$scope",
  "$http",
  "rootUrl",
  "GetContext",
  "$stateParams",
  "$rootScope",
  "$state",
  "$window",
  "$sce", // 👈 Add this
  function (
    $scope,
    $http,
    rootUrl,
    GetContext,
    $stateParams,
    $rootScope,
    $state,
    $window,
    $sce // 👈 And here
  ) {
    var dataService = rootUrl.SchoolServiceUrl;
    var appDataUrl = rootUrl.RootUrl;
    var context = GetContext.Context();
    $scope.Applications = [];
    $scope.ContactTypes = [];

    $scope.TransportApplctnStudentMapIID =
      $stateParams.TransportApplctnStudentMapIID
        ? parseInt($stateParams.TransportApplctnStudentMapIID)
        : 0;

    $scope.init = function () {
      $scope.GetSettingValues().then(function () {
        $scope.GetTransprtRulesAndRegulationsDetails();
      });
      $scope.GetLookUpDatas();
      $scope.getContactTypes();
      $scope.GetStudentDetailsForTransportApplication();
    };
    $scope.SubmitTransportApplicationClick = function () {
       var isStudentSelected = $scope.Applications.TransportApplicationStudentMaps.some(function(student) {
        return student.CheckBoxStudent;
      });

      if (!isStudentSelected) {
        $rootScope.ShowToastMessage("Please select at least one student by ticking the checkbox.", "error");
        return false;
      }
      if (!validateEmail($("#EmergencyEmailID").val())) {
        $("#EmergencyEmailID").focus();
        $(this).prop("disabled", false);
        $rootScope.ShowToastMessage(
          "Please provide an emergency email address or ensure the format is correct.",
          "error"
        );
        return false;
      }

      if (
        $("#EmergencyContactNumber").val() == null ||
        $("#EmergencyContactNumber").val() == ""
      ) {
        $("#EmergencyContactNumber").focus();
        $(this).prop("disabled", false);
        $rootScope.ShowToastMessage(
          "Please fill emergency contact number",

          "error"
        );
        return false;
      } else if (
        $("#LocationName").val() == null ||
        $("#LocationName").val() == ""
      ) {
        $("#LocationName").focus();
        $(this).prop("disabled", false);
        return false;
      } else if (
        $("#Building_FlatNo").val() == null ||
        $("#Building_FlatNo").val() == ""
      ) {
        $("#Building_FlatNo").focus();
        $(this).prop("disabled", false);
        return false;
      } else if ($("#StreetNo").val() == null || $("#StreetNo").val() == "") {
        $("#StreetNo").focus();
        $(this).prop("disabled", false);
        return false;
      } else if ($("#ZoneNo").val() == null || $("#ZoneNo").val() == "") {
        $("#ZoneNo").focus();
        $(this).prop("disabled", false);
        return false;
      } else if (
        (document.getElementById("IsMedicalCondition").checked &&
          $("#Remarks").val() == null) ||
        (document.getElementById("IsMedicalCondition").checked &&
          $("#Remarks").val() == "")
      ) {
        $("#Remarks").focus();
        $(this).prop("disabled", false);
        $rootScope.ShowToastMessage(
          "Please Explian about Medical Condition",
          "error"
        );
        return false;
      } else if (
        (document.getElementById("IsRouteDifferent").checked &&
          $("#LocationName_Drop").val() == null) ||
        (document.getElementById("IsRouteDifferent").checked &&
          $("#LocationName_Drop").val() == "")
      ) {
        $("#LocationName_Drop").focus();
        $(this).prop("disabled", false);
        $rootScope.ShowToastMessage("This is a required field", "error");
        return false;
      } else if (
        (document.getElementById("IsRouteDifferent").checked &&
          $("#BuildingNo_Drop").val() == null) ||
        (document.getElementById("IsRouteDifferent").checked &&
          $("#BuildingNo_Drop").val() == "")
      ) {
        $("#BuildingNo_Drop").focus();
        $(this).prop("disabled", false);
        $rootScope.ShowToastMessage("This is a required field", "error");
        return false;
      } else if (
        (document.getElementById("IsRouteDifferent").checked &&
          $("#StreetNo_Drop").val() == null) ||
        (document.getElementById("IsRouteDifferent").checked &&
          $("#StreetNo_Drop").val() == "")
      ) {
        $("#StreetNo_Drop").focus();
        $(this).prop("disabled", false);
        $rootScope.ShowToastMessage("This is a required field", "error");
        return false;
      } else if (
        (document.getElementById("IsRouteDifferent").checked &&
          $("#ZoneNo_Drop").val() == null) ||
        (document.getElementById("IsRouteDifferent").checked &&
          $("#ZoneNo_Drop").val() == "")
      ) {
        $("#ZoneNo_Drop").focus();
        $(this).prop("disabled", false);
        $rootScope.ShowToastMessage("This is a required field", "error");
        return false;
      } else if (
        (document.getElementById("IsRouteDifferent").checked &&
          $("#LandMark_Drop").val() == null) ||
        (document.getElementById("IsRouteDifferent").checked &&
          $("#LandMark_Drop").val() == "")
      ) {
        $("#LandMark_Drop").focus();
        $(this).prop("disabled", false);
        $rootScope.ShowToastMessage("This is a required field", "error");
        return false;
      } else if (
        document.getElementById("TransportTermsMain").checked == false
      ) {
        $("#TransportTermsMain").focus();
        $(this).prop("disabled", false);
        $rootScope.ShowToastMessage(
          "Transport once allocated, minimum one month fee will be payable even if it is not used at all, please tick the check box to continue",
          "error"
        );
        return false;
      } else if (
        document.getElementById("TermsAndConditionsMain").checked == false
      ) {
        $("#TermsAndConditionsMain").focus();
        $(this).prop("disabled", false);
        $rootScope.ShowToastMessage(
          "Please Read School Transportation Rules and Regulations",
          "error"
        );
        return false;
      } else {
        $("#SubmitapplicationBtn").html("Submitting...");
        $("#SubmitapplicationBtn").prop("disabled", true);

       var dataToSubmit = angular.copy($scope.Applications);
        dataToSubmit.TransportApplicationStudentMaps = dataToSubmit.TransportApplicationStudentMaps.filter(function(student) {
           return student.CheckBoxStudent;
       });

        $http({
          method: "POST",
          url: dataService + "/SubmitTransportApplication",
          data: JSON.stringify(dataToSubmit),

          headers: {
            Accept: "application/json;charset=UTF-8",
            "Content-type": "application/json; charset=utf-8",
            CallContext: JSON.stringify(context),
          },
        }).then(
          function (result) {
            if (result.IsError) {
              $rootScope.ShowToastMessage(result.Response, "error");
              $("#SubmitapplicationBtn").prop("disabled", false);
              $("#SubmitapplicationBtn").html("Submit");
              return false;
            } else {
            $rootScope.ShowToastMessage("Transport saved successfully", "success");

              $state.go("studenttransportrequestlist");
            }
            $rootScope.ShowLoader = false;
            $rootScope.ShowPreLoader = false;
          },
          function () {
            $rootScope.ShowLoader = false;
          }
        );
      }
    };
    $scope.GetStudentDetailsForTransportApplication = function () {
      $http({
        method: "GET",
        url:
          dataService +
          "/GetStudentDetailsForTransportApplication?id=" +
          $scope.TransportApplctnStudentMapIID,
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).then(
        function (result) {
          $scope.Applications = result.data;
var item = $scope.Applications;
if (item.TransportApplicationStudentMaps && item.TransportApplicationStudentMaps.length > 0) {
  item.TransportApplicationStudentMaps.forEach(function (student) {
    if (student.StartDate) {
      // Convert to Date object while ignoring time portion
      var dateOnly = new Date(student.StartDate);
      // Normalize to date-only (zero out time)
      student.StartDate = new Date(dateOnly.getFullYear(), dateOnly.getMonth(), dateOnly.getDate());
    }
  });
}

          $rootScope.ShowLoader = false;
          $rootScope.ShowPreLoader = false;
        },
        function () {
          $rootScope.ShowLoader = false;
        }
      );
    };
    $scope.GetTransprtRulesAndRegulationsDetails = function () {
      $http({
        method: "GET",
        url:
          dataService +
          "/GetAboutandContactDetails?contentID=" +
          $scope.referenceID,
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).then(
        function (response) {
          var result = response.data;
          var htmlContent =
            result && result.Description ? result.Description : "";
          const textarea = document.createElement("textarea");
          textarea.innerHTML = htmlContent;
          const decodedHtml = textarea.value;

          // Trust and bind to scope
          $scope.TransprtRulesAndRegulationsDetails =
            $sce.trustAsHtml(decodedHtml);

          $rootScope.ShowLoader = false;
          $rootScope.ShowPreLoader = false;
        },
        function () {
          $rootScope.ShowLoader = false;
        }
      );
    };

    $scope.GetLookUpDatas = function () {
      $http({
        method: "Get",
        url:
          dataService +
          "/GetDynamicLookUpDataForMobileApp?lookType=School&defaultBlank=false",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).then(function (result) {
        $scope.Schools = result.data;
      });
    };
    $scope.GetSettingValues = function () {
      return $http({
        method: "GET",
        url:
          appDataUrl +
          "/GetSettingValueByKey?settingKey=STATIC_CONTENT_TRANSPORT_RULE",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).then(
        function (response) {
          $scope.referenceID = response.data;
        },
        function (error) {
          console.error("Error fetching setting value", error);
        }
      );
    };
    $scope.getContactTypes = function () {
      return $http({
        method: "GET",
        url:
          appDataUrl +
          "/GetSettingValueByKey?settingKey=EMEGENCY_CONTACT_TYPES",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).then(
        function (result) {
          result.data.split(",").forEach((x, index) => {
            $scope.ContactTypes.push({
              Key: index + 1,
              Value: x,
            });
          });
        },
        function (error) {
          console.error("Error fetching setting value", error);
        }
      );
    };

       $scope.TypeChanges = function() {
       var type = $("#SelectedType").val();
       if (type == 1) {
           $scope.Applications.EmergencyContactNumber = $scope.Applications.FatherContactNumber;
           $scope.Applications.EmergencyEmailID = $scope.Applications.FatherEmailID;

       }
       else if (type == 2) {
           $scope.Applications.EmergencyContactNumber = $scope.Applications.MotherContactNumber;
           $scope.Applications.EmergencyEmailID = $scope.Applications.MotherEmailID;
       }
       else
       {
           $scope.Applications.EmergencyContactNumber = "";
           $scope.Applications.EmergencyEmailID = "";
       }
   }


    function validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email) || email === "";
    }
    // Initialize controller
    $scope.init();
  },
]);
