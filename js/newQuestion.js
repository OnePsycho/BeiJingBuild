var member = JSON.parse(sessionStorage.getItem('member'));
var editContent;
var platformSchemeJson = [{
	name: "方案",
	id: 999,
	sortPlatformTypes: []
}];
var platformDrawingJson = [{
	name: "施工图",
	id: 1000,
	sortPlatformTypes: []
}];
var formSelects = layui.formSelects;
var licenceUrl = {
	'businessLicence': ""
};
var PMInfo="";
var attachments=[];
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

formSelects.config('select_platform', {
	keyName: 'name', //自定义返回数据中name的key, 默认 name
	keyVal: 'id', //自定义返回数据中value的key, 默认 value
	keySel: 'name', //自定义返回数据中selected的key, 默认 selected
	keyChildren: 'sortPlatformTypes', //联动多选自定义children

	success: function(id, url, val, result) {
		console.log(result);

	},	
	error: function(id, url, val, err) {
		console.log("err回调: " + url);
	},
	beforeSuccess: function(id, url, searchVal, result){  //success之前的回调, 干嘛呢? 处理数据的, 如果后台不想修改数据, 你也不想修改源码, 那就用这种方式处理下数据结构吧
        return result;  //必须return一个结果, 这个结果要符合对应的数据结构
    }
	},false);

	 formSelects.on('select_platform', function(id, vals, val, isAdd, isDisabled){
	 	console.log(vals);
	}, true);


//项目分类联动
$.ajax({
	type: "get",
	url: apiUrl + '/client/api/platformType/findPage',
	//		async:true,
	success: function(res) {
		for(var i = 0; i < res.content.length; i++) {
			if(res.content[i].type == "scheme") {
				platformSchemeJson[0].sortPlatformTypes = platformSchemeJson[0].sortPlatformTypes.concat(res.content[i]);
			} else {
				platformDrawingJson[0].sortPlatformTypes = platformDrawingJson[0].sortPlatformTypes.concat(res.content[i]);
			}
		}

		formSelects.data('select_platform', 'local', {
			arr: platformSchemeJson.concat(platformDrawingJson),
			linkage: true,
			linkageWidth: 130
		});
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
//			var formData = new FormData();
//			formData.append("content", submitInfo.description);
//			formData.append("publishDate", submitInfo.joinDate.split(',')[0]);
//			formData.append("finishDate", submitInfo.joinDate.split(',')[1]);
//			formData.append("platformId", submitInfo.platformId.split('/')[submitInfo.platformId.split('/').length-1]);
//			formData.append("projectName", submitInfo.projectName);
//			formData.append("reward", submitInfo.reward);
//			formData.append("title", submitInfo.title);
//			formData.append("notice", submitInfo.notice);
//			for (var index = 0; index < submitInfo.attachments.length; index++) {
//				formData.append("atts", submitInfo.attachments[index]);
//			}
			$.ajax({
				type:"post",
				url:apiUrl+"/client/api/question/add",
				async:true,
				traditional: true,
				data:{
					content:submitInfo.description,
					publishDate:submitInfo.joinDate.split(',')[0],
					finishDate:submitInfo.joinDate.split(',')[1],
					platformId:submitInfo.platformId.split('/')[submitInfo.platformId.split('/').length-1],
					projectName:submitInfo.projectName,
					reward:submitInfo.reward,
					title:submitInfo.title,
					notice:submitInfo.notice,
					atts:submitInfo.attachments
				},
				success:function(res){
					layer.msg("发布成功！",{icon:1,time:1000});
					var questionId = res.id;
					$.ajax({
						type:"post",
						url:apiUrl+"/client/api/invite/addPorjectManager",
						async:true,
						data:{
							questionId:questionId,
							address:PMInfo.address,
//							businessLicence:PMInfo.businessLicence,
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
					setTimeout(function(){
						self.parent.$('#contentIframe').attr('src','myQuestions.html');
					},1000)

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
		  }else{
		  	PMInfo = submitInfo;
		  	console.log(PMInfo);
		  	$('#invitePM').text("已邀请").css('background','gray');
		  	$('#invitePM').attr('disabled',true);
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

$('#uploadFile').on('change',function(e){
	e.preventDefault();
	var b = new Base64();
	var base = new 
		$('#fileUpload').ajaxSubmit({
	        url:apiUrl+'/client/api/file/ieUpload',
	        dataType:'text',
			type:'post',
			data:{memberId:member.id},
	        success:function(res){
	        	var result = getLatestFile(member.id);
	        	console.log(result);
        		fileNames = [];
				for(var i=0;i<result.length;i++){
					fileNames.push(result[i].name);
					attachments.push(b.encode(JSON.stringify(result[i])));
					console.log(JSON.stringify(result[i]), b.encode(JSON.stringify(result[i])));
				}
				$('#fileNames').text("已上传 "+fileNames.join(' , ')+"  "+fileNames.length+"个文件");
		    },
		    error:function(e){
			    console.log(e);
		    }
	    });
})

$('.btnUploadFile').on('click',function(){
	$('#uploadFile').trigger('click');
})

$('#btnResetQuestion').on('click',function(e){
	e.preventDefault();
	$('#fileNames').text("");
	attachments = [];
	$('#invitePM').text("邀请项目经理").css('background','rgb(139,22,11)');
	$('#invitePM').attr('disabled',false);
	PMInfo = "";
	document.getElementById('newQuestionForm').reset();
	$('#projectName').val(member.memberExt.projectName);
	
})

function getLatestFile(memberId){
	var result;
	$.ajax({
		type:"get",
		url:apiUrl+"/client/api/file/uploadResult?memberId="+memberId,
		async:false,
		success:function(res){
			console.log(res);
			result = res.data;
		}
	});	
	return result;
}
