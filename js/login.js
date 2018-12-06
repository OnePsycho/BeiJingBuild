var reUrl;
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
				console.log(res);
				if(res.status == "200") {
					sessionStorage.setItem('member',JSON.stringify(res.data));
					if(!res.data.memberExt){
						layer.msg("登录成功！请完善个人信息！",{icon: 1});
						perfectAction(res.data.type);
					}else{
						layer.msg('登录成功！',{icon: 1});
						setTimeout(function(){
						 window.location.href = 'index.html';
						},1000);				
					}
				} else if(res.status == "401"||(res.status=="403"&&!res.data)) {
					layer.msg("输入的账号或者密码有误！请重新输入！",{icon: 5});
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
					layer.msg("登录失败！",{icon: 5});
				}
			},
			error:function(){
				layer.msg("输入的账号或者密码有误！请重新输入！",{icon: 5});
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

