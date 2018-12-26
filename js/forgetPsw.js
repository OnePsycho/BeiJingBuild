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
//var apiUrl = "http://192.168.0.18:8000"
//var apiUrl = "http://test.frp.rongyaotech.com"
var imgUrl = "http://39.104.239.208"
var apiUrl = "http://39.104.239.208:9111"
layui.use('layer', function(){
  var layer = layui.layer;
});  

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

//邮箱获取验证码
$('#btnGetEmailCode').on('click', function() {
	curCount = count;
	var emailAddress = $('#emailAddress').val().trim();
	if(!emailFlag) {
		layer.msg("请输入正确的邮箱格式！");
	} else {
		$.ajax({
			type: "GET",
			url: apiUrl + "/client/api/member/exists?email=" + emailAddress,
			success: function(res) {
				if(res) {
					$.ajax({
						type: "get",
						crossDomain: true,
						url: apiUrl + "/client/api/assist/getCodeByEmail",
						data: {
							email: emailAddress
						},
						success: function(res) {
							if(res.status == 200) {
								$('.phoneTitle').css('margin', '-48px');
								$("#btnGetEmailCode").attr("disabled", "true");
								$("#btnGetEmailCode").html(curCount + "秒后重新获取");
								InterValObj = window.setInterval(SetRemainTimesEmail, 1000); //启动计时器，1秒执行一次 
							} else if(res.status == 403) {
								layer.msg("请求频繁，请稍后再试！");
							} else {
								layer.msg("请求错误！");
							}
						}
					});

				} else {
					layer.msg("该账号暂未注册！");
				}
			}
		});

	}
})
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
				if(res) {
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

				} else {
					layer.msg("该账号暂未注册！");
				}
			}
		})
	}
})

//邮箱timer处理函数 
function SetRemainTimesEmail() {
	if(curCount == 0) {
		$('.phoneTitle').css('margin', '-32px');
		window.clearInterval(InterValObj); //停止计时器 
		$("#btnGetEmailCode").removeAttr("disabled"); //启用按钮 
		$("#btnGetEmailCode").html("重新发送");
	} else {
		$('.phoneTitle').css('margin', '-48px');
		curCount--;
		$("#btnGetEmailCode").html(curCount + "秒后重新获取");

	}
}

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

//邮箱重置密码
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
			url: apiUrl + "/client/api/restPassword/resetPasswordByEmail",
			data: {
				email: emailAddress,
				code: code,
				password: psw,
				rePassword: psw
			},
			success: function(res) {
				if(res.status == 200) {
					layer.msg("修改成功！",{icon:1,time:1000});
					setTimeout(function(){
						window.location.href = 'login.html'
					},1000)
				} else if(res.status == 403) {
					layer.msg("请求频繁，请稍后再试！");
				} else if(res.status == 1004) {
					layer.msg("验证码错误！");
				}
			}
		});
	}
})

//手机重置密码
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
			url: apiUrl + "/client/api/restPassword/resetPasswordByMobile",
			data: {
				phoneNum: phoneNum,
				code: code,
				password: psw,
				rePassword : psw
			},
			success: function(res) {
				if(res.status == 200) {
					layer.msg("修改成功！",{icon:1,time:1000});
					setTimeout(function(){
						window.location.href = 'login.html'
					},1000)
				} else if(res.status == 403) {
					layer.msg("请求频繁，请稍后再试！");
				} else {
					layer.msg("请求错误！");
				}
			}
		});
	}
})
