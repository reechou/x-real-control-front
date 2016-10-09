$(function() {
    $('#tab_alarm').addClass('weui_bar_item_on');

    var router = new Router({
        container: '#container',
        enterTimeout: 250,
        leaveTimeout: 250
    });

    var home = {
        url: '/',
        className: 'tabbar',
        render: function() {
            return $('#tpl_alarm_home').html();
        }
    };

    var alarmDetail = {
        url: '/alarm_detail/:id/:graph_id',
        className: 'tabbar',
        render: function() {
            detail(this.params.id)
            return $('#tpl_alarm_detail').html();
        }
    };

    router.push(home)
        .push(alarmDetail)
        .setDefault('/')
        .init();

    if (/Android/gi.test(navigator.userAgent)) {
        window.addEventListener('resize', function() {
            if (document.activeElement.tagName == 'INPUT' ||
                document.activeElement.tagName == 'TEXTAREA') {
                window.setTimeout(function() {
                    document.activeElement.scrollIntoViewIfNeeded();
                }, 0);
            }
        })
    }
});

$(function() {
    myChart = echarts.init(document.getElementById('alarm_graph'));

    option = {
        title: {
            show: false,
            text: ''
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: [alarmType]
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
            name: alarmType,
            type: 'line',
            data: []
        }]
    };
    myChart.setOption(option);
    
    $('#alarm_graph').hide();
});

function detail(id) {
    var req = {};
    req["alarmHistoryById"] = new Number(id);
    $.ajax({
        type: 'POST',
        url: '/proxy/manager/get_alarm_history_by_id',
        data: JSON.stringify(req),
        success: function(res) {
            var detail = res.data;
            if (detail == null) {
                alert("查询数据失败");
                return
            }
            $('#alarm_detail_app').html(detail.application);
            $('#alarm_detail_graph').html(detail.graphName);
            $('#alarm_detail_msg').html(detail.msg);
            var graphReq = {};
            graphReq["graphId"] = detail.graphId;
            $.ajax({
                type: 'POST',
                url: '/proxy/manager/query_graph',
                data: JSON.stringify(graphReq),
                success: function(res) {
                    var graph = res.data;
                    var query = $.parseJSON(graph.queryString);
                    query["time"] = {};
                    query["time"]["begin"] = String()
                    query["time"]["end"] = String()
                }
            });
        }
    });
}

function drawGraph(values) {
    if (values == null) {
        alert("无数据");
        return
    }
    var timeList = [];
    var dataList = [];
    $.each(values, function(n, point) {
        if (n == (values0.length-1) && point[1] == 0) {
            return
        }
        var date = new Date(point[0]*1000);
        Y = date.getFullYear() + '-';
        M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
        D = date.getDate() + ' ';
        h = date.getHours() + ':';
        m = date.getMinutes();
        timeList.push(Y+M+D+h+m+s);
        dataList.push(point[1]);
    });
    myChart.setOption({
        xAxis: {
            data: timeList
        },
        series: [{
            name: alarmType,
            data: dataList
        }]
    });
    
    $('#alarm_graph').show();
}

var myChart;
var alarmType = '告警曲线';
