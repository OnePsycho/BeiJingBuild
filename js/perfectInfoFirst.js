var licenceUrl = {'businessLicence':""};
var member = JSON.parse(sessionStorage.getItem('member'));
var submitData;
var attachments;
var fileResult;
layui.use('upload', function(){
  var upload = layui.upload;
  //普通图片上传
  var uploadInst = upload.render({
    elem: '#licenseImg'
    ,url: apiUrl+'/client/api/file/ieUpload'
    ,accept: 'file' //允许上传的文件类型
    ,exts: 'jpg|png'//允许上传的后缀
    ,size: 4096 //最大允许上传的文件大小
    ,before: function(obj){
      //预读本地文件示例，不支持ie8
      obj.preview(function(index, file, result){
      	$('#licensePreview').css('display','block');
        $('#licensePreview').attr('src', result); //图片链接（base64）
        layer.load(); //上传loading
      });
    }
    ,done: function(res){
      //如果上传失败
      if(res.code > 0){
        return layer.msg('上传失败');
      }
      //上传成功
      console.log(res);
      $('#demoText').css('display','none');
      layer.msg('上传成功');
      licenceUrl.businessLicence = res.data;
      layer.closeAll('loading'); //关闭loading
    }
    ,error: function(res){
      //演示失败状态，并实现重传
      console.log(res);
      layer.closeAll('loading'); //关闭loading
      var demoText = $('#demoText');
      demoText.html('<span style="color: #FF5722;">上传失败</span> <a class="layui-btn layui-btn-xs demo-reload">重试</a>');
      demoText.find('.demo-reload').on('click', function(){
        uploadInst.upload();
      });
    }
  });
});

//表单的提交事件
layui.use('form', function(){
  var form = layui.form;
  //监听提交
  form.on('submit(formSubmit)', function(data){
    submitData = data.field;
    return false;
  });
	
});


//表单提交事件转移
$('#btnSubmit').on('click',function(){
	$('#btnSubmitFirst').trigger('click');
    var submitInfo = $.extend(submitData,licenceUrl);
    console.log(submitInfo);
    if(!submitData){
//  	layer.msg("请先填写完整！");
    }else if(!submitInfo.check){
    	layer.msg("请先确认项目为合同后项目噢！")
    }else if(submitInfo.businessLicence==""||!submitInfo.businessLicence){
    	layer.msg("请上传营业执照噢！")
    }else{
    	console.log(submitInfo);
    	$.ajax({
			type: "POST",
			async:true,
			url: apiUrl + "/client/api/memberExt/add",
			data: {
				memberId:member.id,
				address: submitInfo.address,
				businessLicence: submitInfo.businessLicence,
				company: submitInfo.company,
				projectName: submitInfo.projectName,
				u_email: submitInfo.u_email,
				u_name: submitInfo.u_name,
				u_phoneNum: submitInfo.u_phoneNum,
				code:sessionStorage.getItem('r_code')
			},
			success: function(res) {
					if(member.status!="normal"){
					layer.msg("提交成功！请等待管理员审核通过！",{icon:1});
					setTimeout(function(){
					 window.location.href = 'login.html';
					},1000);
				}else if(member.status=="normal"){
					layer.msg("提交成功！",{icon:1});
					setTimeout(function(){
					 window.location.href = 'index.html';
					},1000);
				}
				},
				error:function(){
					layer.msg("提交失败！",{icon:5});
				}
		});
    }
})
//获取微信二维码
$.ajax({
	type:"get",
	url:apiUrl+"/wx/assist/qrcode",
	data:{
		memberId:member.id
	},
	async:true,
	success:function(res){
		$('.qrCodeText').css('display','block');
		var qrcode = new  QRCode("qrcode", {
			    text: res,
			    width: 150,
			    height: 150,
			    colorDark : "#000000",
			    colorLight : "#ffffff",
			    typeNumber:4,
			    correctLevel : QRCode.CorrectLevel.H
			});
		}
});

$('#uploadFile').on('change',function(e){
	e.preventDefault();
	var b = new Base64();
		$('#fileUpload').ajaxSubmit({
	        url:apiUrl+'/client/api/file/ieUpload',
	        dataType:'text',
			type:'post',
			data:{memberId:member.id},
	    success:function(res){
	        	var result = getLatestFile(member.id);
	        	console.log(result);
        		fileNames = result[0].name;
        		licenceUrl.businessLicence = result[0].path
//					attachments = b.encode(JSON.stringify(result[0]));
				$('#fileNames').text(" 已上传 "+fileNames);
		    },
		    error:function(e){
			    console.log(e);
		    }
	    });
})


$('.btnUploadFile').on('click',function(){
	$('#uploadFile').trigger('click');
})

function getLatestFile(memberId){
	jQuery.support.cors = true; 
	$.ajax({
		type:"get",
		url:apiUrl+"/client/api/file/uploadResult?memberId="+memberId,
		async:false,
		success:function(res){
			fileResult = res.data;
		},
		error:function(res){
			console.log(res);
		}
	});	
	return fileResult;
}