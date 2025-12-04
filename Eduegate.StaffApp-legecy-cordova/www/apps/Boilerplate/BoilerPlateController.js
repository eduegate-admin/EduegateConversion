app.controller("BoilerPlateController", ["$scope", "$compile", "$http", "$timeout", function ($scope, $compile, $http, $timeout) {
    console.log("BoilerPlateController");

    $scope.DailyAmount = null;
    $scope.MonthlyAmount = null;
    $scope.YearlyAmount = null;
    $scope.Title = null;

    var ViewName = null;
    $scope.DataSource = null;
    $scope.GetBoilerPlatesURL = '/CMS/Boilerplate/GetBoilerPlates';
    $scope.GetCountByBoilerPlatesURL = 'Schools/School/GetCountByDocumentTypeID';
    $scope.selectedItem = null;
    var initializeCallBack;

    $scope.init = function (boilerPlateInfo, windowName, callback) {

        initializeCallBack = callback;
        var docTypeID = boilerPlateInfo.RuntimeParameters.find(x => x.Key == "DocumentTypeID")?.Value;
        var title = boilerPlateInfo.RuntimeParameters.find(x => x.Key == "Title")?.Value;

        if (docTypeID != null || docTypeID != "" || docTypeID != undefined) {
            GetCountByBoilerPlates(docTypeID, title);
        }
        else {
            GetBoilerPlates(boilerPlateInfo, windowName);
        }
    };

    function GetBoilerPlates(boilerPlateInfo, windowName) {
        if ($scope.$parent.runTimeParameter !== undefined) {
            for (var i = 0; i <= $scope.$parent.runTimeParameter.length - 1; i++) {
                boilerPlateInfo.RuntimeParameters.push($scope.$parent.runTimeParameter[i]);
            }
        }

        $http({
            method: 'POST',
            url: $scope.GetBoilerPlatesURL,
            data: boilerPlateInfo,
        })
          .then(function (result) {
              if (!result.IsError) {
                  if (result.data !== undefined && result.data !== null && result.data !== '') {
                      $scope.DataSource = JSON.parse(result.data);
                  };
              }

              if (initializeCallBack) {
                  initializeCallBack($scope.DataSource);
              }
          })
        .finally(function () {
        });
    }


    function GetCountByBoilerPlates(docTypeID, title) {

        if (docTypeID != undefined) {
            var url = "Schools/School/GetCountByDocumentTypeID?docTypeID=" + docTypeID;
            $http({ method: 'Get', url: url })
                .then(function (result) {
                    if (result == null || result.data.length == 0) {
                        return false;
                    }
                    $scope.DailyAmount = result.data.DailyAmount;
                    $scope.MonthlyAmount = result.data.MonthlyAmount;
                    $scope.YearlyAmount = result.data.YearlyAmount;
                    $scope.Title = title;
                }, function () {
                });
        }
    }

}]);