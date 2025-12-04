function ChartBuilder() {
    function createbarchart(bindto, columns, colors, axis, grid, legend, tooltip, title) {
        var canvas = document.createElement("canvas");
        $(bindto).append(canvas);
        var chart = new Chart(canvas, {
            plugins: [ChartDataLabels],
            type: 'bar',
            data: {
                labels: !columns || columns.length === 0 ? ['values'] : columns,
                datasets: []
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    datalabels: {
                        font: {
                            weight: 'bold'
                        },
                        formatter: function (value, context) {
                            return !value ? null : Math.round(value);
                        },
                        rotation:90,
                        padding: 2
                    }
                },
            }
        });

        return {
            bindto: bindto,
            columns: columns,
            title: title,
            colors: colors,
            axis: axis,
            grid: grid,
            legend: legend,
            tooltip: tooltip,
            chartobject: chart
        }
    }

    function createhorizonalbarchart(bindto, columns, colors, axis, grid, legend, tooltip, title) {
        var canvas = document.createElement("canvas");
        $(bindto).append(canvas);
        var chart = new Chart(canvas, {
            plugins: [ChartDataLabels],
            type: 'bar',
            data: {
                labels: !columns || columns.length === 0 ? ['values'] : columns,
                datasets: [{
                    datalabels: {
                        align: 'end',
                        anchor: 'start'
                    },
                    label: '',
                    data: [],
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                elements: {
                    bar: {
                        borderWidth: 2,
                    }
                },
                responsive: true,
                plugins: {
                    datalabels: {
                        backgroundColor: function (context) {
                            return context.dataset.backgroundColor;
                        },
                        borderRadius: 4,
                        color: 'white',
                        font: {
                            weight: 'bold'
                        },
                        formatter: Math.round,
                        padding: 6
                    },
                    legend: {
                        position: 'right',
                    },
                    title: {
                        display: true,
                        text: ''
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        return {
            bindto: bindto,
            columns: columns,
            title: title,
            colors: colors,
            axis: axis,
            grid: grid,
            legend: legend,
            tooltip: tooltip,
            chartobject: chart
        }
    }

    function createAreaSplineChart(bindto, columns, colors, axis, grid, legend, tooltip, type) {
        var canvas = document.createElement("canvas");
        $(bindto).append(canvas);
        var chart = new Chart(canvas, {
            plugins: [ChartDataLabels],
            type: 'line',
            options: {
                responsive: true,
                plugins: {
                    datalabels: {
                        backgroundColor: function (context) {
                            return context.dataset.backgroundColor;
                        },
                        borderRadius: 4,
                        color: 'white',
                        font: {
                            weight: 'bold'
                        },
                        formatter: Math.round,
                        padding: 6
                    },
                    title: {
                        display: true,
                        text: ''
                    },
                    tooltip: {
                        mode: 'index'
                    },
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    },
                    y: {
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Value'
                        }
                    }
                }
            },
            data: {
                columns: columns,
                colors: colors,
                type: type
            },
            bar: {
                width: {
                    ratio: 0.5
                }
            },
            axis: axis,
            grid: grid,
            legend: {
                show: legend
            },
            tooltip: {
                show: tooltip
            },
            labels: true
        });

        return {
            bindto: bindto,
            columns: columns,
            colors: colors,
            axis: axis,
            legend: legend,
            tooltip: tooltip,
            chartobject: chart
        }
    }

    function createlinechart(bindto, columns, colors, axis, grid, legend, tooltip) {
        var canvas = document.createElement("canvas");
        $(bindto).append(canvas);

        var chart = new Chart(canvas, {
            plugins: [ChartDataLabels],
            type: 'line',
            data: {
                x: 'x',
                columns: columns,
                type: 'line',
                colors: colors
            },

            axis: axis,
            grid: grid,
            legend: {
                show: legend
            },
            tooltip: {
                show: tooltip
            },
            labels: true,
            options: {
                responsive: true,
                plugins: {
                    datalabels: {
                        backgroundColor: function (context) {
                            return context.dataset.backgroundColor;
                        },
                        borderRadius: 4,
                        color: 'white',
                        font: {
                            weight: 'bold'
                        },
                        formatter: Math.round,
                        padding: 6
                    },
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false                        
                    }
                }
            },
        });

        return {
            bindto: bindto,
            columns: columns,
            colors: colors,
            axis: axis,
            grid: grid,
            legend: legend,
            tooltip: tooltip,
            chartobject: chart
        }
    }

    function createDonutchart(bindto, columns, colors, order, title, label, width) {
        var canvas = document.createElement("canvas");
        $(bindto).append(canvas);

        var chart = new Chart(canvas, {
            plugins: [ChartDataLabels],
            type: 'doughnut',
            data: {},
            options: {
                responsive: true,
                plugins: {
                    datalabels: {
                        backgroundColor: function (context) {
                            return context.dataset.backgroundColor;
                        },
                        borderRadius: 4,
                        color: 'white',
                        font: {
                            weight: 'bold'
                        },
                        formatter: Math.round,
                        padding: 6
                    },
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false
                    }
                }
            },
        });

        return {
            bindto: bindto,
            columns: columns,
            colors: colors,
            order: order,
            title: title,
            label: label,
            width: width,
            chartobject: chart
        }
    }

    function createPiechart(bindto, columns, colors, order, title, label, width) {
        var canvas = document.createElement("canvas");
        $(bindto).append(canvas);

        var chart = new Chart(canvas, {
            plugins: [ChartDataLabels],
            type: 'pie',
            data: {
                columns: [],
                type: 'pie',
                colors: colors,
                order: order
            },
            options: {
                responsive: true,
                plugins: {
                    datalabels: {
                        backgroundColor: function (context) {
                            return context.dataset.backgroundColor;
                        },
                        borderRadius: 4,
                        color: 'white',
                        font: {
                            weight: 'bold'
                        },
                        formatter: Math.round,
                        padding: 6
                    },
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false
                    }
                }
            }
        });

        return {
            bindto: bindto,
            columns: columns,
            colors: colors,
            order: order,
            title: title,
            label: label,
            width: width,
            chartobject: chart
        }
    }

    function createGaugechart(bindto, columns, colors, order, title, label, width) {
        var canvas = document.createElement("canvas");
        canvas.style = "width:100%;height:100%";
        $(bindto).append(canvas);

        var opts = {
            angle: 0, // The span of the gauge arc
            lineWidth: 0.44, // The line thickness
            radiusScale: 0.83, // Relative radius
            pointer: {
                length: 0.6, // // Relative to gauge radius
                strokeWidth: 0.035, // The thickness
                color: '#000000' // Fill color
            },
            limitMax: false, // If false, max value increases automatically if value > maxValue
            limitMin: false, // If true, the min value of the gauge will be fixed
            colorStart: '#6FADCF', // Colors
            colorStop: '#8FC0DA', // just experiment with them
            strokeColor: '#E0E0E0', // to see which ones work best for you
            generateGradient: true,
            highDpiSupport: true // High resolution support
        }

        var chart = new Gauge(canvas).setOptions(opts)         
        return {
            bindto: bindto,
            columns: columns,
            colors: colors,
            order: order,
            title: title,
            label: label,
            width: width,
            chartobject: chart
        }

    }

    function createAreaStepChart(bindto, columns, colors, axis, type, legend, tooltip) {
        var canvas = document.createElement("canvas");
        $(bindto).append(canvas);

        var chart = new Chart(canvas, {
            plugins: [ChartDataLabels],
            type: 'line',
            data: {
                columns: columns,
                colors: colors,
                types: type
            },
            axis: axis,
            tooltip: tooltip,
            labels: true,
            options: {
                responsive: true,
                interaction: {
                    intersect: false,
                    axis: 'x'
                },
                plugins: {
                    datalabels: {
                        backgroundColor: function (context) {
                            return context.dataset.backgroundColor;
                        },
                        borderRadius: 4,
                        color: 'white',
                        font: {
                            weight: 'bold'
                        },
                        formatter: Math.round,
                        padding: 6
                    },
                    title: {
                        display: true,
                        text: '',
                    }
                }
            }
        });

        return {
            bindto: bindto,
            columns: columns,
            colors: colors,
            axis: axis,
            type: type,
            legend: legend,
            tooltip: tooltip,
            chartobject: chart
        }
    }

    function createStackBarchart(bindto, columns, colors, axis, grid, legend, tooltip, group, thickness) {
        var canvas = document.createElement("canvas");
        $(bindto).append(canvas);

        var chart = new Chart(canvas, {
            plugins: [ChartDataLabels],
            type: 'bar',
            data: {},
            options: {
                plugins: {
                    datalabels: {
                        backgroundColor: function (context) {
                            return context.dataset.backgroundColor;
                        },
                        borderRadius: 4,
                        color: 'white',
                        font: {
                            weight: 'bold'
                        },
                        formatter: Math.round,
                        padding: 6
                    },
                    title: {
                        display: false
                    },
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true
                    }
                }
            }
        });

        return {
            bindto: bindto,
            columns: columns,
            colors: colors,
            axis: axis,
            grid: grid,
            legend: legend,
            tooltip: tooltip,
            group: group,
            thickness: thickness,
            chartobject: chart
        }
    }

    function createAreachart(bindto, columns, colors, axis, grid, legend, tooltip, point, zoom) {
        var canvas = document.createElement("canvas");
        $(bindto).append(canvas);

        var chart = new Chart(canvas, {
            plugins: [ChartDataLabels],
            data: {},
            options: {
                plugins: {
                    datalabels: {
                        backgroundColor: function (context) {
                            return context.dataset.backgroundColor;
                        },
                        borderRadius: 4,
                        color: 'white',
                        font: {
                            weight: 'bold'
                        },
                        formatter: Math.round,
                        padding: 6
                    },
                    filler: {
                        propagate: true
                    }
                }
            }
        });

        return {
            bindto: bindto,
            columns: columns,
            colors: colors,
            axis: axis,
            grid: grid,
            legend: legend,
            tooltip: tooltip,
            point: point,
            zoom: zoom,
            chartobject: chart
        }
    }

    function showlegend(chart, legendnames) {
        chart.chartobject.legend.show(legendnames);
    }  

    function reloaddata(chart, chartSeriesData) {
        switch (chart.type) {
            case 'gauge':                
                chart.chartobject.maxValue = chartSeriesData[0][2] // set max gauge value
                chart.chartobject.setMinValue(0) // Prefer setter over gauge.minValue = 0
                chart.chartobject.animationSpeed = 32 // set animation speed (32 is default value)
                chart.chartobject.set(chartSeriesData[0][1]) // set actual value
                break;
            default:
                chart.chartobject.data.datasets = [];
                if (chartSeriesData.length === 1) {
                    chart.chartobject.data.labels = Array.from(Array(chartSeriesData[0].length).keys())
                    chart.chartobject.data.datasets.push({
                        data: chartSeriesData[0], label: chart.LegendTitle || 'Amount', datalabels: {
                            align: 'center',
                            anchor: 'center'
                        } });
                }
                else {
                    chart.chartobject.data.labels = chartSeriesData.map(x => x[0]);
                    chart.chartobject.data.datasets.push({
                        data: chartSeriesData.map(x => x[1]), datalabels: {
                            align: 'center',
                            anchor: 'center'
                        } });
                }
                break;
        }
        
        chart.chartobject.update();
    }

    function reloaddataForXaxisBarchart(chart, chartSeriesData, bindto, category, amount, color) {
        // latter it  will be  change to load data  //
        new Chart({
            plugins: [ChartDataLabels],
            bindto: bindto,
            data: {
                x: 'x',
                columns: chartSeriesData,
                colors: color,
                type: 'bar',

                labels: {
                    format: function (value, ratio, id) {
                        var accurateValue = (Math.round((value * 100) / amount))
                        return accurateValue + '%'
                    }
                }
            },
            bar: {
                width: 20

            },
            axis: {
                x: {
                    type: category // this needed to load string x value
                },
                y: { show: false }
            }
        });
    }

    function unloadData(chart, keyValue) {
        chart.chartobject.unload({
            ids: keyValue
        });
    }

    function unloadAll(chart) {
        chart.chartobject.unload();
    }

    function hideColumnChart(chart, columnName) {
        chart.chartobject.hide(columnName);
    }

    function drawaverageline(chart, averageTotalAmount) {
        chart.chartobject.ygrids([{
            value: averageTotalAmount
        }]);
    }

    return {
        createbarchart: createbarchart,
        createlinechart: createlinechart,
        createAreaStepChart: createAreaStepChart,
        showlegend: showlegend,
        hideColumnChart: hideColumnChart,
        reloaddata: reloaddata,
        drawaverageline: drawaverageline,
        createAreachart: createAreachart,
        createStackBarchart: createStackBarchart,
        createDonutchart: createDonutchart,
        createAreaSplineChart: createAreaSplineChart,
        reloaddataForXaxisBarchart: reloaddataForXaxisBarchart,
        unloadData: unloadData,
        unloadAll: unloadAll,
        createhorizonalbarchart: createhorizonalbarchart,
        createPiechart: createPiechart,
        createGaugechart: createGaugechart
    }
};
