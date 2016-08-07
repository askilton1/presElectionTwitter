app.constant("chartOptions", {
	"DONALD": {
        chart: {
            type: 'discreteBarChart',
            height: 450,
            margin : {
                top: 20,
                right: 20,
                bottom: 45,
                left: 60
            },
            duration: 500,
            reduceXTicks: false,
            yAxis: {
                axisLabel: 'Tweets',
                axisLabelDistance: -40,
                tickFormat: function(d){
                    return d;
                }
            }
        }
    },
    "HASHTAG": {
        chart: {
            type: 'multiBarChart',
            height: 450,
            margin : {
                top: 20,
                right: 20,
                bottom: 45,
                left: 60
            },
            duration: 500,
            stacked: true,
            reduceXTicks: false,
            xAxis: {
                axisLabel: 'Hashtags Used',
                showMaxMin: false,
                tickFormat: function(d){
                    return d;
                }
            },
            yAxis: {
                axisLabel: 'Tweets',
                axisLabelDistance: 0,
                tickFormat: function(d){
                    return d;
                }
            }
        }
    },
    "DAY_OF_WEEK": {
        chart: {
            type: 'multiBarChart',
            height: 450,
            margin : {
                top: 20,
                right: 20,
                bottom: 45,
                left: 60
            },
            clipEdge: true,
            duration: 500,
            stacked: true,
            reduceXTicks: false,
            xAxis: {
                axisLabel: 'Day of Week',
                showMaxMin: false,
                tickFormat: function(d){
                    return d;
                }
            },
            yAxis: {
                axisLabel: 'Tweets',
                axisLabelDistance: 0,
                tickFormat: function(d){
                    return d;
                }
            }
        }
    },
    "DAILY_RT": {
        chart: {
            type: 'multiBarChart',
            height: 450,
            margin : {
                top: 20,
                right: 20,
                bottom: 45,
                left: 60
            },
            clipEdge: true,
            duration: 500,
            stacked: true,
            reduceXTicks: false,
            xAxis: {
                axisLabel: 'Day of Week',
                showMaxMin: false,
                tickFormat: function(d){
                    return d;
                }
            },
            yAxis: {
                axisLabel: 'Average Retweets',
                axisLabelDistance: 0,
                tickFormat: function(d){
                    return d;
                }
            }
        }
    },
    "SOURCES": {
        chart: {
            type: 'multiBarChart',
            height: 450,
            margin : {
                top: 20,
                right: 20,
                bottom: 100,
                left: 60
            },
            clipEdge: false,
            duration: 500,
            stacked: true,
            staggerLabels: true,
            reduceXTicks: false,
            rotateLabels: -45,
            xAxis: {
                showMaxMin: false,
                tickFormat: function(d){
                    return d;
                }
            },
            yAxis: {
                axisLabel: 'Tweets',
                axisLabelDistance: 0,
                tickFormat: function(d){
                    return d;
                }
            }
        }
    },
    "HOURLY": {
        chart: {
            type: 'multiBarChart',
            height: 450,
            margin : {
                top: 20,
                right: 20,
                bottom: 45,
                left: 60
            },
            clipEdge: true,
            duration: 500,
            stacked: true,
            reduceXTicks: false,
            xAxis: {
                axisLabel: 'Hour of Day',
                showMaxMin: false,
                tickFormat: function(d){
                    return d;
                }
            },
            yAxis: {
                axisLabel: 'Tweets',
                axisLabelDistance: 0,
                tickFormat: function(d){
                    return d;
                }
            }
        }
    },
    "SCATTERPLOT": {
        chart: {
            type: 'scatterChart',
            height: 450,
            scatter: { onlyCircles: true },
            pointRange: [10, 1000],
            showDistX: true,
            showDistY: true,
            tooltip: {
                contentGenerator: function(key, x, y, e, graph) {
                    var header = '<h4>@' + key.series[0].key + '</h4>';
                    var body = '<p>' + key.point.body + '</p>';
                    var retweets = '<p> <b>Retweets:</b> ' + key.point.y;
                    var favorites = ' <b>Favorites:</b> ' + key.point.x + '</p>'; 
                    return '<div class="tooltip-scatter-box">' + header + body + retweets + favorites + '</div>';
                }
            },
            duration: 350,
            xAxis: {
                axisLabel: 'Favorites',
                tickFormat: function(d) { return d; }
            },
            yAxis: {
                axisLabel: 'Retweets',
                axisLabelDistance: 10,
                tickFormat: function(d) { return d; }
            }
        }
    },
    "FAME_FILTER": 5000,
    "FAME_MAX": 1000000,
    "FAME_SIZE": 1000
});