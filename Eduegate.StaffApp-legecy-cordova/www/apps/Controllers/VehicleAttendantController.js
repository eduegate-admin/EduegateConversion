app.controller('VehicleAttendantController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce) {
    console.log('VehicleAttendantController loaded.');

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();

    $scope.VehiclesDetails = [];
    $scope.VehicleAssignDetails = [];
    $scope.CurrentDate = new Date();

    $rootScope.ShowLoader = true;

    $scope.init = function () {

    }

    $scope.LoadVehicleInfo = function () {
        $http({
            method: 'GET',
            url: dataService + '/GetVehicleDetailsByEmployeeLoginID',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            $scope.VehiclesDetails = result;
            $rootScope.ShowLoader = false;
        }).error(function (){
            $rootScope.ShowLoader = false;
        });
    }

    $scope.LoadAttendantInfo = function (data) {
        $scope.VehicleAssignDetails = [];
        $http({
            method: 'GET',
            url: dataService + '/GetVehicleAssignDetailsByEmployeeIDandRouteID?employeeID=' + data.EmployeeID +'&routeID='+ data.RouteID,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            $scope.VehicleAssignDetails = result;
            $rootScope.ShowLoader = false;
        }).error(function (){
            $rootScope.ShowLoader = false;
        });
    }

    $scope.toggleGrid = function (event, model, type) {

        if (type == 'Vehicle') {
            toggleHeader = $(event.currentTarget).closest(".vehicleToggleContainer").find(".vehicleToggleHeader");
            toggleContent = $(event.currentTarget).closest(".vehicleToggleContainer").find(".vehicleToggleContent");
            toggleHeader.toggleClass("active");
            if (toggleHeader.hasClass('active')) {
                toggleContent.slideDown("fast");
                $scope.LoadAttendantInfo(model);
            }
            else {
                toggleContent.slideUp("fast");
            }
        }
    };

      $scope.viewData = function (event) {
        $scope.SelectedDate = { SelectedYear: new Date().getFullYear().toString(), SelectedMonth: new Date().getMonth().toString() }

        $scope.ScheduleTypeID = parseInt($("#ScheduleType").val());
          var todayDate = new Date().toISOString().slice(0, 10);
          var scheduledDate = todayDate;

        var typeID = $scope.ScheduleTypeID;

        var vehicleDeatails  = $scope.VehiclesDetails.find(x => x.IsActive == true);
        var vehicleID = vehicleDeatails.VehicleIID;
        var routeID = vehicleDeatails.RouteID;

        if (typeID == 1)
        {
            let d = new Date();
            d.setDate(d.getDate() - 1);
            scheduledDate = d.toISOString().split('T')[0];
        }
        else
        {
            scheduledDate = todayDate;
        }

        $http({
            method: 'GET',
            url: dataService + '/GetDriverScheduleListByParameters?routeID='+ routeID +'&vehicleID='+ vehicleID+'&scheduledDate='+scheduledDate,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            $scope.passengerList = result;
            if($scope.passengerList.length > 0)
            {
              var vehRouteDetails = $scope.passengerList.find(x => x.RouteID != null);
              $scope.VehicleRegistrationNo = vehRouteDetails.VehicleRegistrationNumber;
              $scope.RouteCode = vehRouteDetails.RouteCode;
              $scope.SelectedDateString = scheduledDate.split("-").reverse().join("-");

                var bothCount = $scope.passengerList.filter(a => a.StatusMark == "X").length;
                $scope.PickINCount = bothCount + $scope.passengerList.filter(a => a.StatusMark == "/").length;
                $scope.DropINCount = $scope.passengerList.filter(a => a.StatusMark != "/").length;
            }
            $rootScope.ShowLoader = false;
        }).error(function (){
            $rootScope.ShowLoader = false;
        });

      };

    $scope.init();
}]);