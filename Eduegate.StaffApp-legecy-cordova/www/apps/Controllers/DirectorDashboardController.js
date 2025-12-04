app.controller('DirectorDashboardController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', '$state', '$stateParams', '$sce', '$rootScope', "$timeout", 'FlickityService', function ($scope, $http, loggedIn, rootUrl, $location, GetContext, $state, $stateParams, $sce, $rootScope, $timeout, FlickityService) {
  var dataService = rootUrl.SchoolServiceUrl;
  $scope.ContentService = rootUrl.ContentServiceUrl;
  var rootUrl = rootUrl.RootUrl;
  var securityService = rootUrl.SecurityServiceUrl;
  var context = GetContext.Context();

  $rootScope.UserName = context.EmailID;
  $scope.NewAssignmentCount = 0;
  $scope.MyClassCount = 0;
  $scope.LessonPlanCount = 0;
  $scope.NotificationCount = 0;
  $rootScope.BoilerPlates = [];
  $rootScope.HomeBanners = [];
  var pageInfoPromise = null;
  $rootScope.UserDetails = null;
  $rootScope.Driver = false;
  $scope.Teacher = false;
  $rootScope.Admin = false;
  $rootScope.Director = false;
  $rootScope.UserClaimSets = context.UserClaimSets;
  $scope.attendanceCardSpinner = true;
  $scope.LoginID = null;
  $scope.AcademicYear = [];
  $scope.Schools = [];
  $scope.SelectedAcademicYear = { "Key": null, "Value": null };
  $scope.SelectedSchool = { "Key": null, "Value": null };
  $scope.SelectedAcademicYearDetail = null;
  $scope.SelectedSchoolDetail = null;
  $scope.AcademicYearList = [];
  $scope.SelectedLanguage = 'en';
  $scope.isSchoolSelected = false;

  if ($rootScope.UserClaimSets.some(code => code.Value === 'Driver')) {
    $rootScope.Driver = true;
    localStorage.setItem("isDriver", "true"); // Set when user logs in as a driver
  }
  if ($rootScope.UserClaimSets.some(code => code.Value === 'Class Teacher')) {
    $scope.Teacher = true;
    localStorage.setItem("isDriver", "false"); // Set when user logs in other than driver

  }
  if ($rootScope.UserClaimSets.some(code => code.Value === 'Super Admin')) {
    $rootScope.Admin = true;
    localStorage.setItem("isDriver", "false"); // Set when user logs in other than driver

  }
  if ($rootScope.UserClaimSets.some(code => code.Value === 'Director')) {
    $rootScope.Director = true;
    $rootScope.Admin = true;
    localStorage.setItem("isDriver", "false"); // Set when user logs in other than driver
  }

  $scope.init = function () {
    $scope.LoadProfileInfo();
    $scope.getPageInfo();
    $scope.GetLookUpDatas();
    $scope.GetAcademicYearList().then(function () {
      $scope.InitializeForm();
  });
    $scope.SelectedAcademicYear = context.AcademicYearID;
    $scope.SelectedSchool = context.SchoolID;
  };

  $scope.getPageInfo = function () {
    if (pageInfoPromise) {
      if (pageInfoPromise.reject) {
        pageInfoPromise.reject("Aborted");
      }
    }
    pageInfoPromise = $http({
      url: rootUrl + '/GetPageInfo?pageID=102&parameter=',
      method: 'GET',
      headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(context) },
    }).then(function (result) {
      pageInfoPromise = null;
      result = result.data;
      $rootScope.LoadingMessage = "";
      if (result != undefined && result != null && result.BoilerPlates != undefined && result.BoilerPlates != null) {
        $rootScope.BoilerPlates = result.BoilerPlates;
        $rootScope.ShowLoader = false;
      }
      else {
        $rootScope.ShowLoader = false;
      }
    }, function (err) {
      pageInfoPromise = null;
      // $scope.getPageInfo();
    });

  };

  $scope.AcademicYearChanges = function (academicYear, row) {
    $scope.SelectedSchool = {
      "Key": row.SchoolID,
      "Value": row.SchoolName
    };
    $scope.SelectedAcademicYear = {
      "Key": academicYear.Key,
      "Value": academicYear.Value
    }
  };

  $scope.GetDynamicLookUpDataForMobileApp = function () {
    $http({
      method: 'Get',
      url: dataService + "/GetDynamicLookUpDataForMobileApp?lookType=ActiveAcademicYear&defaultBlank=false",

      headers: {
        "Accept": "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        "CallContext": JSON.stringify(context)
      }
    }).success(function (result) {
      $scope.AcademicYear = result.data;
    })
  };

  $scope.GetLookUpDatas = function () {
    $http({
      method: 'GET',
      url: dataService + "/GetLookUpData?lookType=School&defaultBlank=false",
      headers: {
        "Accept": "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        "CallContext": JSON.stringify(context)
      }
    }).then(function (result) {
      $scope.School = result.data

    }).catch(function (error) {
      console.error('Error fetching lookup data:', error);
    });
  };

  $scope.FillAcademicYearBySchool = function () {
    $scope.AcademicYear = [];
    var schoolID = $scope.SelectedSchool.Key || $scope.SelectedSchool;
    $scope.AcademicYearList.forEach(x => {
      if (x.SchoolID == schoolID) {
        $scope.AcademicYear.push({
          "Key": x.AcademicYearID,
          "Value": x.Description + " " + "(" + x.AcademicYearCode + ")",
        });
      };
    });
  }

  $scope.GetAcademicYearList = function () {
    return $http({
        method: 'GET',
        url: dataService + '/GetActiveAcademicYearListData',
        headers: {
            "Accept": "application/json;charset=UTF-8",
            "Content-type": "application/json; charset=utf-8",
            "CallContext": JSON.stringify(context)
        }
    }).then(function (response) {
        $scope.AcademicYearList = response.data;
    }).catch(function (err) {
        console.error("Error fetching academic year list", err);
    });
};

  $scope.GetCurrentAcademicYear = function (selectedSchool) {
    $http({
      method: 'GET',
      url: dataService + '/GetCurrentAcademicYearBySchoolID?schoolID=' + selectedSchool.SchoolID,
      headers: {
        "Accept": "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        "CallContext": JSON.stringify(context)
      }
    }).success(function (result) {
      $scope.acy = result;
      $scope.SelectedSchool = {
        "Key": selectedSchool.SchoolID,
        "Value": selectedSchool.SchoolName
      };
      $scope.SelectedAcademicYear = {
        "Key": $scope.acy.Key,
        "Value": $scope.acy.Value
      }
    }).error(function (err) {
    });
  }

  $scope.LoadProfileInfo = function () {
    $http({
      method: 'GET',
      url: dataService + '/GetStaffProfile',
      headers: {
        "Accept": "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        "CallContext": JSON.stringify(context)
      }
    }).success(function (result) {
      $scope.Profile = result;
      if ($scope.Profile == null) {
        $scope.onProfileFilling = false;
      }
    }).error(function (err) {
    });
  }

  $scope.SaveSchool = function () {
    var academicYearID = $scope.SelectedAcademicYear.Key
    var schoolID = $scope.SelectedSchool.Key
    // Create an object to store in localStorage
    var context = {
      AcademicYearID: academicYearID,
      SchoolID: schoolID
    };

    // Retrieve the existing context from localStorage or initialize it
    var context = JSON.parse(window.localStorage.getItem("context")) || {
      CompanyID: "", EmailID: "", IPAddress: getIPAddress(), LoginID: "", GUID: "", CurrencyCode: "",
      UserRole: "", UserClaims: "", LanguageCode: "", CompanyID: "", SiteID: "",
      UserId: "0", ApiKey: "", UserReferenceID: ""
    };

    // Add the AcademicYearID and SchoolID into a new property
    context.AcademicYearID = academicYearID;
    context.SchoolID = schoolID;

    // Save the updated context back to localStorage
    window.localStorage.setItem("context", JSON.stringify(context));
    location.reload()

  }
  $scope.InitializeForm = function () {
    var savedContext = JSON.parse(window.localStorage.getItem("context"));
    if (savedContext) {
        // Set the selected school
        if (savedContext.SchoolID) {
            $scope.SelectedSchool = $scope.School.find(s => s.Key == savedContext.SchoolID);
            if ($scope.SelectedSchool) {
                $scope.FillAcademicYearBySchool();
            }
        }

        // Set the selected academic year
        if (savedContext.AcademicYearID) {
            $scope.SelectedAcademicYear = $scope.AcademicYear.find(a => a.Key == savedContext.AcademicYearID);
        }
    }
};
  $scope.init();

}]);