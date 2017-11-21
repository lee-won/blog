//生日转年龄函数
function jsGetAge(strBirthday) {
	var returnAge;
	var strBirthdayArr = strBirthday.split("-");
	var birthYear = strBirthdayArr[0];
	var birthMonth = strBirthdayArr[1];
	var birthDay = strBirthdayArr[2];

	d = new Date();
	var nowYear = d.getYear();
	var nowMonth = d.getMonth() + 1;
	var nowDay = d.getDate();

	if(nowYear == birthYear) {
		returnAge = 0; //同年 则为0岁
	} else {
		var ageDiff = nowYear - birthYear; //年之差
		if(ageDiff > 0) {
			if(nowMonth == birthMonth) {
				var dayDiff = nowDay - birthDay; //日之差
				if(dayDiff < 0) {
					returnAge = ageDiff - 1;
				} else {
					returnAge = ageDiff;
				}
			} else {
				var monthDiff = nowMonth - birthMonth; //月之差
				if(monthDiff < 0) {
					returnAge = ageDiff - 1;
				} else {
					returnAge = ageDiff;
				}
			}
		} else {
			returnAge = -1; //返回-1 表示出生日期输入错误 晚于今天
		}
	}

	return returnAge; //返回周岁年龄

}

$(function() {
	$('#type').mouseover(function() {
		$('.type-list').css('display', 'block')
	})
	$('.type-list').mouseover(function() {
		$('.type-list').css('display', 'block')
	})
	$('#type').mouseout(function() {
		$('.type-list').css('display', 'none')
	})
	$('.type-list').mouseout(function() {
		$('.type-list').css('display', 'none')
	});

	for(var i = 0; i < $('.post-sub').length; i++) {
		var str = $('.post-sub').eq(i).text();
		$('.post-sub').eq(i).html(str.substring(0, 100) + '...');
	};
	
	
	
	//轮播js
	$('#thumb ul').width(($('#thumb ul li').width()+4)*$('#thumb ul li').length);
	var thumbLength=$('#thumb ul li').length;
	var nowIndex=0;
	var disX=null;
	var arr=['web前端开发','取消在职研究生','日语入门','OA系统','电脑编程入门自学','东风标致508','手绘漫画','现金打鱼','4D体验']
	$('#thumb ul li').mouseover(function(){
		clearInterval(timer);
		nowIndex=$(this).index();
		disX=($('#thumb ul li').width()+4)*(4-parseInt(nowIndex));
		if(nowIndex>4&&nowIndex<(thumbLength-1)){
			$('#thumb ul').css('left',disX);
		}
		for(var i=0;i<thumbLength;i++){
			$('#thumb ul li').eq(i).css('border-color','#eee');
		}
		for(var i=0;i<thumbLength;i++){
			$('#big .slide').eq(i).css('opacity','0');
		}
		$('#big .slide').eq(nowIndex).animate({'opacity':'1'},500);
		$('#adv-info').html(arr[nowIndex]);
		$(this).css('border-color','red');
		
	});
	$('#thumb ul li').mouseout(function(){
		timer=setInterval(play,3000);
	})
	var timer=null;
	timer=setInterval(play,3000);
	
	function play(){
		nowIndex++;
		if(nowIndex==thumbLength){
			nowIndex=0;
			$('#thumb ul').css('left',0);
		}
		disX=($('#thumb ul li').width()+4)*(4-parseInt(nowIndex));
		if(nowIndex>4&&nowIndex<thumbLength){
			$('#thumb ul').animate({'left':disX},500);
		}
		for(var i=0;i<thumbLength;i++){
			$('#thumb ul li').eq(i).css('border-color','#eee');
		}
		for(var i=0;i<thumbLength;i++){
			$('#big .slide').eq(i).css('opacity','0');
		}
		$('#big .slide').eq(nowIndex).animate({'opacity':'1'},500);
		$('#thumb ul li').eq(nowIndex).css('border-color','red');
		$('#adv-info').html(arr[nowIndex]);
	}
	
	
	//侧边栏
	$('#top').hover(function(){
		$(this).css({'background-color':'#aaa','color':'#fff'});
		$(this).html('<span style="font-size:12px;display:block;width:25px;height:25px;position:relative;top:8px;left:13px;">回到顶部<span>');
	},function(){
		$(this).css({'background-color':'#eee'});
		$(this).html('<i style="font-size:30px;line-height:49px;color:#06c;" class="iconfont">&#xe689;</i>');
	})
	$('#top').click(function(){
		$("html,body").animate({scrollTop:0},1000);
	})
	
	$('#chat').hover(function(){
		$(this).css({'background-color':'#aaa','color':'#fff'});
		$(this).html('<a href="http://wpa.qq.com/msgrd?v=3&amp;uin=751765309&amp;site=qq&amp;menu=yes " target="_blank"><span style="font-size:12px;display:block;width:25px;height:25px;color:#fff;position:relative;top:8px;left:13px;">联系我们<span></a>');
	},function(){
		$(this).css({'background-color':'#eee'});
		$(this).html('<i style="font-size:30px;line-height:49px;color:#06c;" class="iconfont">&#xe605;</i>');
	})
	
	$('#fast_edit').hover(function(){
		$(this).css({'background-color':'#aaa','color':'#fff'});
		$(this).html('<a style="font-size:12px;display:block;width:25px;height:25px;color:#fff;position:relative;top:8px;left:13px;" href="#post-edit">快速发帖<a>');
	},function(){
		$(this).css({'background-color':'#eee'});
		$(this).html('<i style="font-size:30px;line-height:49px;color:#06c;" class="iconfont">&#xe627;</i>');
	})
	
	
	$('#slide-nav').css("top",($(window).height()-$('#slide-nav').height())/2);
	$(window).resize(function(){
		$('#slide-nav').animate({"top":($(window).height()-$('#slide-nav').height())/2});
	})
	

})


