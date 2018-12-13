
var questionList = new Vue({
	el:'#myQuestionContainer',
	data:{
		myList:""
	}
})


getMyQuestions(1);


function getMyQuestions(page){
$.ajax({
	type:"get",
	url:apiUrl+"/client/api/question/findMyPage",
	data:{
		page:page,
		size:5,
		sort:'id,desc'
	},
	success:function(res){
		for(var i=0;i<res.content.length;i++){
			if(res.content[i].status == "normal"){
				res.content[i].t1 = "结束";
			}else if(res.content[i].status == "checkPending"){
				res.content[i].t1 = "修改";
			}else{
				res.content[i].t1 = "删除";
			}
		}
		questionList.myList = res.content;
		$('#box').paging({
			initPageNo: page, // 初始页码
			slideSpeed: 600, // 缓动速度。单位毫秒 
			totalPages: res.totalPages, //总页数
			callback: function(curPage) { // 回调函数 
				console.log(curPage);
				if(curPage != page) {
					getMyQuestions(curPage);
				}
			}
		})
	}
});
}
