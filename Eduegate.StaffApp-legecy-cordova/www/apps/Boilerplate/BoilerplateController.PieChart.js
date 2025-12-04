app.controller("BoilerplatePieChartController", ["$scope", "$compile", "$http", "$timeout", "$controller", "$document",
	function ($scope, $compile, $http, $timeout, $controller, $document) {
	console.log("BoilerplatePieChartController");

    angular.extend(this, $controller('BoilerPlateController', { $scope: $scope, $compile: $compile, $http: $http, $timeout: $timeout }));

    $scope.childInit = function (boilerPlateInfo, windowName) {
    	this.init(boilerPlateInfo, windowName);
    	loadChart();
    };

    function loadChart() {
    	var pieData = [
			{
				value: 90,
				color: "rgba(233, 78, 2, 1)",
				label: "Hair Consulting"
			},
			{
				value: 50,
				color: "rgba(242, 179, 63, 1)",
				label: "Waxing"
			},
			{
				value: 60,
				color: "rgba(88, 88, 88,1)",
				label: "Hair Loss Treatments - non surgical"
			},
			{
				value: 40,
				color: "rgba(79, 82, 186, 1)",
				label: "Wedding Hair"
			}
    	];

    	$timeout(function () {
    		new Chart(document.getElementById("pie").getContext("2d")).Pie(pieData);
    	});
    }
}]);