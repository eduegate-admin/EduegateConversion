app.controller("C3ChartBoilerPlateController", ["$scope", "$compile", "$http", "$timeout", "$controller", "$document",
    function ($scope, $compile, $http, $timeout, $controller, $document) {
        console.log("C3ChartBoilerplateBarChartController");
        //angular.extend(this, $controller('BoilerPlateController', { $scope: $scope, $compile: $compile, $http: $http, $timeout: $timeout }));

        var vm = this;
        vm.windowContainer;
        vm.boilerPlate = null;
        vm.chart = null;
        vm.tableHeaders = [];
        vm.chartSeriesData = [];
        vm.LookUps = [];
        vm._chartType;
        vm.DataSource = null;
        vm.GetBoilerPlatesURL = '/CMS/Boilerplate/GetBoilerPlates';
        vm.chartBuilder = new ChartBuilder();
        vm.lookLoadCount = 0;
        vm.SelectedFilter = null;

        vm.childInit = function (boilerPlateInfo, windowName,y_axisLabel) {
            vm.windowContainer = windowName;
            vm.boilerPlate = boilerPlateInfo;
            $timeout(function () {
                if (vm.boilerPlate && vm.boilerPlate.RuntimeParameters) {
                    var lookUp = new $.map(vm.boilerPlate.RuntimeParameters)
                        .Where(function (data) { return data.Key == 'LookUpName' })
                        .items[0];

                    if (lookUp && lookUp.Value) {
                        vm.LoadLookups([{
                            'LookUpName': lookUp.Value, 'Url': 'Mutual/GetLookUpData?lookType=' + lookUp.Value,
                            'CallBack': function () {
                                vm.SelectedFilter = vm.LookUps[lookUp.Value][0];
                                vm.GetBoilerPlates(vm.boilerPlate, windowName);
                            }
                        }]);
                    }
                    else {
                        vm.GetBoilerPlates(vm.boilerPlate, windowName);
                    }
                }

                vm.intializeC3Chart(y_axisLabel);
            });
        }

        vm.ReloadData = function () {
            $scope.ShowSpinner = true;
            vm.chartSeriesData = [];
            //vm.chartBuilder.unloadAll(vm.chart);
            vm.GetBoilerPlates(vm.boilerPlate, vm.windowContainer);
        }

        vm.GetBoilerPlates = function (boilerPlateInfo, windowName) {
            var param = JSON.parse(JSON.stringify(boilerPlateInfo));

            if (param.runTimeParameter != undefined) {
                for (var i = 0; i <= param.runTimeParameter.length - 1; i++) {
                    param.RuntimeParameters.push(param.runTimeParameter[i]);
                }
            }

            if (vm.SelectedFilter != null) {
                param.RuntimeParameters.push({ 'Key': "FilterByID" , 'Value': vm.SelectedFilter.Key });
            }

            $http({
                method: 'POST',
                url: $scope.GetBoilerPlatesURL,
                data: param
            })
                .then(function (result) {
                    if (!result.IsError) {
                        if (result.data != undefined && result.data != null && result.data != '') {
                            vm.intializeCallBack(JSON.parse(result.data))
                        };
                    }
                })

                .finally(function () {
                    $timeout(function () {
                        $scope.ShowSpinner = false;
                    }, 1000);
                   
                });
        }

        vm.intializeCallBack = function (datas) {
            vm.chartSeriesData = [];
            $.each(datas.C3Chart, function (data) {
                var serialized = datas.C3Chart[data];
                serialized.JSONData = serialized.JSONData.replace(/&quot;+/g, '"');
                vm.chartSeriesData.push(JSON.parse(serialized.JSONData));
            })

            vm.tableHeaders = datas.Headers.map(item => item.JSONData);

            //if (vm._chartType == 'hirozontalbar') {
            //    vm.chart = vm.chartBuilder.createhorizonalbarchart(
            //        vm.chart.bindto, vm.chartSeriesData, vm.chart.colors, vm.chart.axis, vm.chart.grid, false, true, vm.chart.point, vm.chart.zoom);
            //}

            if (vm.chart != null && vm.chart.chartobject != null && vm.chartSeriesData.length > 0) {
                vm.chartBuilder.reloaddata(vm.chart, vm.chartSeriesData, vm.tableHeaders);
            }
        }

        vm.intializeC3Chart = function (y_axisLabel) {
            vm.chartSeriesData = [];
            var colour = {};
            var labelName = '';

            if (y_axisLabel.length > 0) {

                labelName = y_axisLabel;
            }
            else {
                labelName = '';
            }

            colour = ['#FF0000', '#F97600', '#F6C600', '#60B044'];
            var axis = {
                x: {
                    type: 'category',
                    categories: [
                    ]
                },
                y: {
                    tick: {
                        count: 6,
                        format: (window.d3 ? d3.format('.1f') : null)
                    },
                    label: {
                        position: 'outer-middle'
                    }
                },
                label: labelName
            };

            var grid = {
                y: {
                    show: true
                }
            };

            var point = 5;
            var zoom = true;

            var chartType = new JSLINQ(vm.boilerPlate.RuntimeParameters).Where(function (data) { return data.Key == 'ChartType' }).items[0];
            vm._chartType = chartType.Value;

            switch (vm._chartType) {
                case 'bar':
                    vm.chart = vm.chartBuilder.createbarchart(
                        '#' + vm.windowContainer + '_widgetcontainer', vm.chartSeriesData, colour, axis, grid, true, true, point, zoom);
                    break;
                case 'barXCategory':
                    vm.chart = vm.chartBuilder.createBarchartXCategory(
                        '#' + vm.windowContainer + '_widgetcontainer', vm.chartSeriesData, colour, axis, grid, true, true, point, zoom);
                    break;                    
                case 'hirozontalbar':
                    vm.chart = vm.chartBuilder.createhorizonalbarchart(
                        '#' + vm.windowContainer + '_widgetcontainer', vm.chartSeriesData, colour, axis, grid, true, true, point, zoom);
                    break;
                case 'line':
                    vm.chart = vm.chartBuilder.createlinechart(
                        '#' + vm.windowContainer + '_widgetcontainer', vm.chartSeriesData, colour, axis, grid, true, true, point, zoom);
                    break;
                case 'donut':
                    vm.chart = vm.chartBuilder.createDonutchart(
                        '#' + vm.windowContainer + '_widgetcontainer', vm.chartSeriesData, colour);
                    break;
                case 'pie':
                    vm.chart = vm.chartBuilder.createPiechart(
                        '#' + vm.windowContainer + '_widgetcontainer', vm.chartSeriesData, colour);
                    break;
                case 'gauge':
                    vm.chart = vm.chartBuilder.createGaugechart(
                        '#' + vm.windowContainer + '_widgetcontainer', vm.chartSeriesData, colour);
                    break;
                case 'line':
                    vm.chart = vm.chartBuilder.createAreaSplineChart(
                        '#' + vm.windowContainer + '_widgetcontainer', vm.chartSeriesData, colour, axis, grid, true, true, point, zoom);
                    break;
                case 'areastep':
                    vm.chart = vm.chartBuilder.createAreaStepChart(
                        '#' + vm.windowContainer + '_widgetcontainer', vm.chartSeriesData, colour, axis, grid, true, true, point, zoom);
                    break;
                case 'area':
                    vm.chart = vm.chartBuilder.createAreachart(
                        '#' + vm.windowContainer + '_widgetcontainer', vm.chartSeriesData, colour, axis, grid, true, true, point, zoom);
                    break;
                    
            }

            vm.chart.type = vm._chartType;
        }

        vm.LoadLookups = function (urls) {
            $.each(urls, function (index, url) {
                if (url.IsOnInit === false) {
                    vm.LookUps[url.LookUpName] = [{ Key: '', Value: '' }]
                    vm.lookLoadCount++
                } else {
                    vm.LookUps[url.LookUpName] = [{ Key: '', Value: 'Loading..' }]

                   $http({
                        method: 'GET',
                        url: url.Url + '&defaultBlank=false',
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8'
                        }
                    }).then(function (response) {
                        const result = response.data;

                        if (result.Data === undefined) {
                            vm.LookUps[url.LookUpName] = result;
                        } else {
                            vm.LookUps[url.LookUpName] = result.Data;
                        }

                        if (url.CallBack !== undefined && url.CallBack !== '') {
                            $scope.$eval(url.CallBack);
                        }

                        vm.lookLoadCount++;
                    }, function (error) {
                        vm.lookLoadCount++;
                    });

                }
            });
        }
    }
])
