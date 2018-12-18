//从session获取用户信息
var member = JSON.parse(sessionStorage.getItem('member'));
var layer = layui.layer;
var onlineMember = [];
var fileNames = [];
var attachments = [];
var memberJoinQuestionId;
var memberJoinQuestionIndex;

//获取问题详情信息
var questionInfo = JSON.parse(sessionStorage.getItem('questionInfo'));



//参与设计师头像和是否在线处理
	var joinMembers = questionInfo.memberJoinQuestions;
	for (var i=0;i<joinMembers.length;i++) {
		joinMembers[i].member.tempHeadImg = imgUrl + joinMembers[i].member.tempHeadImg;
		if(joinMembers[i].member.online){
			onlineMember.push(joinMembers[i].member);
		}
		//获取memberJoinQuestionId
		if(joinMembers[i].member.id == member.id){
			memberJoinQuestionId = joinMembers[i].id;
			memberJoinQuestionIndex = i;
			joinMembers[i].member.tempName = "我"
		}
	}


if(member.type == "freeDesigner" && questionInfo.memberJoinQuestions[memberJoinQuestionIndex].type == "participator"){
	$('#inviteDesignerTop').hide();
	$('#inviteDesignerBottom').hide();
	$('#btnSubmitAnswer').show();
	$('.memberItem').find('button').hide();
}

	$('#iframeShow',window.parent.document).css("background","rgba(0,0,0,0)");
	$('.memberBox').find('.memberItem').last().find('hr').hide();
	
var questionVm = new Vue({
	el:'#questionContainer',
	data:{
		questionData:"",
		topDesigners:"",
		bottomDesigners:"",
		onlineDesigners:"",
		answerList:""
	},
	methods:{
		downLoadFile:function(path){
			
		},
		//查看答案
		showAnswer:function(id,memberId){
			if((member.type == "freeDesigner"&&memberId==member.id)||member.type=="firstParty"){
				$.ajax({
					type:"get",
					url:apiUrl+"/client/api/answer/findPage?memberJoinQuestionId="+id,
					async:true,
					data:{
						sort:'id,desc'
					},
					success:function(res){
						if(res.content.length > 0){
							$('.memberBox').hide();
							$('.answerBox').show();
							questionVm.answerList = res.content;
						}else{
							layer.msg("该设计师暂无回答数据！");
						}
					},
					error:function(res){
						console.log(res);
					}
				});
			}
		},
		//采纳答案
		acceptAction:function(index,answerId,flag){
			$.ajax({
				type:"post",
				url:apiUrl+"/client/api/answer/update",
				async:true,
				data:{
					id:answerId,
					accept:!flag,
					_method:'PUT'
				},
				success:function(res){
					console.log(res);
					if(res.accept){
						layer.msg("采纳成功！",{icon:1,time:500});
					}else{
						layer.msg("取消成功！",{icon:1,time:500});
					}
					questionVm.answerList[index].accept = res.accept;
				}
			});
		}
	},
	updated:function(){
		var noticeFlag = false;
		var noticeHeight = $('.noticeText').height();
		if(noticeHeight > 50){
			$('.noticeText').css('height','60px');
			$('.openAll').show();
		}
		$('.openAll').on('click',function(){
			if(!noticeFlag){
				$('.noticeText').css('-webkit-line-clamp','unset').css('height','auto');
				$('.openAll').find('span').text("收起全文");
				$('.openAll').find('i').removeClass('layui-icon-down').addClass('layui-icon-up');
				noticeFlag  = true;
			}else{
				$('.noticeText').css('-webkit-line-clamp','5').css('height','60px');
				$('.openAll').find('span').text("展开详情");
				$('.openAll').find('i').removeClass('layui-icon-up').addClass('layui-icon-down');
				noticeFlag  = false;
			}
		})
	}
})



//问题附件处理
var attachmentFiles = questionInfo.attachments;
	for (var i=0;i<attachmentFiles.length;i++) {
		attachmentFiles[i].tempName = attachmentFiles[i].name.length < 5?attachmentFiles[i].name:attachmentFiles[i].name.substring(0,4)+"...";
		attachmentFiles[i].path = imgUrl + attachmentFiles[i].path
	}
//倒计时处理
countDownTime(questionInfo);

	
	
	//提取问题描述中的文本信息
	var strs = questionInfo.content.split("<img src");
	for(var i=0;i<strs.length;i++){
		questionInfo.tempContent = questionInfo.content.replace(questionInfo.content.substring(questionInfo.content.indexOf("<img src"),questionInfo.content.indexOf(">",questionInfo.content.indexOf("<img src"))+1),"")
	}
	questionInfo.tempContent = questionInfo.tempContent.length > 50?questionInfo.tempContent.slice(0,70)+"...":questionInfo.tempContent;
	
	questionVm.questionData = questionInfo;
	questionVm.onlineDesigners = onlineMember;

//判断设计师的数量
	if(joinMembers.length < 5){
		$('#inviteDesignerBottom').hide();
		questionVm.topDesigners = joinMembers;
	}else if(joinMembers.length == 5){
		if(member.type=="firstparty"){
			$('#inviteDesignerBottom').show();
		}
		$('#inviteDesignerTop').hide();
		questionVm.topDesigners = joinMembers;
	}else if(joinMembers.length > 5 && joinMembers.length < 10){
		$('#inviteDesignerTop').hide();
		if(member.type=="firstparty"){
			$('#inviteDesignerBottom').show();
		}
		questionVm.topDesigners = joinMembers.slice(0,5);
		questionVm.bottomDesigners = joinMembers.slice(5);
	}else{
		$('#inviteDesignerTop').hide();
		$('#inviteDesignerBottom').hide();
		questionVm.topDesigners = joinMembers.slice(0,5);
		questionVm.bottomDesigners = joinMembers.slice(5);
	}

//倒计时
function countDownTime(res) {
	res.year = res.finishDate.substring(0, 10);
	res.time = res.finishDate.substring(11, 20);
	$.leftTime(res.finishDate, function(dd) {
		if(dd.status) {
			$('#' + "d" + res.id).text(dd.d);
			$('#' + "h" + res.id).text(dd.h);
			$('#' + "m" + res.id).text(dd.m);
			$('#' + "s" + res.id).text(dd.s);
		}
	});
}

$('#inviteFDTop').on('click',function(){
	layer.open({
		title: false,
		type: 1,
		content: $('#inviteFDDialog'),
		area: ['500px', '450px']
	});
})
$('#inviteFDBottom').on('click',function(){
	layer.open({
		title: false,
		type: 1,
		content: $('#inviteFDDialog'),
		area: ['500px', '450px']
	});
})

//邀请设计师部分
layui.use('form', function() {
	var form = layui.form;
	//监听提交
		  form.on('submit(inviteDesignerForm)', function(data){
		  	var invitedList = [];
		  	var errorMember = [];
		  	var sucMember = [];
		  	var invitedMember = [];
		    var inviteInfo = data.field;
		    invitedList.push(inviteInfo.username1);
		    invitedList.push(inviteInfo.username2);
		    invitedList.push(inviteInfo.username3);
		    invitedList.push(inviteInfo.username4);
		    invitedList.push(inviteInfo.username5);
		    //数组去掉重复项
		    invitedList = unique(invitedList);
		    console.log(invitedList);
		    for(var i=0;i<invitedList.length;i++){
		    	var formData = new FormData();
		    	var currentMember = invitedList[i];
		    	formData.append('emailOrPhoneNum',invitedList[i]);
		    	formData.append('questionId',questionInfo.id);
		    	if(isPhoneAvailable(invitedList[i]) || isEmailAvailable(invitedList[i])){
		    		$.ajax({
		    			type:"post",
		    			url:apiUrl+"/client/api/invite/add",
		    			contentType: false,  
		        		processData: false,
		        		async:false,
		    			data:formData,
		    			success:function(res){
		    				if(res.status=="1001"){
		    					invitedMember.push(currentMember);
		    				}else if(res.status == "200"){
		    					sucMember.push(currentMember);
		    				}else if(res.status == "1002"){
		    					errorMember.push(currentMember);
		    				}
		    			},
		    			error:function(err){
		    				console.log(err);
		    			}
		    		});
		    		
		    	}else{
		    		layer.msg("请输入正确的账号格式！",{icon:5})
		    	}
		    }
				layer.closeAll();
				layer.msg(sucMember.join(',')+"邀请成功，"+errorMember.join(',')+" 未注册，邀请失败，"+invitedMember.join(',')+"已被邀请过！",{icon:1});
			return false;
		  });
		  
  
  //提交答案
	form.on('submit(answerForm)', function(data) {
		var submitData = data.field;
		var content = layui.layedit.getContent(editContent);
		if(content == ""){
			layer.msg("请填写您的回答内容！",{icon:2,time:1000})
		}else{
			submitData.content = content;
			submitData.attachments = attachments;
			var formData = new FormData();
			formData.append("content", content);
			formData.append("memberJoinQuestionId", memberJoinQuestionId);
			if(attachments.length > 0){
				for (var index = 0; index < attachments.length; index++) {
					formData.append("attachments", attachments[index]);
				}
			}else{
				formData.append("attachments", attachments);
			}
	
			$.ajax({
				type:"post",
				url:apiUrl+"/client/api/answer/add",
				contentType: false,  
	   			processData: false,
	   			data:formData,
	   			success:function(res){
	   				layer.closeAll();
	   				layer.msg("提交成功！",{icon:1,time:1000})
	   			},
	   			error:function(res){
	   				layer.msg("提交失败！请稍后再试！",{icon:5,time:2000})
	       			}
				});
				
			}
			return false;
		});
	});
		


//手机邮箱正则验证
var phoneReg = /^[1][3-9][0-9]{9}$/;		
var emailReg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;	

function isPhoneAvailable(phonevalue){
       if(phoneReg.test(phonevalue)){
           return true;
       }else{
           return false;
       }
   }
function isEmailAvailable(emailValue){
       if(emailReg.test(emailValue)){
           return true;
       }else{
           return false;
       }
   }
   
 //数组去重  
function unique(arr){
  var hash=[];
  for (var i = 0; i < arr.length; i++) {
	  	
     if(arr.indexOf(arr[i])==i){
      hash.push(arr[i]);
     }
     
     if(hash[i] == ""){
	  		hash.splice(hash.indexOf(hash[i]),1);
	  	}
  }
  return hash;
}

	//弹出提交答案按钮
	$('#btnSubmitAnswer').on('click',function(){
		layer.open({
			title: '提交答案',
			type: 1,
			content: $('#answerDialog'),
			area: ['700px', '600px']
		});
			
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
		})
});


	$('#showDetails').on('click',function(){
		layer.open({
			title: '问题描述',
			type: 1,
			content: $('#detailsDialog'),
			area: ['700px', '600px']
		});
	});




$('#uploadFile').on('change',function(){
	fileNames = [];
	console.log($('#uploadFile')[0].files);
	attachments = $('#uploadFile')[0].files;
	$('#fileNames').empty();
	$('#fileNames').append('<p style="font-weight:bold">已选择文件：'+attachments.length+' 个</p>')
	for(var i=0;i<attachments.length;i++){
		fileNames.push(attachments[i].name);
		$('#fileNames').append('<p>'+attachments[i].name+'</p>')
	}
//	$('#fileNames').text("已上传 "+fileNames.join(' , ')+"  "+fileNames.length+"个文件");
	
})

$('.btnUploadFile').on('click',function(){
	$('#uploadFile').trigger('click');
})

