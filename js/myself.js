$(function() {
	//从session获取用户信息
	var member = JSON.parse(sessionStorage.getItem('member'));
	var layer = layui.layer;
	var paymentType="微信支付"; //支付类型
	if(member) {
		var personSchemeData = [];
		var personDrawingData = [];
		var platformSchemeData = [];
		var platformDrawingData = [];
		var aliInterval;
		var wxInterval;
		var thirdListData=[];
		var memberType = JSON.parse(sessionStorage.getItem('member')).type;
		userTypeAssign(memberType);
		getMemberInfoById(member.id);
	}
	
//	
//	dwr.engine.setOverridePath(apiUrl+"/dwr");
//	dwr.engine.setActiveReverseAjax(true);
//	dwr.engine.setNotifyServerOnPageUnload(true);
//	
//	MsgChannel.connect(member.id, function(res) {
//  	console.log(res);
//  });
//
//	function showMessage(msg) {
//		console.log(msg);
//	}
//	
		


		$('.left-menu-item').eq(0).hover(
		    function(){
		     $(this).addClass('active');
		     $(this).find('img').eq(0).attr('src','img/icon_news_white.png');
		    },
		    function(){
	    	if(!$(this).hasClass('click-active')){
			     $(this).removeClass('active');
			     $(this).find('img').eq(0).attr('src','img/icon_news_black.png');
	    	}
		    }
		)
		$('.left-menu-item').eq(1).hover(
		    function(){
		     $(this).addClass('active');
		     $(this).find('img').eq(0).attr('src','img/icon_settings_white.png');
		    },
		    function(){
	    	if(!$(this).hasClass('click-active')){
			     $(this).removeClass('active');
			     $(this).find('img').eq(0).attr('src','img/icon_settings.png');
	    	}
		    }
		)
		$('.left-menu-item').eq(2).hover(
		    function(){
		     $(this).addClass('active');
		     $(this).find('img').eq(0).attr('src','img/icon_psw_white.png');
		    },
		    function(){
	    	if(!$(this).hasClass('click-active')){
			     $(this).removeClass('active');
			     $(this).find('img').eq(0).attr('src','img/icon_psw_black.png');
	    	}
		    }
		)
		$('.left-menu-item').eq(0).on('click',function(){
			$(this).addClass('click-active');
			$('.left-menu-item').not(this).removeClass('click-active').removeClass('active');
			$(this).find('img').eq(0).attr('src','img/icon_news_white.png');
			$('.left-menu-item').eq(1).find('img').eq(0).attr('src','img/icon_settings.png');
			$('.left-menu-item').eq(2).find('img').eq(0).attr('src','img/icon_psw_black.png');
		})
		$('.left-menu-item').eq(1).on('click',function(){
			$(this).addClass('click-active');
			$('.left-menu-item').not(this).removeClass('click-active').removeClass('active');
			$(this).find('img').eq(0).attr('src','img/icon_settings_white.png');
			$('.left-menu-item').eq(0).find('img').eq(0).attr('src','img/icon_news_black.png');
			$('.left-menu-item').eq(2).find('img').eq(0).attr('src','img/icon_psw_black.png');
		})
		$('.left-menu-item').eq(2).on('click',function(){
			$(this).addClass('click-active');
			$('.left-menu-item').not(this).removeClass('click-active').removeClass('active');
			$(this).find('img').eq(0).attr('src','img/icon_psw_white.png');
			$('.left-menu-item').eq(0).find('img').eq(0).attr('src','img/icon_news_black.png');
			$('.left-menu-item').eq(1).find('img').eq(0).attr('src','img/icon_settings.png');
		})
 
	$('#header_username').text(member.phoneNum?member.phoneNum:member.email);
	$('#personalUsername').text(member.phoneNum?member.phoneNum:member.email);
	$('#user_asset').text(member.asset.toFixed(2));
	$('#header_img').attr('src', imgUrl + member.tempHeadImg);
	$('#personalHeadImg').attr('src', imgUrl + member.tempHeadImg);
	
	$('#myNews').addClass('active');
	$('#myNews').find('img').eq(0).attr('src','img/icon_news_white.png');
	
	$('#myNews').on('click',function(){
		$('#questionsShow').css('display','block');
		$('#iframeShow').css('display','none');
	})
	$('#mySettings').on('click',function(){
		$('#questionsShow').css('display','none');
		$('#iframeShow').css('display','block');
		$('#contentIframe').attr('src', 'fdCenter.html');
	})
	$('#myPassWord').on('click',function(){
		$('#questionsShow').css('display','none');
		$('#iframeShow').css('display','block');
		$('#contentIframe').attr('src', 'resetPassword.html');
	})
	
	//身份权限分配
	function userTypeAssign(memberType) {
		switch(memberType) {
			case 'firstParty':
			$('#header_userType').text("甲方").addClass('firstPartyType');
				$('#mySettings').css('display','none');
				break;
			case 'freeDesigner':
			$('#header_userType').text("设计师").addClass('freeDesignerType');
				$('#mySettings').css('display','block');
				$('#btnRecharge').css('display','none');
				break;
			case 'projectManager':
				$('#mySettings').css('display','none');
				break;
			default:
				break;
		}
	}

	$('#btnCash').on('click',function(){
		layer.open({
			title: false,
			type: 1,
			content: $('#btnCashBox'),
			area: ['600px', '400px']
			});
		document.getElementById("btnCashBoxForm").reset();
	})
	
	$('#btnRecharge').on('click',function(){
		layer.open({
		title: false,
		type: 1,
		content: $('.btnRechargeDialog'),
		area: ['800px', '510px']
	});
	document.getElementById("btnRechargeDialog").reset();
		
		$('#wxPayCode').css('display','none');
	})
	
	
	$('.payItem').on('click',function(){
//		$(this).find('span').css('color','rgb(139,22,11)').css('font-weight','bolder');
		$(this).css('border','2px solid #ececec');
		paymentType = $(this).find('span').text();
//		$('.payItem').not(this).find('span').css('color','#3c3c3c').css('font-weight','400');
		$('.payItem').not(this).css('border','0px solid #ececec');
	})
	
	
	layui.use('form', function() {
	var form = layui.form;
	//支付宝提现
	form.on('submit(aliForm)', function(data) {
		aliCash(data.field.aliAccount,data.field.amount);
		return false;
	});
	
	//微信提现
	form.on('submit(wxForm)', function(data) {
		wxCash(data.field.amount);
		return false;
	});
	
	//充值接口
	form.on('submit(reChargeForm)', function(data) {
		console.log(data.field);
		switch (paymentType){
			case "":
				layer.msg("请选择支付方式！",{icon:1,time:1000});
				break;
			case "支付宝充值":
				payByAli(data.field.amount);
				break;
			case "微信支付":
				payByWechat(data.field.amount);
				break;
			default:
				break;
		}
		return false;
	});
	
	$('#inputAliPay').bind('input propertychange', function() {  
		var a = $('#inputAliPay').val();
		var b = (a*0.0006).toFixed(2);
		$('#chargeValue').text(b);
	});

	$('#inputWxPay').bind('input propertychange', function() {  
		var a = $('#inputWxPay').val();
		var b = (a*0.0006).toFixed(2);
		$('#chargeValueWx').text(b);
	});
});


$('.layui-tab-title').find('li').eq(1).on('click',function(){
	if(member.weixin==""){
		getWxCode(member.id);
		$('.bindWeChat').css('display','block');
	}else{
		$('.bindWeChat').css('display','none');
	}

})
	
	
	
//微信支付充值
function payByWechat(totalFee){
	var index = layer.load(2);
	$('#wxPayCode').css('display','block');
	$.ajax({
		type:"POST",
		url:apiUrl+"/wx/entPay/recharge",
		async:true,
		data:{
			description:"微信充值单",
			title:"微信充值",
			totalFee:totalFee
		},
		success:function(res){
			if(res.status=="200"){
				var qrcode = new QRCode("wxPayCode", {
					text: res.data.codeUrl,
					width: 150,
					height: 150,
					colorDark: "#000000",
					colorLight: "#ffffff",
					typeNumber: 4,
					correctLevel: QRCode.CorrectLevel.H
				});
				
				wxInterval = setInterval(function(){
					getPayResult(res.data.no);
				},2000);
				
				layer.close(index);
				layer.msg("请扫码完成微信支付！",{time:1000});
			}
		}
	});
}

//支付宝充值
function payByAli(totalAmount){
	$.ajax({
		type:"POST",
		url:apiUrl+"/ali/pay/tradePage",
		async:true,
		data:{
			description:"北京工业设计院",
			title :"北京工业设计院",
			totalAmount :totalAmount
		},
		success:function(res){
			if(res.status == "200"){
				sessionStorage.setItem('aliPay',res.data);
				window.open('aliPay.html');
			}
		}
	});
}

//微信提现
function wxCash(amount,memberId){
	$.ajax({
		type:"post",
		url:apiUrl+"/wx/entPay/entPay",
		async:true,
		data:{
			amount:amount,
			memberId:member.id,
			description:"微信提现描述"
		},
		success:function(res){
			
		}
	});
}

//支付宝提现
function aliCash(account,amount){
	$.ajax({
		type:"post",
		url:apiUrl+"/ali/pay/fundTransToaccountTransfer",
		async:false,
		data:{
			amount:amount,
			account:account,
			remark:"支付宝提现描述"
		},
		success:function(res){
			var index = layer.load();
			switch (res.status){
				case "200":
					layer.closeAll();
					getMemberInfoById(member.id);
					layer.msg("操作成功！预计1个工作日内到账！",{icon:1,time:1000});
					break;
				case "1002":
					layer.closeAll();
					layer.msg("账户余额不足！",{icon:5,time:1000});
				default:
					break;
			}
		}
	});
}

//获取最新用户信息
function getMemberInfoById(id){
	$.ajax({
		type:"get",
		url:apiUrl+"/client/api/member/findById?id="+id,
		async:true,
		success:function(res){
			sessionStorage.setItem('member',JSON.stringify(res));
			member = res;
			$('#user_asset').text(member.asset.toFixed(2));
		}
		
	});
}

//获取微信二维码
function getWxCode(id){
		$.ajax({
			type: "get",
			url: apiUrl + "/wx/assist/qrcode",
			data: {
				memberId: id
			},
			success: function(res) {
				var qrcode = new QRCode("erCode", {
					text: res.url,
					width: 200,
					height: 200,
					colorDark: "#000000",
					colorLight: "#ffffff",
					typeNumber: 4,
					correctLevel: QRCode.CorrectLevel.H
				});
			}
		});
	}


//定时器轮询支付结果
function getPayResult(orderNo){
	$.ajax({
		type:"get",
		url:apiUrl+"/wx/entPay/queryOrder/"+orderNo,
		async:true,
		success:function(res){
			if(res.status=="1001"){
				clearInterval(wxInterval);
				layer.msg("充值成功！",{icon:1,time:1500});
				setTimeout(function(){
					layer.closeAll();
				},1500)
			}else if(res,status == "1002"){
				clearInterval(wxInterval);
				layer.msg("充值失败！请稍后再试！",{icon:5,time:1500});
				setTimeout(function(){
					layer.closeAll();
				},1500)
			}
		}
	});
}


});