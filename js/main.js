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

	} else {
		window.location.href = 'login.html';
	}


	var questionList = new Vue({
		el: "#questionsShow",
		data: {
			questionList: ""
		},
		methods: {
			//我要答题
			applyAction: function(questionId) {
				alert(questionId);
			}
		},
	})
	
									

	//初始化问题数据
	getQuestionDatas(1);

	//获取所有问题数据
	function getQuestionDatas(page) {
		var index = layer.load();
		$.ajax({
			type: "get",
			url: apiUrl+"/client/api/question/findPage",
			async: true,
			data: {
				page: page,
				size: 4
			},
			success: function(res) {
				countDownTime(res);
				questionList.questionList = res.content;
				$('#box').paging({
					initPageNo: page, // 初始页码
					slideSpeed: 600, // 缓动速度。单位毫秒 
					totalPages: res.totalPages, //总页数
					callback: function(curPage) { // 回调函数 
						console.log(curPage);
						if(curPage != page) {
							getQuestionDatas(curPage);
						}
					}
				})
				layer.close(index);
			},
			error: function() {
				layer.msg("获取数据失败", {
					icon: 5
				});
			}
		});
	}

	//获取分类问题数据
	function getQuestionDatasByType(page, platformId) {
		var index = layer.load();
		$.ajax({
			type: "get",
			url: apiUrl + "/client/api/question/findUiPage",
			data: {
				platformId: platformId,
				page: page,
				size: 4,
				sort: 'id,desc'
			},
			async: true,
			success: function(res) {
				if(res.content.length == 0) {
					layer.msg("该分类下暂无问题数据！");
				} else {
					questionList.questionList = res.content;
					countDownTime(res);
					$('#box').paging({
						initPageNo: page, // 初始页码
						slideSpeed: 600, // 缓动速度。单位毫秒 
						totalPages: res.totalPages, //总页数
						callback: function(curPage) { // 回调函数 
							if(curPage != page) {
								getQuestionDatasByType(curPage, platformId);
							}
						}
					})
				}
				layer.close(index);
			}
		});
	}

	$('#header_username').text(member.memberExt.u_name);
	$('#header_img').attr('src', imgUrl + member.tempHeadImg);

	//方案 施工图切换
	$('.nav-pills-left>li').on('click', function() {
		$('.nav-pills-left>li').not(this).removeClass('active');
		$('.nav-pills-left>li').not(this).addClass('else');
		$(this).addClass('active');
		$(this).removeClass('else');
		var selectedVal = $(this).find('a').eq(0).text();
		if(selectedVal == "方案") {
			personnelList.personnelList = personSchemeData;
		} else {
			personnelList.personnelList = personDrawingData;
		}
	})

	$('.nav-pills-right>li').on('click', function() {
		$('.nav-pills-right>li').not(this).removeClass('active');
		$('.nav-pills-right>li').not(this).addClass('else');
		$(this).addClass('active');
		$(this).removeClass('else');
		var selectedVal = $(this).find('a').eq(0).text();
		if(selectedVal == "方案") {
			platformList.platformList = platformSchemeData;
		} else {
			platformList.platformList = platformDrawingData;
		}
	})

	//获取左侧人才展示分类信息（方案与施工图）
	$.ajax({
		type: "get",
		url: apiUrl + "/client/api/personnelType/findPage?sort=id,asc",
		async: true,
		success: function(res) {
			for(var i = 0; i < res.content.length; i++) {
				if(res.content[i].type == "scheme") {
					personSchemeData.push(res.content[i]);
				} else {
					personDrawingData.push(res.content[i]);
				}
			}
		}
	});

	//获取右侧问题展示分类信息（方案与施工图）
	$.ajax({
		type: "get",
		url: apiUrl + "/client/api/platformType/findPage?sort=id,asc",
		async: true,
		success: function(res) {
			for(var i = 0; i < res.content.length; i++) {
				if(res.content[i].type == "scheme") {
					platformSchemeData.push(res.content[i]);
				} else {
					platformDrawingData.push(res.content[i]);
				}
			}
			console.log(platformDrawingData);
			console.log(platformSchemeData);
		}
	});

	//人才展示数据源
	var freeDesginerList = new Vue({
		el: "#personShow",
		data: {
			freeDesginerList: ""
		},
		methods: {
			//邀请人才
			inviteFreeDesigner: function(memberId, username) {
				$('#invitedUser').text(username);
				layer.open({
					title: '选择问题邀请',
					type: 1,
					content: $('#inviteDialog'),
					area: ['500px', '400px']
				});
			}
		}
	})


	//左侧人才分类数据源
	var personnelList = new Vue({
		el: '#personnelList',
		data: {
			personnelList: personSchemeData
		},
		methods: {
			//人才展示点击事件
			personnelTypeHandle: function(id) {
				var index = layer.load();
				$('#personShow').css('display', 'block');
				$('#questionsShow').css('display', 'none');
				$('#iframeShow').css('display', 'none');
				$.ajax({
					type: "get",
					url: apiUrl + "/client/api/member/findUiPage",
					data: {
						judgeInvited: false,
						personnelId: id
					},
					async: true,
					success: function(res) {
						for(var i = 0; i < res.content.length; i++) {
							res.content[i].tempHeadImg = imgUrl + res.content[i].tempHeadImg;
							res.content[i].memberExt.flags = res.content[i].memberExt.flags.split(',');
							for(var j = 0; j < res.content[i].personnelTree.length; j++) {
								res.content[i].personnelTree[j] = res.content[i].personnelTree[j].join('-');
							}
						}
						freeDesginerList.freeDesginerList = res.content;
						layer.close(index);
					}
				});
			}
		},
		mounted:function(){
			this.$nextTick(function(){
			if(IEVersion()==9){
//				$('.slidenav-classify-a').css('padding','26px 0px \9\0 !important');
//				$('.slidenav-classify-a').addClass('sdsdds');
			}
			})

		}
	})


	//右侧问题分类数据源
	var platformList = new Vue({
		el: '#platformList',
		data: {
			platformList: platformSchemeData,
			thirdList: '',
			fourthList:''
		},
		methods: {
			//问题展示点击事件
			platformTypeHandle: function(id,data) {
				$('#personShow').css('display', 'none');
				$('#questionsShow').css('display', 'block');
				$('#iframeShow').css('display', 'none');
				platformList.thirdList = data;
				if(data.length<1){
					var index = layer.load();
					$('#thirdList').css('display','none');
				}else{
					$('#thirdList').css('display','block');
				}
				this.$nextTick(function(){
//					$('#thirdList').find('li').eq(0).addClass('layui-this');
				})
					getQuestionDatasByType(1, id);
			},
			//问题展示点击事件
			thirdClickHandle: function(id,data) {
				platformList.fourthList = data;
					getQuestionDatasByType(1, id);
			},
			//问题展示点击事件
			fourthClickHandle: function(id,data) {
				getQuestionDatasByType(1, id);
			}
		}
	})


	
	//查看我的问题
	$('#btnMyQuestions').on('click', function() {
		$('#personShow').css('display', 'none');
		$('#questionsShow').css('display', 'none');
		$('#iframeShow').css('display', 'block');
		if(memberType == "freeDesigner") {
			$('#contentIframe').attr('src', 'myAnswers.html');
		} else {
			$('#contentIframe').attr('src', 'myQuestions.html');
		}
	})

	//查看往期回顾
	$('#btnLatestQuestions').on('click', function() {
		$('#personShow').css('display', 'none');
		$('#questionsShow').css('display', 'none');
		$('#iframeShow').css('display', 'block');
		$('#contentIframe').attr('src', 'latestQuestion.html');
	})

	//身份权限分配
	function userTypeAssign(memberType) {
		switch(memberType) {
			case 'firstParty':
				$('#header_userType').text("甲方").addClass('firstPartyType');
				$('#contentIframe').attr('src', 'myQuestions.html');
				var iframe = document.getElementById("contentIframe");
				if(iframe.attachEvent) {
					iframe.attachEvent("onload", function() {
						$('#contentIframe').contents().find('.person-btn-invite-in').css('display', 'block');
						$('#contentIframe').contents().find('.person-btn-invite').css('display', 'block');
					});
				} else {
					iframe.onload = function() {
						$('#contentIframe').contents().find('.person-btn-invite-in').css('display', 'block');
						$('#contentIframe').contents().find('.person-btn-invite').css('display', 'block');
					};
				};
				$('#personShow').find('.person-btn-invite').css('display', "block");
				$('#personShow').find('.person-btn-invite-in').css('display', "block");
				break;
			case 'freeDesigner':
				$('#header_userType').text("设计师").addClass('freeDesignerType');
				$('#contentIframe').attr('src', 'myAnswers.html');
				$('#btnMyQuestions').attr('src', 'img/btn_my_answers.png');
				$('.applyBtn').css('display', 'block');
				break;
			case 'projectManager':
				$('#contentIframe').attr('src', 'myQuestions.html');
				$('#btnAsk').css('display', 'none');
				break;
			default:
				break;
		}
	}

	function countDownTime(res) {
		for(var i = 0; i < res.content.length; i++) {
			res.content[i].year = res.content[i].finishDate.substring(0, 10);
			res.content[i].time = res.content[i].finishDate.substring(11, 20);
			$.leftTime(res.content[0].finishDate, function(dd) {
				if(dd.status) {
					$('#' + "d" + res.content[0].id).text(dd.d);
					$('#' + "h" + res.content[0].id).text(dd.h);
					$('#' + "m" + res.content[0].id).text(dd.m);
					$('#' + "s" + res.content[0].id).text(dd.s);
				}
			});
			if(res.content[1]) {
				$.leftTime(res.content[1].finishDate, function(dd) {
					if(dd.status) {
						$('#' + "d" + res.content[1].id).text(dd.d);
						$('#' + "h" + res.content[1].id).text(dd.h);
						$('#' + "m" + res.content[1].id).text(dd.m);
						$('#' + "s" + res.content[1].id).text(dd.s);
					}
				});
			}
			if(res.content[2]) {
				$.leftTime(res.content[2].finishDate, function(dd) {
					if(dd.status) {
						$('#' + "d" + res.content[2].id).text(dd.d);
						$('#' + "h" + res.content[2].id).text(dd.h);
						$('#' + "m" + res.content[2].id).text(dd.m);
						$('#' + "s" + res.content[2].id).text(dd.s);
					}
				});
			}
			if(res.content[3]) {
				$.leftTime(res.content[3].finishDate, function(dd) {
					if(dd.status) {
						$('#' + "d" + res.content[3].id).text(dd.d);
						$('#' + "h" + res.content[3].id).text(dd.h);
						$('#' + "m" + res.content[3].id).text(dd.m);
						$('#' + "s" + res.content[3].id).text(dd.s);
					}
				});
			}
		}
	}


function IEVersion() {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串  
    var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器  
    var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //判断是否IE的Edge浏览器  
    var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
    if(isIE) {
        var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
        reIE.test(userAgent);
        var fIEVersion = parseFloat(RegExp["$1"]);
        if(fIEVersion == 7) {
            return 7;
        } else if(fIEVersion == 8) {
            return 8;
        } else if(fIEVersion == 9) {
            return 9;
        } else if(fIEVersion == 10) {
            return 10;
        } else {
            return 6;//IE版本<=7
        }   
    } else if(isEdge) {
        return 'edge';//edge
    } else if(isIE11) {
        return 11; //IE11  
    }else{
        return -1;//不是ie浏览器
    }
}

