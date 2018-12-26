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
var attachments = [];
var fileNames=[];
var currentQuestionInfo={};
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

//获取要修改的问题信息
	$.ajax({
		type:"get",
		url:apiUrl+"/client/api/question/findById?id="+sessionStorage.getItem('currentQuestionId'),
		async:false,
		success:function(res){
			currentQuestionInfo = res;
		}
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
		
		var platformValue = [];
		
		platformValue.push(findTreePlatform(currentQuestionInfo.platformType.id));

		formSelects.data('select_platform', 'local', {
			arr: platformSchemeJson.concat(platformDrawingJson),
			linkage: true,
			linkageWidth: 130
		});
		
		formSelects.on('select_platform', function(id, vals, val, isAdd, isDisabled){
	     	console.log(vals);
		}, true);
		
		formSelects.value('select_platform',platformValue);
		
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
	form.val("formModify", {
		"title": currentQuestionInfo.title,
		"projectName":currentQuestionInfo.projectName,
		"platformId":currentQuestionInfo.platformType.id,
		"reward":currentQuestionInfo.reward,
		"content":currentQuestionInfo.content,
		"joinDate":currentQuestionInfo.publishDate+' , '+currentQuestionInfo.finishDate,
		"notice":currentQuestionInfo.notice
			})
	
	//监听提交
	form.on('submit(formModify)', function(data) {
		var content = layui.layedit.getContent(editContent);
		var submitInfo = data.field;
		submitInfo.description = content;
		submitInfo.attachments = attachments;
		
		if(content==""||!content){
			layer.msg("请填写内容描述！")
		}else{
		var formData = new FormData();
		formData.append("id", sessionStorage.getItem('currentQuestionId'));
		formData.append("content", submitInfo.description);
		formData.append("publishDate", submitInfo.joinDate.split(',')[0]);
		formData.append("finishDate", submitInfo.joinDate.split(',')[1]);
		formData.append("platformId", submitInfo.platformId.split('/')[submitInfo.platformId.split('/').length-1]);
		formData.append("projectName", submitInfo.projectName);
		formData.append("reward", submitInfo.reward);
		formData.append("title", submitInfo.title);
		formData.append("notice", submitInfo.notice);
		formData.append("_method", 'PUT');
		if(submitInfo.attachments.length<1){
			formData.append("attachments", []);
		}else{
			for (var index = 0; index < submitInfo.attachments.length; index++) {
				formData.append("attachments", submitInfo.attachments[index]);
			}
		}
		$.ajax({
			type:"post",
			contentType: false,  
	        processData: false,
			url:apiUrl+"/client/api/question/update",
			async:true,
			data:formData,
			success:function(res){
				layer.msg("修改成功！",{icon:1,time:1000});
				setTimeout(function(){
					$('#contentIframe',parent.document).attr('src','myQuestions.html');
				},1000);

			},
			error:function(res){
				layer.msg("发布失败！",{icon:5});
			}
		});
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


//查找擅长领域初始值
function findTreePlatform(id,type){
	var result;
	$.ajax({
		type:"get",
		url:apiUrl+"/client/api/platformType/findTree?id="+id,
		async:false,
		success:function(res){
			if(type=="scheme"){
				res.unshift(999);
			}else{
				res.unshift(1000);
			}
			result =  res.join('/');
		}
	});
	return result;
}

$('#btnResetQuestion').on('click',function(e){
	e.preventDefault();
	$('#fileNames').text("");
	attachments = [];
	PMInfo = "";
	document.getElementById('newQuestionForm').reset();
	formSelects.render();
	$('#projectName').val(member.memberExt.projectName);
	
})