//var apiUrl = "http://39.104.239.208:9111"
var apiUrl = "http://test.frp.rongyaotech.com"
//var apiUrl = "http://192.168.0.18:8000"
var imgUrl = "http://39.104.239.208"
var intrevalTime = 5000; //间隔时间 默认10秒
var createTime = new Date().getTime();



//var intel = setInterval('getLatestNews()',intrevalTime);


function getLatestNews(){
	$.ajax({
		type:"get",
		url:apiUrl+"/client/api/message/findPage",
		crossDomain: true == !(document.all),
		xhrFields: {withCredentials: true},
		async:true,
		data:{
			createTime:createTime
		},
		success:function(res){
			console.log(res);

		}
	});
		createTime = new Date() - intrevalTime
	
}





$.ajaxSetup({
//		crossDomain: true,
		crossDomain: true == !(document.all),
		xhrFields: {withCredentials: true},
     	error: function(jqXHR, textStatus, errorMsg){
     	 alert( '发送请求到"' + this.url + '"时出错[' + jqXHR.status + ']：' + errorMsg );
     }
})
