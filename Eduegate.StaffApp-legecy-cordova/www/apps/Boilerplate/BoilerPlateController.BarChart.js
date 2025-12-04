app.controller("BoilerplateBarChartController", ["$scope", "$compile", "$http", "$timeout", "$controller", "$document",
	function ($scope, $compile, $http, $timeout, $controller, $document) {
	    console.log("BoilerplatePieChartController");

	    angular.extend(this, $controller('BoilerPlateController', { $scope: $scope, $compile: $compile, $http: $http, $timeout: $timeout }));

	    $scope.childInit = function (boilerPlateInfo, windowName) {
	        this.init(boilerPlateInfo, windowName);
	        loadChart();
	    };

	    function loadChart() {
	        var barChartData = {
	            labels: ["Jan", "Feb", "March", "April", "May", "June", "July"],
	            datasets: [
                    {
                        fillColor: "rgba(233, 78, 2, 0.9)",
                        strokeColor: "rgba(233, 78, 2, 0.9)",
                        highlightFill: "#e94e02",
                        highlightStroke: "#e94e02",
                        data: [65, 59, 90, 81, 56, 55, 40]
                    },
                    {
                        fillColor: "rgba(79, 82, 186, 0.9)",
                        strokeColor: "rgba(79, 82, 186, 0.9)",
                        highlightFill: "#4F52BA",
                        highlightStroke: "#4F52BA",
                        data: [40, 70, 55, 20, 45, 70, 60]
                    }
	            ]

	        };

	        $timeout(function () {
	            new Chart(document.getElementById("bar").getContext("2d")).Bar(barChartData);
	        });
	    }
	}]);