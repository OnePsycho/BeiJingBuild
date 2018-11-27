    $(function(){ 	
    	//方案 施工图切换
    	$('.nav-pills-left>li').on('click',function(){
    		$('.nav-pills-left>li').not(this).removeClass('active');
    		$('.nav-pills-left>li').not(this).addClass('else');
    		$(this).addClass('active');
    		$(this).removeClass('else');
    	})
    	
    	$('.nav-pills-right>li').on('click',function(){
    		$('.nav-pills-right>li').not(this).removeClass('active');
			$('.nav-pills-right>li').not(this).addClass('else');
    		$(this).addClass('active');
			$(this).removeClass('else');
    		
    	})
    });