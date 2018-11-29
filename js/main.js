    //从session获取用户信息
    
   	var member = JSON.parse(sessionStorage.getItem('member'));
   	var personSchemeData=[];
   	var personDrawingData=[];
   	var memberType = JSON.parse(sessionStorage.getItem('member')).type;
   	
   	if(!member){
   		window.location.href = 'login.html';
   	}
   	    
    $(function(){
    	
   		$('#header_username').text(member.memberExt.u_name+memberType);
    	$('#header_img').attr('src',imgUrl+member.tempHeadImg);
    	
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
    	
    	$.ajax({
    		type:"get",
    		url:apiUrl+"/client/api/personnelType/findPage",
    		async:true,
    		success:function(res){
    		for(var i=0;i<res.content.length;i++){
				if(res.content[i].type=="scheme"){
					personSchemeData.push(res.content[i]);
				}else{
					personDrawingData.push(res.content[i]);
				}
			}
    		}
    	});
    	
    	var personnelList = new Vue({
		  el: '#personnelList',
		  data: {
		    personnelList:personSchemeData
		  },
		  methods:{
		  	//人才展示点击事件
		  	personnelTypeHandle:function(id){
    			console.log(id);
		  	}
		  }
		})
    	
    	
    	$('#btnMyQuestions').on('click',function(){
    		$('#contentIframe').attr('src','myQuestions.html');
    	})
    	
    	$('#btnLatestQuestions').on('click',function(){
    		$('#contentIframe').attr('src','latestQuestion.html');
    	})
    	
    	
    });