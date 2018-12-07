var apiUrl = "http://39.104.239.208:9111"
var imgUrl = "http://39.104.239.208"
//var apiUrl = "http://192.168.0.18:8000"

$.ajaxSetup({
//		crossDomain: true,
		crossDomain: true == !(document.all),
		xhrFields: {withCredentials: true},
     	error: function(jqXHR, textStatus, errorMsg){
     	 alert( '发送请求到"' + this.url + '"时出错[' + jqXHR.status + ']：' + errorMsg );
     }
})

