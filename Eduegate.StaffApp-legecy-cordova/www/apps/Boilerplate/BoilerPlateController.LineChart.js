app.controller("BoilerplateLineChartController", ["$scope", "$compile", "$http", "$timeout", "$controller", "$document",
	function ($scope, $compile, $http, $timeout, $controller, $document) {
	    console.log("BoilerplatePieChartController");

	    angular.extend(this, $controller('BoilerPlateController', { $scope: $scope, $compile: $compile, $http: $http, $timeout: $timeout }));

	    $scope.childInit = function (boilerPlateInfo, windowName) {
	        this.init(boilerPlateInfo, windowName);
	        loadChart();
	    };

	    function loadChart() {
	        var lineChartData = {
	            labels: ["Jan", "Feb", "March", "April", "May", "June", "July"],
	            datasets: [
                    {
                        fillColor: "rgba(242, 179, 63, 1)",
                        strokeColor: "#F2B33F",
                        pointColor: "rgba(242, 179, 63, 1)",
                        pointStrokeColor: "#fff",
                        data: [70, 60, 72, 61, 75, 59, 80]

                    },
                    {
                        fillColor: "rgba(97, 100, 193, 1)",
                        strokeColor: "#6164C1",
                        pointColor: "rgba(97, 100, 193,1)",
                        pointStrokeColor: "#9358ac",
                        data: [50, 65, 51, 67, 52, 64, 50]

                    }
	            ]
	        };

	        $timeout(function () {
	            new Chart(document.getElementById("line").getContext("2d")).Line(lineChartData);
	        });
	    }
	}]);