var emailFlag = false;
var phoneFlag = false;
var emailPswFlag = false;
var phonePswFlag = false;
var pswStrong = 0;
var role = "";
var InterValObj; //timer变量，控制时间 
var count = 60; //间隔函数，1秒执行 
var curCount; //当前剩余秒数 
var currentId;//当前注册成功用户ID

layui.use('layer', function(){
  var layer = layui.layer;
});  

$('.role-item').click(function() {
	$(this).addClass('role-active');
	$('.role-item').not(this).removeClass('role-active');
	if($(this).text() == "甲方") {
		role = "firstParty"
	} else if($(this).text() == "设计师") {
		role = "freeDesigner"	
	} else {
		role = "projectManager"
	}
})

$('#btnNext').click(function() {
	if(role==""){
		layer.msg("请先选择注册的身份！")
	}else{
		$('#registerBox').css('display', 'block');
		$('#roleBox').css('display', 'none');
		$('.hasAccount').css('display', 'block');
	}

})

$('#btnRegister').on('click', function() {
	var psw = $('#password').val();
	var rePsw = $('#rePassword').val();
})

//手机号密码验证
$('#password').bind("input propertychange", function(event) {
	var psw = $("#password").val();
	pswStrong = checkStrong(psw);
	checkPhonePsw();
	if(psw.length > 0) {
		$('#passwordStrongBox').css('display', 'block');
		$(".password-strong-item:lt(" + pswStrong + ")").css('background', 'rgb(139,22,11)');
		$(".password-strong-item:gt(" + (pswStrong - 1) + ")").css('background', 'rgb(128,128,128)');
		if(pswStrong == 0) {
			$(".password-strong-item").css('background', 'rgb(128,128,128)');
		}
	} else {
		$('#passwordStrongBox').css('display', 'none');
	}
});

$('#rePassword').bind("input propertychange", function(event) {
	checkPhonePsw();
});

//邮箱密码强度验证
$('#emailPsw').bind("input propertychange", function(event) {
	var psw = $("#emailPsw").val();
	pswStrong = checkStrong(psw);
	checkEmailPsw();
	if(psw.length > 0) {
		$('#passwordEmailStrongBox').css('display', 'block');
		$(".email-password-strong-item:lt(" + pswStrong + ")").css('background', 'rgb(139,22,11)');
		$(".email-password-strong-item:gt(" + (pswStrong - 1) + ")").css('background', 'rgb(128,128,128)');
		if(pswStrong == 0) {
			$(".password-strong-item").css('background', 'rgb(128,128,128)');
		}
	} else {
		$('#passwordEmailStrongBox').css('display', 'none');
	}
});

$('#emailPsw2').bind("input propertychange", function(event) {
	checkEmailPsw();
});

function checkEmailPsw() {
	var psw = $("#emailPsw").val();
	var rePassword = $("#emailPsw2").val();
	if(psw != rePassword) {
		$('#rePasswordEmailCheck').css('display', 'block');
	} else {
		$('#rePasswordEmailCheck').css('display', 'none');
		emailPswFlag = true;
	}
}

function checkPhonePsw() {
	var psw = $("#password").val();
	var rePassword = $("#rePassword").val();
	if(psw != rePassword) {
		$('#rePasswordCheck').css('display', 'block');
	} else {
		$('#rePasswordCheck').css('display', 'none');
		phonePswFlag = true;
	}
}

//大写字母、小写字母、数字、特殊字符 满足其中三种即可
function checkStrong(value) {
	var reg = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
	var strength = 0;
	if(value.length > 5 && value.match(/[\da-zA-Z]+/)) {
		if(value.match(/\d+/)) {
			strength++;
		}
		if(value.match(/[a-z]+/)) {
			strength++;
		}
		if(value.match(/[A-Z]+/)) {
			strength++;
		}
		if(reg.test(value)) {
			strength++;
		}
	}
	return strength;
}

//邮箱密码验证
$('#emailAddress').bind("input propertychange", function(event) {
	var emailAddress = $('#emailAddress').val().trim();
	var re = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
	if(re.test(emailAddress)) {
		$('#emailAddressError').css('display', 'none');
		emailFlag = true;
	} else {
		$('#emailAddressError').css('display', 'block');
		emailFlag = false;
	}
});

//获取邮箱验证码
function getEmailCodeFn(){
	curCount = count;
	var emailAddress = $('#emailAddress').val().trim();
	if(!emailFlag) {
		layer.msg("请输入正确的邮箱格式！");
	} else {
		$.ajax({
			type: "GET",
			url: apiUrl + "/client/api/member/exists?email=" + emailAddress,
			crossDomain: true == !(document.all),
			xhrFields: {withCredentials: true},
			success: function(res) {
				if(res) {
					layer.msg("该账号已注册！");
				} else {
					$.ajax({
						type: "get",
						crossDomain: true,
						url: apiUrl + "/client/api/assist/getCodeByEmail",
						data: {
							email: emailAddress
						},
						success: function(res) {
							if(res.status == 200) {
								if (window.ActiveXObject || "ActiveXObject" in window){
										$('.phoneTitle').css('margin', '-90px');
									}else{
										$('.phoneTitle').css('margin', '-48px');
									}
								$("#btnGetEmailCode").attr('onclick','null');
								$("#btnGetEmailCode").html(curCount + "秒后重新获取");
								InterValObj = window.setInterval(SetRemainTimesEmail, 1000); //启动计时器，1秒执行一次 
							} else if(res.status == 403) {
								layer.msg("请求频繁，请稍后再试！");
							} else {
								layer.msg("请求错误！");
							}
						}
					});
				}
			}
		});

	}
}


//手机号码正则验证
$('#phoneNum').bind("input propertychange", function(event) {
	var phoneNum = $('#phoneNum').val().trim();
	var re = /^[1][3-9][0-9]{9}$/;
	if(re.test(phoneNum)) {
		$('#phoneNumError').css('display', 'none');
		phoneFlag = true;
	} else {
		$('#phoneNumError').css('display', 'block');
		phoneFlag = false;
	}
});

//手机获取验证码

function getPhoneCodeFn(){
	var phone = $('#phoneNum').val().trim();
	curCount = count;
	if(!phoneFlag) {
		layer.msg("请输入正确的手机号码！");
	} else {
		$.ajax({
			type: "GET",
			url: apiUrl + "/client/api/member/exists?phoneNum=" + phone,
			crossDomain: true == !(document.all),
			xhrFields: {withCredentials: true},
			success: function(res) {
				if(res) {
					layer.msg("该账号已注册！");
				} else {
					$.ajax({
						type: "get",
						crossDomain: true,
						url: apiUrl + "/client/api/assist/getCodeByPhoneNum",
						data: {
							phoneNum: phone,
							template:"register"
						},
						success: function(res) {
							if(res.status == 200) {
									if (window.ActiveXObject || "ActiveXObject" in window){
										$('.phoneTitle').css('margin', '-90px');
									}else{
										$('.phoneTitle').css('margin', '-48px');
									}
									$("#btnGetPhoneCode").attr("onclick", "null");
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
}

//邮箱timer处理函数 
function SetRemainTimesEmail() {
	if(curCount == 0) {
		$('.phoneTitle').css('margin', '-32px');
		window.clearInterval(InterValObj); //停止计时器 
//		$("#btnGetEmailCode").removeAttr("disabled"); //启用按钮 
		$("#btnGetEmailCode").attr('onclick','getEmailCodeFn()');
		$("#btnGetEmailCode").html("重新发送");
	} else {
		curCount--;
		$("#btnGetEmailCode").html(curCount + "秒后重新获取");

	}
}

//手机timer处理函数 
function SetRemainTimesPhone() {
	if(curCount == 0) {
		$('.phoneTitle').css('margin', '-32px');
		window.clearInterval(InterValObj); //停止计时器 
//		$("#btnGetPhoneCode").removeAttr("disabled"); //启用按钮 
		$("#btnGetPhoneCode").attr('onclick','getPhoneCodeFn()');
		$("#btnGetPhoneCode").html("重新发送");
	} else {
		curCount--;
		$("#btnGetPhoneCode").html(curCount + "秒后重新获取");

	}
}

//邮箱注册
$('#btnRegisterByEmail').on('click', function() {
	var emailAddress = $('#emailAddress').val().trim();
	var code = $('#emailCode').val().trim();
	var psw = $('#emailPsw').val().trim();
	var psw2 = $('#emailPsw2').val().trim();
	if(emailAddress == "" || code == "" || psw == "") {
		layer.msg("请填写完整！");
	} else if(!emailPswFlag) {
		layer.msg("两次密码输入不一致！");
	} else if(pswStrong < 1) {
		layer.msg("密码要求长度6-16位！");
	} else {
		$.ajax({
			type: "POST",
			url: apiUrl + "/client/api/member/add",
			crossDomain: true == !(document.all),
			xhrFields: {withCredentials: true},
			data: {
				email: emailAddress,
				code: code,
				password: psw,
				type: role
			},
			success: function(res) {
				if(res.status == 200) {
					layer.msg("注册成功！");
					sessionStorage.setItem('p_member',JSON.stringify(res.data.member));
					sessionStorage.setItem('member',JSON.stringify(res.data.member));
					sessionStorage.setItem('r_code',JSON.stringify(res.data.code));
					$('#registerBox').css('display','none');
					$('.hasAccount').css('display','none');
					$('#sucBox').css('display','block');
					$('#sucUsername').text(emailAddress);
				} else if(res.status == 403) {
					layer.msg("请求频繁，请稍后再试！");
				} else if(res.status == 1004) {
					layer.msg("验证码错误！");
				}
			}
		});
	}
})

//手机注册
$('#btnRegisterByPhone').on('click', function() {
	var phoneNum = $('#phoneNum').val().trim();
	var code = $('#phoneCode').val().trim();
	var psw = $('#password').val().trim();
	var psw2 = $('#rePassword').val().trim();
	if(phoneNum == "" || code == "" || psw == "") {
		layer.msg("请填写完整！");
	} else if(!phonePswFlag) {
		layer.msg("两次密码输入不一致！");
	} else if(pswStrong < 1) {
		layer.msg("密码要求长度6-16位！");
	} else {
		$.ajax({
			type: "POST",
			url: apiUrl + "/client/api/member/add",
			crossDomain: true == !(document.all),
			xhrFields: {withCredentials: true},
			data: {
				phoneNum: phoneNum,
				code: code,
				password: psw,
				type: role
			},
			success: function(res) {
				if(res.status == 200) {
					layer.msg("注册成功！");
					sessionStorage.setItem('p_member',JSON.stringify(res.data.member));
					sessionStorage.setItem('member',JSON.stringify(res.data.member));
					sessionStorage.setItem('r_code',JSON.stringify(res.data.code));
					$('.hasAccount').css('display','none');
					$('#registerBox').css('display','none');
					$('#sucBox').css('display','block');
					$('#sucUsername').text(phoneNum);
				} else if(res.status == 403) {
					layer.msg("请求频繁，请稍后再试！");
				} else {
					layer.msg("请求错误！");
				}
			}
		});
	}
})
//根据身份跳转完善个人信息
$('#btnPerfectInfo').on('click',function(){
	
	var memberInfo = sessionStorage.getItem('p_member');
	var type =	JSON.parse(memberInfo).type;
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
})