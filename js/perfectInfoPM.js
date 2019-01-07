var licenceUrl = {'businessLicence':""};
var member = JSON.parse(sessionStorage.getItem('member'));
var submitData;
layui.use('upload', function(){
  var upload = layui.upload;
  //普通图片上传
  var uploadInst = upload.render({
    elem: '#licenseImg'
    ,url: apiUrl+'/client/api/file/upload'
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


layui.use('form', function(){
  var form = layui.form;
  //监听提交
  form.on('submit(formSubmitPM)', function(data){
    submitData = data.field;
    return false;
  });
	
});


//表单提交事件合并
$('#btnSubmit').on('click',function(){
	$('#btnSubmitPM').trigger('click');
    var submitInfo = $.extend(submitData,licenceUrl);
    if(!submitData){
    	//验证不通过
    }else if(submitInfo.businessLicence==""||!submitInfo.businessLicence){
    	layer.msg("请上传营业执照噢！")
    }else{
    	console.log(submitInfo);
    	$.ajax({
			type: "POST",
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
	url:apiUrl+"/wx/assist/qrcode?memberId=" + member.id,
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
