var submitDatas; //最终提交的个人信息
var leftData;
var rightData;
var projectInfo;
var member = JSON.parse(sessionStorage.getItem('member'));

$('#btnAddCase').on('click', function() {
	layer.open({
		title: '添加项目经验',
		type: 1,
		content: $('.addCaseBox'),
		area: ['500px', '800px']
	});
})

//账号回显不可修改
if(member.phoneNum != "") {
	$('input[name=u_phoneNum]').attr("readonly", true);
} else {
	$('input[name=u_email]').attr("readonly", true);
}

//表单提交
layui.use('form', function() {
	var form = layui.form;
	//监听提交
	form.on('submit(formLeft)', function(data) {
		leftData = data.field;
		return false;
	});
	form.on('submit(formRight)', function(data) {
		rightData = data.field;
		return false;
	});
	form.on('submit(projectInfo)', function(data) {
		projectInfo = data.field;
		if(projectInfo) {
			uploadProjectInfo(member.id);
		}
		return false;
	});

	//账号回显
	form.val("formLeft", {
		"u_phoneNum": member.phoneNum
	})
	form.val("formRight", {
		"u_email": member.email
	})
});

//表单提交事件合并
$('#btnSubmit').on('click', function() {
	$('#btnSubmitLeft').trigger('click');
	$('#btnSubmitRight').trigger('click');
	var submitInfo = $.extend(leftData, rightData);
	if(leftData && rightData) {
		$.ajax({
			type: "POST",
			url: apiUrl + "/client/api/memberExt/add",
			data: {
				memberId: member.id,
				birthday: submitInfo.year + "-" + submitInfo.month,
				graduateInstitutions: submitInfo.graduateInstitutions,
				realName: submitInfo.realName,
				u_email: submitInfo.u_email,
				u_name: submitInfo.u_name,
				u_phoneNum: submitInfo.u_phoneNum,
				sex: submitInfo.sex,
				workTime: submitInfo.workTime
			},
			success: function(res) {
				if(member.status != "normal") {
					layer.msg("提交成功！请等待管理员审核通过！", {
						icon: 1
					});
					setTimeout(function() {
						window.location.href = 'login.html';
					}, 1000);
				} else if(member.status == "normal") {
					layer.msg("提交成功！", {
						icon: 1
					});
					setTimeout(function() {
						window.location.href = 'index.html';
					}, 1000);
				}

			},
			error: function() {
				layer.msg("提交失败！", {
					icon: 5
				});
			}
		});
	}
})

//获取微信二维码
$.ajax({
	type: "get",
	url: apiUrl + "/wx/assist/qrcode",
	data: {
		memberId: member.id
	},
	async: true,
	success: function(res) {
		$('.qrCodeText').css('display', 'block');
		var qrcode = new QRCode("qrcode", {
			text: res,
			width: 150,
			height: 150,
			colorDark: "#000000",
			colorLight: "#ffffff",
			typeNumber: 4,
			correctLevel: QRCode.CorrectLevel.H
		});
	}
});

//上传项目经验
function uploadProjectInfo(memberId) {
	$.ajax({
		type: "POST",
		url: apiUrl + "/client/api/projectInfo/add",
		data: {
			memberId: memberId,
			name: projectInfo.name,
			platformId: projectInfo.platformId,
			ownerName: projectInfo.ownerName,
			ownerCases: projectInfo.ownerCases,
			assetScale: projectInfo.assetScale,
			finishDate: projectInfo.finishDate,
			city: projectInfo.city,
			scale: projectInfo.scale,
			role: projectInfo.role,
			startDate: projectInfo.joinDate.split(',')[0].trim(),
			endDate: projectInfo.joinDate.split(',')[1].trim()
		},
		success: function(res) {
			console.log(res);
		},
		error: function() {
			layer.msg("提交失败！", {
				icon: 5
			});
		}
	});
}