var layer = layui.layer;
var answerIndex;
var questionReward;
var currentId;
var currentIndex;
var currentType="scheme";
var questionList = new Vue({
	el: '#myQuestionContainer',
	data: {
		myList: "",
		rewardMembers:"",
		answers:""
	},
	methods: {
		joinQuestionHandle:function(questionId,status){
				$.ajax({
					type:"post",
					url:apiUrl+"/client/api/question/join?questionId="+questionId,
					async:true,
					success:function(res){
						switch (res.status){
							case "1001":
								layer.msg("该问题正在审核中！");
								break;
							case "1002":
								layer.msg("该房间参与人数已满！",{icon:5});
								break;
							case "200":
								//认证成功，可以进入房间
								$('#questionsShow').css('display','none');
								$('#iframeShow').css('display','block');
								self.parent.$('#contentIframe').attr('src','answerHall.html');
								sessionStorage.setItem('questionInfo',JSON.stringify(res.data));
								break;
							default:
								break;
						}
					}
				});
		},
		modifyStatus: function(index,questionId, status,reward) {
			switch(status) {
				case "normal":
				$('#questionReward').text(reward);
					currentId = questionId;
					questionReward= reward;
					currentIndex = index;
					getQuestionAnswers(questionId);
					break;
				case "complete":
					layer.confirm('确认删除？', {
						  btn: ['确认','取消'] //按钮
						}, function(){
						  $.ajax({
							type: "post",
							url: apiUrl + "/client/api/question/deleteById",
							async: true,
							data: {
								id: questionId,
								_method: "DELETE"
							},
							success: function(res) {
								layer.msg("删除成功！",{icon:1});
								getMyQuestions(1,currentType);
							}
						});
						});
					
					break;
				case "checkPending":
					sessionStorage.setItem('currentQuestionId',questionId)
					$('#contentIframe', parent.document).attr('src','modifyQuestion.html');
					break;
				default:
					break;
			}
	},
	showAnswer:function(index,answers,name){
		if(answerIndex!=index){
			$('.answerBox').show();
			$('#answerName').text(name);
			$('.answerBox').appendTo($('#rewardDialog').find('.layui-form-item').eq(index));
			answerIndex = index;
			questionList.answers = answers;
		}else{
			$('.answerBox').hide();
			answerIndex = 9999;
		}
		
	}
	}
})
		$('.question-type').on('click',function(){
			$(this).addClass('active');
			$('.question-type').not(this).removeClass('active');
			if($(this).text()=="方案"){
				getMyQuestions(1,'scheme');
				currentType = "scheme";
			}else{
				getMyQuestions(1,'workingDrawing');
				currentType = "workingDrawing"
			}
		})

getMyQuestions(1,'scheme');

//查找我的问题数据
function getMyQuestions(page,type) {
	$.ajax({
		type: "get",
		url: apiUrl + "/client/api/question/findMyPage",
		data: {
			page: page,
			size: 5,
			sort: 'id,desc',
			type:type
		},
		success: function(res) {
			for(var i = 0; i < res.content.length; i++) {
				if(res.content[i].status == "normal") {
					res.content[i].t1 = "结束";
				} else if(res.content[i].status == "checkPending") {
					res.content[i].t1 = "修改";
				} else {
					res.content[i].status = "complete";
					res.content[i].t1 = "删除";
				}
				
				res.content[i].miniTitle = res.content[i].title.split('').length > 20 ?res.content[i].title.substring(0,39)+'...':res.content[i].title;
			}
			questionList.myList = res.content;
			$('#box').paging({
				initPageNo: page, // 初始页码
				slideSpeed: 600, // 缓动速度。单位毫秒 
				totalPages: res.totalPages, //总页数
				callback: function(curPage) { // 回调函数 
					if(curPage != page) {
						getMyQuestions(curPage);
					} 
				}
			})
		}
	});
}

function completeQuestion(id){
		$.ajax({
			type: "post",
			url: apiUrl + "/client/api/question/completeQuestion",
			async: true,
			data: {
				id: id,
				status: "complete",
				_method: "PUT"
			},
			success: function(res) {
				res.t1 = "删除";
				res.miniTitle = res.title.split('').length > 20 ?res.title.substring(0,39)+'...':res.title;
				questionList.myList[currentIndex] = res;
				console.log(questionList.myList);
				questionList.$forceUpdate();
			}
		});
}

//查找
function getQuestionAnswers(questionId){
	$.ajax({
		type:"get",
		url:apiUrl+"/client/api/question/findById?id="+questionId,
		async:true,
		success:function(res){
			var participators = [];
			for(var i=0;i<res.memberJoinQuestions.length;i++){
				if(res.memberJoinQuestions[i].type == "participator"){
					participators.push(res.memberJoinQuestions[i]);
				}
			}
			questionList.rewardMembers = participators;
				if(questionList.rewardMembers.length > 0){
					layer.open({
						title: "设置赏金",
						type: 1,
						content: $('#rewardDialog'),
						area: ['500px', '450px']
					});
				}else{
					layer.msg("该问题无人参与，无赏金分配！",{icon:6,time:1200});
					completeQuestion(currentId);
				}
		}
	});
}

layui.use('form', function() {
	 var form = layui.form;
//提交赏金分配方案
	form.on('submit(rewardForm)', function(data) {
		var rewardForm = data.field;
		var ids = [];
		var reward = [];
		var totalReward = 0;
		for (var i in rewardForm) {
		    ids.push(i.substring(6));
		    reward.push(rewardForm[i]);
		};
		
		for(var i=0;i<reward.length;i++){
			totalReward += parseInt(reward[i]);
		};
		
		if(totalReward>questionReward){
			layer.msg("赏金总和不能超过问题赏金额度！请重新分配！",{icon:6,time:1000})			
		}else{
			for(var i=0;i<ids.length;i++){
				$.ajax({
					type:"post",
					url:apiUrl+"/client/api/memberJoinQuestion/update",
					async:true,
					data:{
						id:ids[i],
						reward:reward[i],
						_method:'PUT'
					},
					success:function(res){
						console.log(res);
					}
				});
			}
			layer.closeAll();
			layer.msg("方案提交成功！",{icon:1});
			completeQuestion(currentId);
		}
		return false;
	});
});