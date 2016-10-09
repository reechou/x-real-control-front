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
            initContent()
            return $('#tpl_content').html();
        }
    };

    var contentList = {
        url: '/content/:id',
        className: 'tabbar',
        render: function() {
            contentGroup(this.params.id)
            return $('#tpl_content_info').html();
        }
    };
    
    var addContentGroup = {
        url: '/add_content_group',
        className: 'tabbar',
        render: function () {
            return $('#tpl_add_content_group').html();
        }
    }; 
    
    var addContent = {
        url: '/add_content',
        className: 'tabbar',
        render: function () {
            return $('#tpl_add_content').html();
        }
    };

    router.push(home)
        .push(contentList)
        .push(addContentGroup)
        .push(addContent)
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

function initContent() {
    $.ajax({
        type: 'POST',
        url: '/proxy/domain/get_content_group',
        success: function(res) {
            groupData = res.data
            var groupBody = "";
            $.each(groupData, function(groupIdx, groupInfo) {
                groupBody += "<a class='weui_cell' href='#/content/" + groupInfo.id + "'>" +
                    "<div class='weui_cell_bd weui_cell_primary'>" +
                        "<p class='" + groupInfo.id + "'>" + groupInfo.name + "</p>" +
                    "</div>" +
                    "<div class='weui_cell_ft'></div>" +
                "</a>";
            });
            $('.content_group').append(groupBody);
        }
    });
}

function contentGroup(id) {
    var req = {};
    nowGroupID = new Number(id);
    req["groupID"] = nowGroupID;
    $.ajax({
        type: 'POST',
        url: '/proxy/domain/get_content_group_detail',
        data: JSON.stringify(req),
        success: function(res) {
            if(res.code == 0) {
                contentDetail = res.data;
                $('.group_name').html(contentDetail.name);
                var typeStr = "视频";
                if(contentDetail.type == 0) {
                    typeStr = "视频";
                }
                $('.group_type').html(typeStr)
                $('.group_json_url').html(contentDetail.jsonUrl);
                $('.main_content').html(contentDetail.mainContent.join());
            }
        }
    });
    $.ajax({
        type: 'POST',
        url: '/proxy/domain/get_content_list',
        data: JSON.stringify(req),
        success: function(res) {
            if(res.code == 0) {
                contentList = res.data;
                var contentListBody = "";
                if(contentList.contentList == null) {
                    return;
                }
                $.each(contentList.contentList, function(contentIdx, contentInfo) {
                    var contentInfoParse =  $.parseJSON(contentInfo.value);
                    if(contentInfoParse.type == 0) {
                        contentListBody += "<div class='weui_panel weui_panel_access'>" +
                            "<div class='weui_panel_bd'>" +
                            "<div class='weui_media_box weui_media_text'>" +
                                "<p class='weui_media_desc'>[id: " + contentInfo.id + "] " + contentInfo.value + "</p>" +
                            "</div>" +
                            "</div>" +
                        "</div>";
                    } else {
                        contentListBody += "<div class='weui_panel weui_panel_access'>" +
                            "<div class='weui_panel_bd'>" +
                            "<div class='weui_media_box weui_media_text'>" +
                                "<p class='weui_media_desc' style='color: #3CC51F;'>[id: " + contentInfo.id + "] " + contentInfo.value + "</p>" +
                            "</div>" +
                            "</div>" +
                        "</div>";
                    }
                });
                $('.content_list').append(contentListBody);
            }
            
            
        }
    });
}

function addGroup() {
    $('#add_group').addClass('weui_btn_disabled');
    $('#add_group').attr('disabled', 'true');
    $("#add_group").attr('datahref',$("a").attr("href"));
    $("#add_group").removeAttr('href');
    
    if($('#group_name').val() == '') {
        alert("组名不能为空");
        return
    }
    var req = {};
    req["name"] = $('#group_name').val();
    req["type"] = new Number($('#content_type').val());
    $.ajax({
        type: 'POST',
        url: '/proxy/domain/add_content_group',
        data: JSON.stringify(req),
        success: function(res) {
            if(res.code == 0) {
                alert("创建内容组[ " + $('#group_name').val() + " ]成功");
            } else {
                alert("创建内容组[ " + $('#group_name').val() + " ]失败：" + res.msg);
            }
            window.location.href='#/';
        }
    });
}

function addContent() {
    $('#add_content_info').addClass('weui_btn_disabled');
    $('#add_content_info').attr('disabled', 'true');
    $("#add_content_info").attr('datahref',$("a").attr("href"));
    $("#add_content_info").removeAttr('href');
    
    if($('#content_detail').val() == '' || $('#content_title').val() == '' || $('#content_video_src').val() == '' || $('#content_img_url').val() == '' || $('#content_title_img_url').val() == '') {
        alert("提交参数不能为空");
        return
    }
    var req = {};
    req["groupID"] = nowGroupID;
    req["video"] = {};
    req["video"]["content"] = $('#content_detail').val();
    req["video"]["title"] = $('#content_title').val();
    req["video"]["videoSrc"] = $('#content_video_src').val();
    req["video"]["imageUrl"] = $('#content_img_url').val();
    req["video"]["titleImg"] = $('#content_title_img_url').val();
    req["video"]["type"] = new Number($('#content_show_type').val());
    $.ajax({
        type: 'POST',
        url: '/proxy/domain/add_video_content',
        data: JSON.stringify(req),
        success: function(res) {
            if(res.code == 0) {
                alert("创建内容成功");
            } else {
                alert("创建内容失败：" + res.msg);
            }
            window.location.href='#/content/' + nowGroupID;
        }
    });
}

var nowGroupID;
