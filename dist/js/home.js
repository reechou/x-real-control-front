$(function () {
    var router = new Router({
        container: '#container',
        enterTimeout: 250,
        leaveTimeout: 250
    });

    var home = {
        url: '/',
        className: 'tabbar',
        render: function () {
            initHome()
            return $('#tpl_home').html();
        },
        bind: function () {
            $('#container').on('click', '.weui_tabbar_item', function () {
                $(this).addClass('weui_bar_item_on').siblings('.weui_bar_item_on').removeClass('weui_bar_item_on');
            });
        }
    };
    
    var homeDomainList = {
        url: '/domain/:group_id',
        className: 'tabbar',
        render: function () {
            domainList(this.params.group_id)
            return $('#tpl_home_domain').html();
        }
    }; 
    
    var addDomainGroup = {
        url: '/add_domain_group',
        className: 'tabbar',
        render: function () {
            return $('#tpl_home_add_domain_group').html();
        }
    }; 
    
    var addDomain = {
        url: '/add_domain',
        className: 'tabbar',
        render: function () {
            return $('#tpl_home_add_domain').html();
        }
    };
    
    var settingGroup = {
        url: '/setting_group',
        className: 'tabbar',
        render: function () {
            getGroupStatus();
            return $('#tpl_home_setting_group').html();
        }
    };

    router.push(home)
        .push(homeDomainList)
        .push(addDomainGroup)
        .push(addDomain)
        .push(settingGroup)
        .setDefault('/')
        .init();

    if (/Android/gi.test(navigator.userAgent)) {
        window.addEventListener('resize', function () {
            if (document.activeElement.tagName == 'INPUT' || document.activeElement.tagName == 'TEXTAREA') {
                window.setTimeout(function () {
                    document.activeElement.scrollIntoViewIfNeeded();
                }, 0);
            }
        })
    }
});

function initHome() {
    $('#tab_index').addClass('weui_bar_item_on');
    
    $.ajax({
        type: 'POST',
        url: '/proxy/domain/get_domain_groups',
        success: function(res) {
            groupData = res.data
            var groupBody = "";
            $.each(groupData, function(groupIdx, groupInfo) {
                var status  = "";
                if(groupInfo.status == DOMAIN_STATUS_OK) {
                    status = "正常"
                } else {
                    status = "下线"
                }
                groupBody += "<a class='weui_cell' href='#/domain/" + groupInfo.id + "'>" +
                    "<div class='weui_cell_bd weui_cell_primary'>" +
                        "<p class='" + groupInfo.id + "'>[id:" + groupInfo.id + "] " + groupInfo.name + "</p>" +
                    "</div>" +
                    "<div class='weui_cell_ft'>" + status + "</div>" +
                "</a>";
            });
            $('.domian_group').append(groupBody);
        }
    });
}

function domainList(id) {
    var req = {};
    nowGroupID = new Number(id);
    req["groupID"] = nowGroupID;
    $.ajax({
        type: 'POST',
        url: '/proxy/domain/get_domain_list',
        data: JSON.stringify(req),
        success: function(res) {
            domainListData = res.data;
            var domainListBody = "";
            if(domainListData.domainList == null) {
                return;
            }
            $.each(domainListData.domainList, function(domainIdx, domainInfo) {
                var status  = "";
                if(domainInfo.status == DOMAIN_STATUS_OK) {
                    status = "正常"
                } else if(domainInfo.status == DOMAIN_STATUS_DOWN) {
                    status = "*被封*"
                } else {
                    status = "下线"
                }
                domainListBody += "<div class='weui_cell'>" +
                    "<div class='weui_cell_bd weui_cell_primary'>" +
                        "<p>" + domainInfo.domain + "</p>" +
                    "</div>" +
                    "<div class='weui_cell_ft'>" + status + "</div>" +
                "</div>";
            });
            $('.domian_list').append(domainListBody);
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
    req["name"] = $('#group_name').val()
    $.ajax({
        type: 'POST',
        url: '/proxy/domain/add_domain_group',
        data: JSON.stringify(req),
        success: function(res) {
            if(res.code == 0) {
                alert("创建域名组[ " + $('#group_name').val() + " ]成功");
            } else {
                alert("创建域名组[ " + $('#group_name').val() + " ]失败：" + res.msg);
            }
            window.location.href='#/';
        }
    });
}

function addDomain() {
    $('#add_domain_url').addClass('weui_btn_disabled');
    $('#add_domain_url').attr('disabled', 'true');
    $("#add_domain_url").attr('datahref',$("a").attr("href"));
    $("#add_domain_url").removeAttr('href');
    
    if($('#domain_url').val() == '') {
        alert("域名不能为空");
        return
    }
    var req = {};
    req["groupID"] = nowGroupID;
    req["domain"] = $('#domain_url').val();
    $.ajax({
        type: 'POST',
        url: '/proxy/domain/add_domain',
        data: JSON.stringify(req),
        success: function(res) {
            if(res.code == 0) {
                alert("创建域名[ " + $('#domain_url').val() + " ]成功");
            } else {
                alert("创建域名[ " + $('#domain_url').val() + " ]失败：" + res.msg);
            }
            window.location.href='#/domain/' + nowGroupID;
        }
    });
}

function getGroupStatus() {
    var req = {};
    req["groupID"] = nowGroupID;
    $.ajax({
        type: 'POST',
        url: '/proxy/domain/get_domain_group_detail',
        data: JSON.stringify(req),
        success: function(res) {
            if(res.code == 0) {
                if(res.data.status != 0) {
                    $("#if_offline").prop("checked", true);
                }
                if(res.data.shareStatus != 0) {
                    $("#if_force_share").prop("checked", true);
                }
                if(res.data.adsStatus != 0) {
                    $("#if_show_ads").prop("checked", true);
                }
            } else {
                alert("拉取域名组状态失败：" + res.msg);
            }
        }
    });
}

function settingGroup() {
    var req = {};
    if($("#if_offline").attr("checked")) {
        req["status"] = 1
    } else {
        req["status"] = 0
    }
    if($("#if_force_share").attr("checked")) {
        req["shareStatus"] = 1
    } else {
        req["shareStatus"] = 0
    }
    if($("#if_show_ads").attr("checked")) {
        req["adsStatus"] = 1
    } else {
        req["adsStatus"] = 0
    }
    req["id"] = nowGroupID;
    $.ajax({
        type: 'POST',
        url: '/proxy/domain/setting_domain_group',
        data: JSON.stringify(req),
        success: function(res) {
            if(res.code == 0) {
                alert("域名组 [" + nowGroupID + "] 配置成功，大约1分钟左右生效")
            } else {
                alert("域名组 [" + nowGroupID + "] 配置失败：" + res.msg);
            }
            window.location.href='#/domain/' + nowGroupID;
        }
    });
}

const DOMAIN_STATUS_OK = 0;
const DOMAIN_STATUS_DOWN = 1;
const DOMAIN_STATUS_OFF = 2;
var nowGroupID;
