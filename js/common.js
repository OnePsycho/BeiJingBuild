//var apiUrl = "http://192.168.0.18:8000"
//var apiUrl = "http://test.frp.rongyaotech.com"
var imgUrl = "http://39.104.239.208"
var apiUrl = "http://39.104.239.208:9111"
var intrevalTime = 5000; //间隔时间 默认10秒
var createTime = new Date().getTime();
var intel = setInterval('getLatestNews()',intrevalTime);



function getNewsCount(){
	if(!sessionStorage.getItem('newsCount')){
			$.ajax({
				type:"get",
				url:apiUrl+"/client/api/message/countByEntity",
				async:false,
				data:{
					status:false
				},
				success:function(res){
					sessionStorage.setItem('newsCount',res);
					if(res!=0){
						$('#messageDot').show();
						$('#messageDot').text(res);
					}
				}
			});
	}else if(sessionStorage.getItem('newsCount')!=0){
		$('#messageDot').show();
		$('#messageDot').text(sessionStorage.getItem('newsCount'));
	}
		
}


function getLatestNews(){
	$.ajax({
		type:"get",
		url:apiUrl+"/client/api/message/newMessage",
		crossDomain: true == !(document.all),
		xhrFields: {withCredentials: true},
		async:true,
		data:{
			createTime:createTime
		},
		success:function(res){
			if(res&&res.content.length>0){
				var count = sessionStorage.getItem('newsCount');
				sessionStorage.setItem('message',res.content);
				sessionStorage.setItem('newsCount',count+res.content.length)
				$('#messageDot').show();
				$('#messageDot').text(count+res.content.length);
			}

		}
	});
		createTime = new Date() - intrevalTime
}

$.ajaxSetup({
//		crossDomain: true,
		crossDomain: true == !(document.all),
		xhrFields: {withCredentials: true},
		headers: { // 默认添加请求头
        "X-Requested-With": "XMLHttpRequest"
    },
     	error: function(jqXHR, textStatus, errorMsg){
			if(jqXHR.status == 401){
				top.location.href = 'login.html';
				alert("登录状态已过期，请重新登录！");
			}else if(jqXHR.status == 401){
				alert("Check");
			}
     }
})


$('#logout').on('click',function(){
	$.ajax({
		type:"post",
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