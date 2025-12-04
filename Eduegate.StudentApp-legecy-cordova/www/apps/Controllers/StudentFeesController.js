app.controller('StudentFeesController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', "$timeout", function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
    console.log('StudentFeesController loaded.');

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();

    $scope.FeeTypes = [];

    $rootScope.ShowPreLoader = true;
    $rootScope.ShowLoader = true;

    $scope.IsError = false;
    $scope.ErrorMessage = "";

    $scope.StudentID = $stateParams.studentID;

    $scope.init = function () {

        $rootScope.ShowLoader = true;
        $rootScope.ShowPreLoader = true;
        $scope.IsError = false;
        $scope.ErrorMessage = "";
    
        $scope.FillInvoiceDetails($scope.StudentID);
    };

    $scope.toggleGrid = function (event) {

        toggleHeader = $(event.currentTarget).closest(".toggleContainer").find(".toggleHeader");
        toggleContent = $(event.currentTarget).closest(".toggleContainer").find(".toggleContent");
        toggleHeader.toggleClass("active");
        if (toggleHeader.hasClass('active')) {
            toggleContent.slideDown("fast");
        }
        else {
            toggleContent.slideUp("fast");
        }
    }
    $scope.GetTotalFeePayAmount = function (data) {

        if (typeof (data) === 'undefined') {
            return 0;
        }
        var sum = 0;
        $.each(data, function (index, objModel) {
            $.each(objModel.FeeTypes, function (index, objModelinner) {

                sum = sum + objModelinner.Amount;

            });
        });
        return sum;
    }

    $scope.FillInvoiceDetails = function (studentID) {
        $scope.FeeTypes = [];

        $http({
            method: 'GET',
            url: dataService + '/GetStudentFeeDetails?studentID=' + studentID,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {

            $scope.FeeDueDetails = result;
            $scope.FeeTypes = result.StudentFeeDueTypes;

            if ($scope.FeeTypes.length == 0) {
                $scope.IsError = true;
                $scope.ErrorMessage = "No fee dues were found. Please try again later.";
            }

            $rootScope.ShowLoader = false;
            $rootScope.ShowPreLoader = false;
        }).error(function (err) {
            $rootScope.ShowLoader = false;
            $rootScope.ShowPreLoader = false;

            $scope.IsError = true;
            $scope.ErrorMessage = "An error occurred. Please try again later.";
        });
    }

    $scope.FillInvoice = function (studentID) {
        $scope.FeeTypes = [];

        $http({
            method: 'GET',
            url: $rootScope.ParentPortalUrl + '/Home/FillFeeDue?studentId=' + $scope.StudentID,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            if (!result.IsError) {
                $scope.FeeTypes = result.Response;
            }

            if ($scope.FeeTypes.length == 0) {
                $scope.IsError = true;
                $scope.ErrorMessage = "No fee dues were found. Please try again later.";
            }

            $rootScope.ShowLoader = false;
            $rootScope.ShowPreLoader = false;
        }).error(function (err) {
            $rootScope.ShowLoader = false;
            $rootScope.ShowPreLoader = false;

            $scope.IsError = true;
            $scope.ErrorMessage = "An error occurred. Please try again later.";
        });
    }

    // $scope.init();
}]);