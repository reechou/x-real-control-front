$(function() {
    $('#tab_operation').addClass('weui_bar_item_on');
    $('#all_tag_select').hide();
    $('#query_button').hide();

    var router = new Router({
        container: '#container',
        enterTimeout: 250,
        leaveTimeout: 250
    });

    var home = {
        url: '/',
        className: 'tabbar',
        render: function() {
            return $('#tpl_opr_home').html();
        }
    };

    var oprGraph = {
        url: '/opr_graph',
        className: 'tabbar',
        render: function() {
            return $('#tpl_opr_graph').html();
        }
    };

    router.push(home)
        .push(oprGraph)
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
    $.ajax({
        type: 'POST',
        url: '/proxy/manager/list_apps',
        success: function(res) {
            appList = res.data.items
            var appBody = "";
            $.each(appList, function(appIdx, appInfo) {
                appBody += "<option value='" + appIdx + "'>" + appInfo.application + "</option>";
            });
            $('.app_select').append(appBody);
        }
    });
});

function changeApp() {
    var req = {};
    req["application"] = appList[$('.app_select').val()].application;
    $.ajax({
        type: 'POST',
        url: '/proxy/manager/list_business_from_app',
        data: JSON.stringify(req),
        success: function(res) {
            var businessBody = "<div class='weui_cell weui_cell_select weui_select_after'>" +
                "<div class='weui_cell_hd'>" +
                    "<label for='' class='weui_label'>监控大类</label>" +
                "</div>" +
                "<div class='weui_cell_bd weui_cell_primary'>" +
                    "<select class='weui_select busi_select' name='select2' onchange='changeBusi()'>" +
                    "</select>" +
                "</div>" +
            "</div>";
            $('.graph_select').append(businessBody);
            businessList = res.data;
            var busiBody = ""
            $.each(businessList, function(busiIdx, busiInfo) {
                busiBody += "<option value='" + busiIdx + "'>" + busiInfo.business + "</option>";
            });
            $('.busi_select').append(busiBody);
        }
    });
}

function changeBusi() {
    var req = {};
    req["application"] = appList[$('.app_select').val()].application;
    req["business"] = businessList[$('.busi_select').val()].business;
    $.ajax({
        type: 'POST',
        url: '/proxy/manager/list_metric_from_app_business',
        data: JSON.stringify(req),
        success: function(res) {
            var metricBody = "<div class='weui_cell weui_cell_select weui_select_after'>" +
                "<div class='weui_cell_hd'>" +
                    "<label for='' class='weui_label'>指标/Metric</label>" +
                "</div>" +
                "<div class='weui_cell_bd weui_cell_primary'>" +
                    "<select class='weui_select metric_select' name='select2' onchange='changeMetric()'>" +
                    "</select>" +
                "</div>" +
            "</div>";
            $('.graph_select').append(metricBody);
            metricList = res.data;
            var mBody = ""
            $.each(metricList, function(metricIdx, metricInfo) {
                mBody += "<option value='" + metricIdx + "'>" + metricInfo.metric + "</option>";
            });
            $('.metric_select').append(mBody);
            $('#query_button').show()
        }
    });
}

function changeMetric() {
    var req = {};
    req["business"] = businessList[$('.busi_select').val()].business;
    req["metric"] = metricList[$('.metric_select').val()].metric;
    req["index"] = {}
    req["index"]["application"] = appList[$('.app_select').val()].application;
    $.ajax({
        type: 'POST',
        url: '/proxy/query/tags',
        data: JSON.stringify(req),
        success: function(res) {
            tagsMap = res.data
            $.each(tagsMap, function(tagKey, tagValue) {
                var tagClass = tagKey + "_select";
                var tagBody = "<div class='weui_cell weui_cell_select weui_select_after'>" +
                    "<div class='weui_cell_hd'>" +
                        "<label for='' class='weui_label'>" + tagKey + "</label>" +
                    "</div>" +
                    "<div class='weui_cell_bd weui_cell_primary'>" +
                        "<select class='weui_select " + tagClass + "' name='select2' onchange='changeTag()'>" +
                        "</select>" +
                    "</div>" +
                "</div>";
                $('.tag_select').append(tagBody);
                var mBody = "";
                $.each(tagValue, function(tagIdx, tagInfo) {
                    mBody += "<option value='" + tagIdx + "'>" + tagInfo + "</option>";
                });
                $('.'+tagClass).append(mBody);
            });
        }
    });
}

var appList, businessList, metricList;
var tagsMap, selectedTagsMap;
