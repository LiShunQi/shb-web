$(function(){
	var layer;
	var index;
	layui.use('layer', function(){
		layer= layui.layer;
	});
	setTimeout(function () {
        (function($){

            //首先备份下jquery的ajax方法
            var _ajax=$.ajax;

            //重写jquery的ajax方法
            $.ajax=function(opt){
                //备份opt中error和success方法
                var fn = {
                    error:function(XMLHttpRequest, textStatus, errorThrown){},
                    success:function(data, textStatus){}
                }
                if(opt.error){
                    fn.error=opt.error;
                }
                if(opt.success){
                    fn.success=opt.success;
                }

                //扩展增强处理
                var _opt = $.extend(opt,{
                    error:function(XMLHttpRequest, textStatus, errorThrown){
                        //错误方法增强处理
                        layer.alert('连接服务器失败，请稍后重试！')
                        fn.error(XMLHttpRequest, textStatus, errorThrown);
                    },
                    success:function(data, textStatus){
                        if(data.code == 888){
                            layer.alert('未登录，请重新登录！',function(){
                                location.href = 'login.html';
                            });
                            return false;
                        }

                        if(data.code == 666){
                            layer.alert('无权限访问！');
                            return false;
                        }
                        //成功回调方法增强处理
                        fn.success(data, textStatus);
                    },
                    beforeSend:function(XHR){
                        //提交前回调方法
                        index = layer.load(0);

                    },
                    complete:function(XHR, TS){
                        //请求完成后回调函数 (请求成功或失败之后均调用)。
                        layer.close(index);
                    }
                });
                return _ajax(_opt)
            };
        })(jQuery);
    },100)
});
