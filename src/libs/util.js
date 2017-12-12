/**
 * Created by lsq on 2017/10/16.
 */
// type:请求类型
// url:请求地址
// parm:请求参数
// func:请求成功后的处理函数
require('jquery.placeholder');
var index = null;
module.exports = {
    //公用ajax方法
    utilAjax:function (type,url,parm,func) {
        $.ajax({
            type:type,
            url:url,
            data:parm,
            cache:false,
            traditional:true,
            dataType:'json',
            beforeSend:function () {
                index = layer.load(3, {shade: [0.2, '#393D49']});
            },
            success:function (res) {
                layer.close(index);
                if(res.code == 888){
                    location.href = 'login.html';
                    return false;
                }
                func(res);
            },
            error:function (err) {
                layer.close(index);
                layer.alert('系统异常！',{icon:2,title:'提示'})
            }
        })
    },
    getAjax:function (type,url,parm,func) {
        $.ajax({
            type:type,
            url:url,
            cache:false,
            data:parm,
            traditional:true,
            dataType:'json',
            success:function (res) {
                if(res.code == 888){
                    location.href = 'login.html';
                    return false;
                }
                func(res);
            },
            error:function (err) {
                layer.alert('系统异常！',{icon:2,title:'提示'})
            }
        })
    },
    //字符串截断
    trunc:function (value,num) {
        if(!value){
            return false;
        }else if(value.length <= num){
            return value;
        }else{
            var return_value = String(value);
            return return_value.substring(0,num)+"...";
        }
    },
    //生成随机色
    getRandomColor:function(){
        var rgb ='rgb('+Math.floor(Math.random()*255)+','
            +Math.floor(Math.random()*255)+','
            +Math.floor(Math.random()*255)+')';
        return rgb;
    },
    //时间格式化
    dateForm:function (time,type) {
        if(!time){
            return '';
        }else{
            var now = new Date(time);
            var year = now.getYear();
            var month = (now.getMonth()+1) < 10?('0'+(now.getMonth()+1)):(now.getMonth()+1);
            var date = now.getDate() < 10?('0'+now.getDate()):now.getDate();
            var hour = now.getHours();
            var minute = now.getMinutes()<10?('0'+now.getMinutes()):now.getMinutes();
            var second = now.getSeconds()<10?('0'+now.getSeconds()):now.getSeconds();
            switch (type){
                case 1:
                    return year + '-' + month + '-' + date;
                    break;
                case 2:
                    return year + '-' + month + '-' + date + "  " + hour + ':' + minute + ':' + second;
                    break;
                default:
                    return year + '-' + month + '-' + date;
            }
        }
    },
    //点击页面空白弹出层隐藏
    clickHide:function (objId) {
        var obj = $(objId);
        $(document).on('click',function (e) {
            if(obj.is(':visible') && !($(e.target).closest(objId).length > 0) ){
                obj.hide();
            }else if(!$(e.target).parents('a')){
                return false;
            }
        })
    },
    //获取地址栏查询字符串
    getSearchString:function (key) {
        // 获取URL中?之后的字符
        var str = location.search;
        str = str.substring(1,str.length);

        var arr = str.split("&");
        var obj = new Object();

        // 将每一个数组元素以=分隔并赋给obj对象
        for(var i = 0; i < arr.length; i++) {
            var tmp_arr = arr[i].split("=");
            obj[decodeURIComponent(tmp_arr[0])] = decodeURIComponent(tmp_arr[1]);
        }
        return obj[key];
    },
    //截取字符串最后两个字
    strTwo:function (str) {
        return str.length>=4?str.substr(str.length-3):str;
    }
};
//退出登录
$('.click-logout').on('click',function () {
    module.exports.utilAjax('get','/taskManage/login/logout',{},function (res) {
        if(res.code == 100){
            layer.msg('已退出,即将跳入登录页面');
            setTimeout(function () {
                location.href='./login.html';
            },1500)
        }else{
            layer.alert(res.msg,{icon:0,title:'提示'});
        }
    })
});
//当前登录用户
if(layui.data('username').hasOwnProperty('username')){
    $('.cur-userName').text(module.exports.strTwo(layui.data('username').username));
}
$(function(){
    $('input[placeholder],textarea[placeholder]').placeholder();
});
//类名切换
$.fn.swithClass = function (one,two) {
    if(this.hasClass(one)){
        this.removeClass(one);
        this.addClass(two);
    }else{
        this.addClass(one);
        this.removeClass(two);
    }
};

