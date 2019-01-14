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
		var deleteIndex = [];
		var memberType = JSON.parse(sessionStorage.getItem('member')).type;
		userTypeAssign(memberType);
		getMemberInfoById(member.id);
		getNewsCount();//获取未读消息数量
	}
	
	$('#logout').on('click',function(){
		$.ajax({
			type:"get",
			url:apiUrl+"/logout",
			async:true,
			success:function(res){
				if(res.status == "200"){
					window.location.href = "login.html";
					sessionStorage.clear();
			}
			}
		});
	})

	var latestNewsVm = new Vue({
		el:'#questionsShow',
		data:{
			newsList:""
		},
		methods:{
			newsClickHandle:function(index,newsId,id,type){
				//点击去掉未读小红点
				if(modifyNewsStatus(index,newsId)){
					switch (type){
						case 'questionComplete'://问题结束，赏金分配方案诞生
							$('#questionsShow').hide();
							$('#iframeShow').show();
							sessionStorage.setItem('newsQId',id);
							$('#contentIframe').attr('src','newsDetails.html');
							break;
						case 'questionAbsurd'://赏金方案被拒绝
							$('#questionsShow').hide();
							$('#iframeShow').show();
							sessionStorage.setItem('newsQId',id);
							$('#contentIframe').attr('src','newsDetailsFirst.html');
							break;
						case 'questionFinish'://问题发放赏金
							$('#questionsShow').hide();
							$('#iframeShow').show();
							sessionStorage.setItem('newsQId',id);
							$('#contentIframe').attr('src','newsDetailsFinish.html');
							break;
						case 'questionModify'://问题被管理员修改
							window.location.href = "index.html";
							sessionStorage.setItem('modifyQFlag',true);
							break;
						case 'questionPublish'://有新问题发布
							window.location.href = "index.html";
							break;
						default:
							break;
					}
				}else{
					layer.msg("修改错误");
				}

			}
		},
		updated:function(){
//			layui.element.render('collapse');
			$('.newsItem').eq(0).css('margin-top','30px');
			for(var i=0;i<deleteIndex.length;i++){
				$('.newsItem').eq(deleteIndex[i]).hide();
			}
		},
		mounted:function(){
		}
	})
	
	getLatestNews(1);



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
		getLatestNews(1);

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
		document.getElementById("wxCashBox").reset();
	})
	
	$('#btnRecharge').on('click',function(){
		layer.open({
		title: false,
		type: 1,
		content: $('.btnRechargeDialog'),
		area: ['800px', '510px'],
		end:function(){
			clearInterval(wxInterval);
		}
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
		if(data.field.amount<1){
			layer.msg('最低提现金额为1元！');
		}else{
			aliCash(data.field.aliAccount,data.field.amount);
		}

		return false;
	});
	
	//微信提现
	form.on('submit(wxForm)', function(data) {
		if(data.field.amount<1){
			layer.msg('最低提现金额为1元！');
		}else{
			wxCash(data.field.amount);
		}
		return false;
	});
	
	//充值接口
	form.on('submit(reChargeForm)', function(data) {
		if(data.field.amount<0.1){
			layer.msg('最低充值金额为0.1元！');
		}else{
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
	$('#erCode').empty();
	if(member.weixin==""||!member.weixin){
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
			$('#wxPayCode').empty();
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
				},5000);
				layer.close(index);
				layer.msg("请扫码完成微信支付！",{time:1000});
			}else{
				layer.msg("二维码获取失败！",{icon:5,time:2000});
				layer.close(index);
			}
		},
		error:function(){
			layer.msg("网络错误！请稍后再试",{time:1000});
			setTimeout(function(){layer.closeAll()},1000);
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
				sessionStorage.setItem('aliPay',res.data.form);
	            var newWin = window.open('personalCenter.html');
	            newWin.location.href = 'aliPay.html';
	            AliInterval = setInterval(function(){
					getAliPayResult(res.data.no);
				},5000);

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
			description:"答题系统提现"
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
					break;
				case "1101":
					layer.closeAll();
					layer.msg("提现失败，请稍后再试",{icon:5,time:1000});
					break;
				default:
					break;
			}
		},
		error:function(){
			layer.closeAll();
			layer.msg("网络错误！",{icon:5,time:1000});
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
					layer.msg("操作成功！预计1个工作日内到账！",{icon:1,time:1500});
					break;
				case "1002":
					layer.closeAll();
					layer.msg("账户余额不足！",{icon:5,time:1500});
					break;
				case "1101":
					layer.closeAll();
					layer.msg("提现失败，请检查账号是否正确！",{icon:5,time:1500});
					break;
				default:
					break;
			}
		},
		error:function(){
			layer.msg("网络错误！",{icon:5,time:1000});
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
			url: apiUrl + "/wx/assist/qrcode?memberId=" + id,
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
			if(res.status=="200"){
				clearInterval(wxInterval);
				layer.msg("充值成功！",{icon:1,time:1000});
				getMemberInfoById(member.id);
				setTimeout(function(){
					layer.closeAll();
				},1000)
			}else if(res,status == "1002"){
				clearInterval(wxInterval);
				layer.msg("充值失败！请稍后再试！",{icon:5,time:1000});
				setTimeout(function(){
					layer.closeAll();
				},1000)
			}
		}
	});
}

//定时器轮询支付宝支付结果
function getAliPayResult(orderNo){
	$.ajax({
		type:"get",
		url:apiUrl+"/ali/pay/transOrderQuery?outTradeNo="+orderNo,
		async:true,
		success:function(res){
			if(res.status=="200"){
				clearInterval(AliInterval);
				layer.msg("充值成功！",{icon:1,time:1000});
				getMemberInfoById(member.id);
				setTimeout(function(){
					layer.closeAll();
				},1000)
			}else if(res,status == "1002"){
				clearInterval(AliInterval);
				layer.msg("充值失败！请稍后再试！",{icon:5,time:1000});
				setTimeout(function(){
					layer.closeAll();
				},1000)
			}
		}
	});
}

//获取最新消息
function getLatestNews(page){
	var index = layer.load(2);

	$.ajax({
		type:"get",
		url:apiUrl+"/client/api/message/findPage?sort=order%2Cdesc&sort=createTime%2Cdesc",
		async:false,
		data:{
			page:page,
			size:10
		},
		success:function(res){
			$('#questionsShow').css('display','block');
			if(res.content.length > 0){
				$('#noMessage').hide();
			for(var i=0;i<res.content.length;i++){
				var news = res.content[i];
				news.data = JSON.parse(news.data);
//				var question = findQuestionById(news.data.questionId);
				if(news.data.title){
					news.data.title = news.data.title.split('').length > 10 ?news.data.title.substring(0,10)+"...":news.data.title;
				}else{
					deleteIndex.push(i);
				}
				switch (news.data.dataType){
					case 'questionFinish':
						news.description = "您回答的<strong> "+news.data.title+"</strong> 问题已发布赏金，请您及时查看";
						break;
					case 'questionAgree':
							news.description = "项目经理已同意您提交的关于<strong> "+news.data.title+"</strong> 问题的赏金分配方案";
						break;
					case 'questionAbsurd':
							news.description = "项目经理已拒绝您提交的关于<strong> "+news.data.title+"</strong> 问题的赏金分配方案";
						break;
					case 'questionComplete':
						news.description = "甲方已提交<strong> "+news.data.title+"</strong> 问题的赏金分配方案，请查看";
						break;
					case 'questionModify':
						news.description = "管理员已修改的您的 <strong> "+news.data.title+"</strong> 问题，请注意查看";
						break;
					case 'questionPublish':
						news.description = "有新问题发布了！";
						break;
					default:
						break;
				}			
				}
			$('#box').paging({
					initPageNo: page, // 初始页码
					slideSpeed: 600, // 缓动速度。单位毫秒 
					totalPages: res.totalPages, //总页数
					callback: function(curPage) { // 回调函数 
						if(curPage != page) {
							getLatestNews(curPage);
						}
					}
				})
			}else{
				$('#noMessage').show();
			}

			latestNewsVm.newsList = res.content;
			layer.close(index);
				
		},
		error:function(){
			layer.close(index);
		}
	});
}

//修改消息已读状态
function modifyNewsStatus(index,id){
	var modifyFinish = false;
	$.ajax({
		type:"post",
		url:apiUrl+"/client/api/message/update?status=true&order=0&id="+id,
		async:false,
		data:{_method:'PUT'},
		success:function(res){
			var count = sessionStorage.getItem('newsCount');
			if(count>0){
				sessionStorage.setItem('newsCount',--count);
				$('#messageDot').text(count);
				$('.newsItem').eq(index).find('.layui-badge-dot').hide();
			}
			modifyFinish = true;
		}
	});
	return modifyFinish;
}

bindKeyEvent($("#inputPayCharge"));  
bindKeyEvent($("#inputAliPay"));  
bindKeyEvent($("#inputWxPay"));  

//输入金额格式限制
function bindKeyEvent(obj){  
    obj.keyup(function () {  
        var reg = $(this).val().match(/\d+\.?\d{0,4}/);  
        var txt = '';  
        if (reg != null) {  
            txt = reg[0];  
        }  
        $(this).val(txt);  
    }).change(function () {  
        $(this).keypress();  
        var v = $(this).val();  
        if (/\.$/.test(v))  
        {  
            $(this).val(v.substr(0, v.length - 1));  
        }  
    });  
}  


});