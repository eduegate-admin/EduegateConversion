app.controller('GalleryController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce) {
    console.log('GalleryController loaded.');

    var dataService = rootUrl.SchoolServiceUrl;
    var Context = GetContext.Context();



    $scope.GallerySchool = {};
    $scope.SchoolAcademicYear = {};

    $scope.init = function () {


        $scope.GetSchoolsList();

    };




    $scope.GetGalleryDataByAcademic = function () {
        $scope.Gallery = [];
        var academicYearID = $scope.SchoolAcademicYear?.Key;
       $http({
    method: 'GET',
    url: dataService + "/GetGalleryView",
    params: { academicYearID: academicYearID }
}).then(function (response) {
    var result = response.data;

    if (!result.IsError && result !== null) {
        $scope.Gallery = result.Response;  // No need for $apply inside $http
    }

}, function (error) {
    // Optional error handling
});


    }
    $scope.GetSchoolsList = function () {
        $scope.Schools = [];

      $http({
    method: 'GET',
    url: dataService + "/GetSchoolsByParent",
    params: { loginID: Context.LoginID }
}).then(function(response) {
    $scope.Schools = response.data;

    if ($scope.Schools.length > 0) {
        $scope.Schools.forEach(function(x) {
            if (x.Key != null && x.Key == 30) {
                $scope.$apply(function() {
                    $timeout(function() {
                        $scope.GallerySchool.Key = x.Key;
                        $scope.GallerySchool.Value = x.Value;

                        $scope.SchoolChanges();
                    }, 1000);
                });
            }
        });
    }
}, function(error) {
    // handle error if needed
});

    }

    $scope.openImage = function () {
        fsLightbox.open();
    };

    $scope.SchoolChanges = function () {
        $scope.SchoolAcademicYear = {};

        $('.preload-overlay').show();
        var schoolID = $scope.GallerySchool?.Key;
   $http({
    method: 'GET',
    url: dataService + "/GetAcademicYearBySchool?30",
    params: { schoolID: schoolID },
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
}).then(function(response) {
    var result = response.data;

    if (!result.IsError && result !== null) {
        $scope.$apply(function () {
            $scope.AcademicYears = result.Response;
        });
    }

    if ($scope.AcademicYears && $scope.AcademicYears.length === 1) {
        $scope.AcademicYears.forEach(function(x) {
            if (x.Key != null) {
                $scope.$apply(function () {
                    $timeout(function () {
                        $scope.SchoolAcademicYear.Key = x.Key;
                        $scope.SchoolAcademicYear.Value = x.Value;

                        $scope.GetGalleryDataByAcademic();
                    }, 1000);
                });
            }
        });
    }
}, function(error) {
    // handle error if needed
});

    }



}]);