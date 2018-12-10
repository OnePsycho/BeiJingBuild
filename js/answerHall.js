
$('#iframeShow',window.parent.document).css("background","rgba(0,0,0,0)");
	$('.memberBox').find('.memberItem').last().find('hr').hide();
	var noticeFlag = false;
	console.log($('.noticeText').height());
	var noticeHeight = $('.noticeText').height();
	if(noticeHeight > 50){
		$('.noticeText').css('height','100px');
		$('.openAll').show();
	}
	$('.openAll').on('click',function(){
		if(!noticeFlag){
			$('.noticeText').css('-webkit-line-clamp','unset').css('height','auto');
			$('.openAll').find('span').text("收起全文");
			$('.openAll').find('i').removeClass('layui-icon-down').addClass('layui-icon-up');
			noticeFlag  = true;
		}else{
			$('.noticeText').css('-webkit-line-clamp','5').css('height','100px');
			$('.openAll').find('span').text("展开详情");
			$('.openAll').find('i').removeClass('layui-icon-up').addClass('layui-icon-down');
			noticeFlag  = false;
		}
		
	})