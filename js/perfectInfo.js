var submitDatas; //最终提交的个人信息
var leftData;
var rightData;
var projectInfo;
var projectDatas;
var personnelIds=[];
var requestUrl;
var member = JSON.parse(sessionStorage.getItem('member'));


var schemeJson = [{name:"方案",id:999,sortPersonnelTypes:[]}]
var drawingJson = [{name:"施工图",id:1000,sortPersonnelTypes:[]}]
var platformSchemeJson = [{name:"方案",id:999,sortPlatformTypes:[]}];
var platformDrawingJson = [{name:"施工图",id:1000,sortPlatformTypes:[]}];


if(!member){window.location.href = "login.html"};

$('.layui-form-label').not('.noRedDot').addClass('redDot');

$('#btnAddCase').on('click', function() {
	layer.open({
		title: '添加项目经验',
		type: 1,
		content: $('.addCaseBox'),
		area: ['500px', '800px']
	});
	document.getElementById("addCaseForm").reset();
})


//修改项目经验数据源
var projectDatas = new Vue({
	el: '#projectDatas',
	data: {
		projectData: member.projectInfos.reverse()
	},
	updated:function(){
		layui.element.render('collapse');
	}
})

//账号回显不可修改
if(member.phoneNum) {
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
		"u_phoneNum": member.phoneNum,
	})
	form.val("formRight", {
		"u_email": member.email
	})
	
	if(member.memberExt){
		form.val("formLeft", {
		"u_phoneNum": member.memberExt.u_phoneNum,
		"u_name":member.memberExt.u_name,
		"workTime":member.memberExt.workTime,
		"year":member.memberExt.birthday.split('-')[0],
		"month":member.memberExt.birthday.split('-')[1]
	})
		form.val("formRight", {
		"u_email": member.memberExt.u_email,
		"realName":member.memberExt.realName,
		"graduateInstitutions":member.memberExt.graduateInstitutions,
		"sex":member.memberExt.sex?"true":"false",
//		"personnelIds":member.memberExt.personnelIds[0]
	})
		requestUrl = "/client/api/memberExt/update?_method=put";
	}else{
		requestUrl = "/client/api/memberExt/add";
	}
});

//表单提交事件合并
$('#btnSubmit').on('click', function() {
	$('#btnSubmitLeft').trigger('click');
	$('#btnSubmitRight').trigger('click');
	var submitInfo = $.extend(leftData, rightData);
	if(leftData && rightData) {
		if(member.projectInfos.length < 1){
			layer.msg("项目经验不能为空,请添加您的项目经验！",{icon:2})
		}else{
		$.ajax({
			type: "POST",
			url: apiUrl + requestUrl,
			traditional: true,
			data: {
				memberId: member.id,
				birthday: submitInfo.year + "-" + submitInfo.month,
				graduateInstitutions: submitInfo.graduateInstitutions,
				realName: submitInfo.realName,
				u_email: submitInfo.u_email,
//				u_name: submitInfo.u_name,
				u_phoneNum: submitInfo.u_phoneNum,
				sex: submitInfo.sex,
				workTime: submitInfo.workTime,
				personnelIds:personnelIds,
				code:sessionStorage.getItem('r_code')
			},
			success: function(res) {
				if(member.status != "normal") {
					layer.open({
						  content: '提交成功！请等待管理员审核通过！',
						  icon:1,
						  yes: function(index, layero){
							window.location.href = 'login.html';
						    layer.close(index); //如果设定了yes回调，需进行手工关闭
						  }
					});  
				} else if(member.status == "normal") {
					layer.msg("提交成功！", {
						icon: 1
					});
					member.memberExt = res;
					sessionStorage.setItem('member',JSON.stringify(member));
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

	}
})

//获取微信二维码
$.ajax({
	type: "get",
	url: apiUrl + "/wx/assist/qrcode?memberId=" + member.id,
	async: true,
	success: function(res) {
		$('.qrCodeText').css('display', 'block');
		var qrcode = new QRCode("qrcode", {
			text: res.url,
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
		async:true,
		url: apiUrl + "/client/api/projectInfo/add",
		data: {
			memberId: memberId,
			name: projectInfo.name,
			platformId: projectInfo.platformId.split('/')[projectInfo.platformId.split('/').length-1],
			ownerName: projectInfo.ownerName,
			ownerCases: projectInfo.ownerCases,
			ownerLevel:projectInfo.ownerLevel,
			assetScale: projectInfo.assetScale,
			finishDate: projectInfo.finishDate,
			city: projectInfo.city,
			scale: projectInfo.scale,
			role: projectInfo.role,
			startDate: projectInfo.joinDate.split(',')[0].trim(),
			endDate: projectInfo.joinDate.split(',')[1].trim()

		},
		success: function(res) {
			layer.open({
			  content: '添加成功！',
			  icon:1,
			  yes: function(index, layero){
			    layer.closeAll(); //如果设定了yes回调，需进行手工关闭
			    getProjectInfos(member.id);
			}
		});  
		},
		error: function() {
			layer.msg("提交失败！", {
				icon: 5
			});
		}
	});
}

//擅长领域联动
var formSelects = layui.formSelects;
	$.ajax({
		type:"get",
		url:apiUrl+'/client/api/personnelType/findPage',
//		async:true,
		success:function(res){
			for(var i=0;i<res.content.length;i++){
				if(res.content[i].type=="scheme"){
					schemeJson[0].sortPersonnelTypes = schemeJson[0].sortPersonnelTypes.concat(res.content[i]);
				}else{
					drawingJson[0].sortPersonnelTypes = drawingJson[0].sortPersonnelTypes.concat(res.content[i]);
				}
			}
			console.log(schemeJson.concat(drawingJson));
			formSelects.data('select_person', 'local', {
				arr:schemeJson.concat(drawingJson),
	            linkage: true,
	            linkageWidth: 130
   			 });
		}
	});

//项目分类联动
	$.ajax({
		type:"get",
		url:apiUrl+'/client/api/platformType/findPage',
//		async:true,
		success:function(res){
			for(var i=0;i<res.content.length;i++){
				if(res.content[i].type=="scheme"){
					platformSchemeJson[0].sortPlatformTypes = platformSchemeJson[0].sortPlatformTypes.concat(res.content[i]);
				}else{
					platformDrawingJson[0].sortPlatformTypes = platformDrawingJson[0].sortPlatformTypes.concat(res.content[i]);
				}
			}
			
			formSelects.data('select_platform', 'local', {
				arr:platformSchemeJson.concat(platformDrawingJson),
	            linkage: true,
	            linkageWidth: 130
   			 });
		}
	});
	
	formSelects.config('select_person', {
		keyName: 'name',            //自定义返回数据中name的key, 默认 name
	    keyVal: 'id',            //自定义返回数据中value的key, 默认 value
	    keySel: 'name',         //自定义返回数据中selected的key, 默认 selected
	    keyChildren: 'sortPersonnelTypes'    //联动多选自定义children
    });
    
	formSelects.config('select_platform', {
		keyName: 'name',            //自定义返回数据中name的key, 默认 name
	    keyVal: 'id',            //自定义返回数据中value的key, 默认 value
	    keySel: 'name',         //自定义返回数据中selected的key, 默认 selected
	    keyChildren: 'sortPlatformTypes',    //联动多选自定义children
        success: function(id, url, val, result){
            console.log(result);
        },
        error: function(id, url, val, err){
            console.log("err回调: " + url);
        }
    });
     
     formSelects.on('select_person', function(id, vals, val, isAdd, isDisabled){
     	personnelIds = [];
     	console.log(vals);
     	for(var i=0;i<vals.length;i++){
			 personnelIds.push(vals[i].value.split('/')[vals[i].value.split('/').length-1]);
		}
     	console.log(personnelIds);
	}, true);


$('.layui-colla-title').mouseover(function(){
	$(this).find('.case-delete').eq(0).css('display','block');
}).mouseout(function(){
	$(this).find('.case-delete').eq(0).css('display','none');
})


//查找用户的项目经验
function getProjectInfos(memberId){
	$.ajax({
		type:"get",
		url:apiUrl+"/client/api/projectInfo/findByMemberId",
		async:true,
		data:{
			memberId:member.id,
			sort:'id,desc'
		},
		success:function(res){
			projectDatas.projectData = res;
			member.projectInfos = res.reverse();
			console.log(member);
			sessionStorage.setItem('member',JSON.stringify(member));
		}
	});
}

//删除项目
function deleteProject(id){
	layer.confirm('您确认删除该条项目吗？', {
		  btn: ['确认','取消'] //按钮
		}, function(){
			 $.ajax({
				type:"post",
				url:apiUrl+"/client/api/projectInfo/deleteById",
				async:true,
				data:{
					id:id,
					_method:"delete"
				},
				success:function(res){
					layer.open({
					  content: '删除成功！',
					  icon:1,	
					  yes: function(index, layero){
					    layer.close(index); //如果设定了yes回调，需进行手工关闭
					    getProjectInfos(member.id);
					  }
				});  
				},
				error:function(){
					layer.msg("删除失败",{icon:5})
				}
			});
		}, function(){
		  
		});
}