var reUrl;
var phoneFlag = false;
var InterValObj; //timer变量，控制时间 
var count = 60; //间隔函数，1秒执行 
var curCount; //当前剩余秒数 
var currentId;//当前注册成功用户ID

//DWR消息保存
var dwrArr = [{name:"111"}];
sessionStorage.setItem('dwr',JSON.stringify(dwrArr));


layui.use('layer', function(){
  var layer = layui.layer;
});  
$('#loginBtn').on('click',function(){
	var username = $('#username').val();
	var psw = $('#password').val();
	isPhoneNo(username);
	if(username==""||psw==""){
		layer.msg("用户名或密码不能为空！",{icon: 5});
	}else{
		var index = layer.load();
		$.ajax({
			type: "POST",
			url: apiUrl + reUrl,
			crossDomain: true == !(document.all),
			data:{
				email:username,
				phoneNum:username,
				password:psw
			},
			success: function(res) {
				layer.close(index);
				console.log(res);
				if(res.status == "200") {
					sessionStorage.setItem('member',JSON.stringify(res.data));
					if(!res.data.memberExt){
						layer.msg("登录成功！请完善个人信息！",{icon: 1});
						perfectAction(res.data.type);
					}else{
						layer.msg('登录成功！',{icon:1,time:1000});
						setTimeout(function(){
						 window.location.href = 'index.html';
						},1000);				
					}
				} else if(res.status == "401"||(res.status=="403"&&!res.data)) {
					layer.msg("输入的账号或者密码有误！请重新输入！",{icon: 5,time:1000});
				} else if(res.status == "403"&&res.data) {
					//未通过审核 重新完善信息
//					layer.msg("账号未通过管理员审核！",{icon: 5});
					layer.open({
					  content: '账号未通过管理员审核！请完善个人信息！',
					  icon:5,
					  yes: function(index, layero){
						  perfectAction(res.data.type);
						  sessionStorage.setItem('member',JSON.stringify(res.data));
					    layer.close(index); //如果设定了yes回调，需进行手工关闭
					  }
					});  
				}else if(res.status == "1001") {
					layer.msg("账号正在审核中！",{icon: 5});
					if(!res.data.memberExt){
						layer.open({
						  content: '账号正在审核中！请先完善您的个人信息！',
						  icon:5,
						  yes: function(index, layero){
							  perfectAction(res.data.type);
							  sessionStorage.setItem('member',JSON.stringify(res.data));
						    layer.close(index); //如果设定了yes回调，需进行手工关闭
						  }
						});  
					}
				} else {
					layer.close(index);
					layer.msg("登录失败！",{icon: 5,time:1000});
				}
			},
			error:function(){
				layer.close(index);
				layer.msg("输入的账号或者密码有误！请重新输入！",{icon: 5,time:1000});
			}
		});
	}
})

//回车触发事件
$(document).keyup(function(event){
  if(event.keyCode ==13){
    $("#loginBtn").trigger("click");
  }
});

// 判断账号为手机号还是邮箱
function isPhoneNo(username) {
    var phoneCheck = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])[0-9]{8}$/;
    var emailCheck = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
    if(phoneCheck.test(username)){
    	reUrl = "/client/mobileLogin";
    }else if(emailCheck.test(username)){
    	reUrl = "/client/emailLogin";
    }
}

//手机号码正则验证
$('#phoneNum').bind("input propertychange", function(event) {
	var phoneNum = $('#phoneNum').val().trim();
	var re = /^[1][3-9][0-9]{9}$/;
	if(re.test(phoneNum)) {
		phoneFlag = true;
	} else {
		phoneFlag = false;
	}
});


function perfectAction(type){
		switch (type){
					case "firstParty":
						window.location.href = "perfectInfoFirst.html"
						break;
					case "projectManager":
						window.location.href = "perfectInfoPM.html"
						break;
					case "freeDesigner":
						window.location.href = "perfectInfo.html"
						break;
					default:
						break;
				}
}


//手机获取验证码
$('#btnGetPhoneCode').on('click', function() {
	var phone = $('#phoneNum').val().trim();
	curCount = count;
	if(!phoneFlag) {
		layer.msg("请输入正确的手机号码！");
	} else {
		$.ajax({
			type: "GET",
			url: apiUrl + "/client/api/member/exists?phoneNum=" + phone,
			success: function(res) {
				if(!res) {
					layer.msg("该账号未注册！请前往注册！");
				} else {
					$.ajax({
						type: "get",
						crossDomain: true,
						url: apiUrl + "/client/api/assist/getLoginCode",
						data: {
							phoneNum: phone,
							template:"register"
						},
						success: function(res) {
							if(res.status == 200) {
								$('.phoneTitle').css('margin', '-48px');
								$("#btnGetPhoneCode").attr("disabled", "true");
								$("#btnGetPhoneCode").html(curCount + "秒后重新获取");
								InterValObj = window.setInterval(SetRemainTimesPhone, 1000); //启动计时器，1秒执行一次 
							} else if(res.status == 403) {
								layer.msg("请求频繁，请稍后再试！");
							} else {
								layer.msg("请求错误！");
							}
						}
					});
				}
			}
		})
	}
})


//手机timer处理函数 
function SetRemainTimesPhone() {
	if(curCount == 0) {
		$('.phoneTitle').css('margin', '-32px');
		window.clearInterval(InterValObj); //停止计时器 
		$("#btnGetPhoneCode").removeAttr("disabled"); //启用按钮 
		$("#btnGetPhoneCode").html("重新发送");
	} else {
		$('.phoneTitle').css('margin', '-48px');
		curCount--;
		$("#btnGetPhoneCode").html(curCount + "秒后重新获取");

	}
}


$('#loginBtnByCode').on('click',function(){
			var phoneNum = $('#phoneNum').val();
			var code = $('#phoneCode').val();
			if(phoneNum==""||code==""){
		layer.msg("手机号和验证码不能为空！",{icon: 5});
	}else{
		var index = layer.load();
		$.ajax({
			type: "POST",
			url: apiUrl + '/client/mobileLogin',
			crossDomain: true == !(document.all),
			data:{
				phoneNum:phoneNum,
				code:code
			},
			success: function(res) {
				layer.close(index);
				console.log(res);
				if(res.status == "200") {
					sessionStorage.setItem('member',JSON.stringify(res.data));
					if(!res.data.memberExt){
						layer.msg("登录成功！请完善个人信息！",{icon: 1});
						perfectAction(res.data.type);
					}else{
						layer.msg('登录成功！',{icon:1,time:1000});
						setTimeout(function(){
						 window.location.href = 'index.html';
						},1000);				
					}
				} else if(res.status == "401"||(res.status=="403"&&!res.data)) {
					layer.msg("输入的账号或者密码有误！请重新输入！",{icon: 5,time:1000});
				} else if(res.status == "403"&&res.data) {
					//未通过审核 重新完善信息
//					layer.msg("账号未通过管理员审核！",{icon: 5});
					layer.open({
					  content: '账号未通过管理员审核！请完善个人信息！',
					  icon:5,
					  yes: function(index, layero){
						  perfectAction(res.data.type);
						  sessionStorage.setItem('member',JSON.stringify(res.data));
					    layer.close(index); //如果设定了yes回调，需进行手工关闭
					  }
					});  
				}else if(res.status == "1001") {
					layer.msg("账号正在审核中！",{icon: 5});
					if(!res.data.memberExt){
						layer.open({
						  content: '账号正在审核中！请先完善您的个人信息！',
						  icon:5,
						  yes: function(index, layero){
							  perfectAction(res.data.type);
							  sessionStorage.setItem('member',JSON.stringify(res.data));
						    layer.close(index); //如果设定了yes回调，需进行手工关闭
						  }
						});  
					}
				} else {
					layer.close(index);
					layer.msg("登录失败！",{icon: 5,time:1000});
				}
			},
			error:function(){
				layer.close(index);
				layer.msg("输入的账号或者密码有误！请重新输入！",{icon: 5,time:1000});
			}
		});
	}
})