module.exports = {
	//生日转年龄函数
	getAge: function(strBirthday) {
		var returnAge;
		var strBirthdayArr = strBirthday.split("-");
		var birthYear = parseInt(strBirthdayArr[0]);
		var birthMonth = parseInt(strBirthdayArr[1]);
		var birthDay = parseInt(strBirthdayArr[2]);
		d = new Date();
		var nowYear = parseInt(d.getFullYear());
		var nowMonth = parseInt(d.getMonth() + 1);
		var nowDay = parseInt(d.getDate());
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

	},
	//指定范围内生成随机数
	getRadom: function(m,n){
		var range = n-m;
		 return Math.floor(Math.random() * range + m);
	}

}