$(function() {
	//从session获取用户信息
	var member = JSON.parse(sessionStorage.getItem('member'));
	var layer = layui.layer;
	if(member) {
		var personSchemeData = [];
		var personDrawingData = [];
		var platformSchemeData = [];
		var platformDrawingData = [];
		var thirdListData=[];
		var memberType = JSON.parse(sessionStorage.getItem('member')).type;
		userTypeAssign(memberType);
	}
		

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
 
	$('#header_username').text(member.memberExt.u_name + memberType);
	$('#personalUsername').text(member.memberExt.u_name + memberType);
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
				$('#mySettings').css('display','none');
				break;
			case 'freeDesigner':
				$('#mySettings').css('display','block');
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
		content: $('.btnCashBox'),
		area: ['600px', '400px']
	});
	})
	
	layui.use('form', function() {
	var form = layui.form;
	//监听提交
	form.on('submit(aliForm)', function(data) {
		console.log(data.field);
		return false;
		});
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