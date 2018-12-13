var member = JSON.parse(sessionStorage.getItem('member'));
var editContent;
var platformSchemeJson = [{
	name: "方案",
	id: 999,
	platformTypes: []
}];
var platformDrawingJson = [{
	name: "施工图",
	id: 1000,
	platformTypes: []
}];
var formSelects = layui.formSelects;
var licenceUrl = {
	'businessLicence': ""
};
var PMInfo="";
var attachments;
var fileNames=[];
$('#projectName').val(member.memberExt.projectName);
$('.formContainer').find('input[name=projectName]').attr("readonly", true);


//富文本编辑器
layui.use('layedit', function() {
	var layedit = layui.layedit;
	layedit.set({
		uploadImage: {
			url: apiUrl + '/client/api/file/editUpload',
			type:"POST",
			success:function(res){
				console.log(res);
			},
			error:function(Res){
				console.log(Res);
			}
		}
	});
	editContent = layedit.build('content', {
		height: 180
	});
});

//项目分类联动
$.ajax({
	type: "get",
	url: apiUrl + '/client/api/platformType/findPage',
	//		async:true,
	success: function(res) {
		for(var i = 0; i < res.content.length; i++) {
			if(res.content[i].type == "scheme") {
				platformSchemeJson[0].platformTypes = platformSchemeJson[0].platformTypes.concat(res.content[i]);
			} else {
				platformDrawingJson[0].platformTypes = platformDrawingJson[0].platformTypes.concat(res.content[i]);
			}
		}

		formSelects.data('select_platform', 'local', {
			arr: platformSchemeJson.concat(platformDrawingJson),
			linkage: true,
			linkageWidth: 130
		});
	}
});

formSelects.config('select_platform', {
	keyName: 'name', //自定义返回数据中name的key, 默认 name
	keyVal: 'id', //自定义返回数据中value的key, 默认 value
	keySel: 'name', //自定义返回数据中selected的key, 默认 selected
	keyChildren: 'platformTypes', //联动多选自定义children
	success: function(id, url, val, result) {
		console.log(result);
	},
	error: function(id, url, val, err) {
		console.log("err回调: " + url);
	}
});

$('#invitePM').on('click', function() {
	layer.open({
		title: '邀请项目经理',
		type: 1,
		content: $('.invitePMBox'),
		area: ['500px', '700px']
	});
	document.getElementById("invitePMForm").reset();
	$('#licensePreview').css('display','none');
	
})

layui.use('upload', function() {
	var upload = layui.upload;
	//普通图片上传
	var uploadInst = upload.render({
		elem: '#licenseImg',
		url: apiUrl + '/client/api/file/upload',
		accept: 'file',
		exts: 'jpg|png',
		size: 4096,
		before: function(obj) {
			//预读本地文件示例，不支持ie8
			obj.preview(function(index, file, result) {
				$('#licensePreview').css('display', 'block');
				$('#licensePreview').attr('src', result); //图片链接（base64）
				layer.load(); //上传loading
			});
		},
		done: function(res) {
			//如果上传失败
			if(res.code > 0) {
				return layer.msg('上传失败');
				
			}
			//上传成功
			console.log(res);
			$('#demoText').css('display', 'none');
			layer.msg('上传成功');
			licenceUrl.businessLicence = res.data;
			layer.closeAll('loading'); //关闭loading
		},
		error: function(res) {
			//演示失败状态，并实现重传
			console.log(res);
			layer.closeAll('loading'); //关闭loading
			var demoText = $('#demoText');
			demoText.html('<span style="color: #FF5722;">上传失败</span> <a class="layui-btn layui-btn-xs demo-reload">重试</a>');
			demoText.find('.demo-reload').on('click', function() {
				uploadInst.upload();
			});
		}
	});
});

layui.use('form', function() {
	var form = layui.form;
	//监听提交
	form.on('submit(formDemo)', function(data) {
		var content = layui.layedit.getContent(editContent);
		console.log(content);
		var submitInfo = data.field;
		submitInfo.description = content;
		submitInfo.attachments = attachments;
		console.log(submitInfo);
		if(PMInfo==""){
			layer.msg("请先邀请项目经理！")
		}else{
			var formData = new FormData();
			formData.append("content", submitInfo.description);
			formData.append("publishDate", submitInfo.joinDate.split(',')[0]);
			formData.append("finishDate", submitInfo.joinDate.split(',')[1]);
			formData.append("platformId", submitInfo.platformId.split('/')[submitInfo.platformId.split('/').length-1]);
			formData.append("projectName", submitInfo.projectName);
			formData.append("reward", submitInfo.reward);
			formData.append("title", submitInfo.title);
			formData.append("notice", submitInfo.notice);
			for (var index = 0; index < submitInfo.attachments.length; index++) {
				formData.append("attachments", submitInfo.attachments[index]);
			}
			$.ajax({
				type:"post",
				contentType: false,  
		        processData: false,
				url:apiUrl+"/client/api/question/add",
				async:true,
				data:formData,
				success:function(res){
					layer.msg("发布成功！",{icon:1});
					var questionId = res.id;
					$.ajax({
						type:"post",
						url:apiUrl+"/client/api/invite/addPorjectManager",
						async:true,
						data:{
							questionId:questionId,
							address:PMInfo.address,
							businessLicence:PMInfo.businessLicence,
							company:PMInfo.company,
							projectName:PMInfo.projectName,
							u_email:PMInfo.u_email,
							u_phoneNum:PMInfo.u_phoneNum,
							u_name:PMInfo.u_name,
							type:"manager"
						},
						success:function(res){
							console.log(res)
						}
					});
					$('#contentIframe').attr('src','myQuestion.html');
				},
				error:function(res){
					layer.msg("发布失败！",{icon:5});
				}
			});
		}
		return false;
	});

	//监听提交邀请项目经理
	form.on('submit(invitePMBox)', function(data) {
		var submitData = data.field;
		var submitInfo = $.extend(submitData, licenceUrl);
		  if(!submitData){
		  	//验证不通过
		  }else if(submitInfo.businessLicence==""||!submitInfo.businessLicence){
		  	layer.msg("请上传营业执照噢！")
		  }else{
		  	PMInfo = submitInfo;
		  	console.log(PMInfo);
		  	$('#invitePM').text("已邀请").css('background','gray');
		  	layer.msg("邀请成功",{icon:1});
		  	layer.closeAll();
		  }
		return false;
	});
});

layui.use('laydate', function() {
	var laydate = layui.laydate;

	//执行一个laydate实例
	laydate.render({
		elem: '#joinDate', //指定元素,
		range: ',',
		type: 'datetime'
	});
});

$('#uploadFile').on('change',function(){
	fileNames = [];
	console.log($('#uploadFile')[0].files);
	attachments = $('#uploadFile')[0].files;
	for(var i=0;i<attachments.length;i++){
		fileNames.push(attachments[i].name);
	}
	$('#fileNames').text("已上传 "+fileNames.join(' , ')+"  "+fileNames.length+"个文件");
})

$('.btnUploadFile').on('click',function(){
	$('#uploadFile').trigger('click');
})