$(function() {
    $('#tab_index').addClass('weui_bar_item_on');

    myChart = echarts.init(document.getElementById('home_graph'));

    option = {
        title: {
            show: false,
            text: ''
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: [nowType, yesType, weekType]
        },
        grid: {
            left: '2%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: []
        },
        yAxis: {
            axisLabel: {
                show: true,
                margin: -1,
                textStyle: {
                    align: 'left',
                    baseline: 'bottom',
                    color: '#333'
                }
            },
            type: 'value'
        },
        series: [{
            name: nowType,
            type: 'line',
            data: []
        }, {
            name: yesType,
            type: 'line',
            data: []
        }, {
            name: weekType,
            type: 'line',
            data: []
        }]
    };
    myChart.setOption(option);
    
    $('#home_graph').hide();
});

$(function() {
    $.ajax({
        type: 'POST',
        url: '/proxy/manager/list_graph',
        success: function(res) {
            graphData = res.data
            var groupBody = "";
            var graphBody = "";
            $.each(graphData, function(groupIdx, groupInfo) {
                groupBody += "<option value='" + groupIdx + "'>" + 
                    groupInfo.name + "</option>";
                if (groupIdx == 0) {
                    $.each(groupInfo.graphs, function(graphIdx, graphInfo) {
                        graphBody += "<option value='" + graphIdx + "'>" + 
                            graphInfo.name + "</option>";
                    });
                }
            });
            $('.group_select').append(groupBody);
            $('.graph_select').append(graphBody);
        }
    });
});

function changeGroup(groupIdx) {
    var graphBody = ""
    $.each(graphData[groupIdx].graphs, function(graphIdx, graphInfo) {
        graphBody += "<option value='" + graphIdx + "'>" + 
            graphInfo.name + "</option>";
    });
    $('.graph_select').html(graphBody);
}

function queryGraph() {
    var queryString = graphData[$('.group_select').val()].graphs[$('.graph_select').val()].queryString;
    var query = $.parseJSON(queryString);
    var nowTime = Date.parse(new Date())/1000;
    query["time"] = {};
    query["time"]["begin"] = String(nowTime-3600);
    query["time"]["end"] = String(nowTime);
    queryString = JSON.stringify(query);
    $.ajax({
        type: 'POST',
        url: '/proxy/query/timeseries',
        data: queryString,
        success: function(res) {
            var nowTimeseries = res.series[0].values;
            // drawGraph(nowType, nowTimeseries);
            query["time"]["begin"] = String(nowTime-86400-3600);
            query["time"]["end"] = String(nowTime-86400);
            queryString = JSON.stringify(query);
            $.ajax({
                type: 'POST',
                url: '/proxy/query/timeseries',
                data: queryString,
                success: function(res) {
                    var yesTimeseries = res.series[0].values;
                    // drawGraph(yesType, yesTimeseries);
                    query["time"]["begin"] = String(nowTime-7*86400-3600);
                    query["time"]["end"] = String(nowTime-7*86400);
                    queryString = JSON.stringify(query);
                    $.ajax({
                        type: 'POST',
                        url: '/proxy/query/timeseries',
                        data: queryString,
                        success: function(res) {
                            var weekTimeseries = res.series[0].values;
                            // drawGraph(weekType, weekTimeseries);
                            drawGraph(nowTimeseries, yesTimeseries, weekTimeseries);
                        }
                    });
                }
            });
        }
    });
}

function drawGraph(values0, values1, values2) {
    if (values0 == null) {
        alert("无数据");
        return
    }
    var timeList = [];
    var dataList0 = [];
    var dataList1 = [];
    var dataList2 = [];
    $.each(values0, function(n, point) {
        if (n == (values0.length-1) && point[1] == 0) {
            return
        }
        var date = new Date(point[0]*1000);
        h = date.getHours() + ':';
        m = date.getMinutes();
        timeList.push(h + m);
        dataList0.push(point[1]);
    });
    $.each(values1, function(n, point) {
        dataList1.push(point[1]);
    });
    $.each(values2, function(n, point) {
        dataList2.push(point[1]);
    });
    
    myChart.setOption({
        xAxis: {
            data: timeList
        },
        series: [{
            name: nowType,
            data: dataList0
        }, {
            name: yesType,
            data: dataList1
        }, {
            name: weekType,
            data: dataList2
        }]
    });
    
    $('#home_graph').show();
}

var myChart;
var graphData;
var nowType = "今日";
var yesType = "昨日";
var weekType = "上周今日";
