var err = '<i class="iconfont">&#xe8f1;</i><span> ';
var succ = '<i class="iconfont">&#xe604;</i><span></span> ';

function checkUser(obj1, obj2) {
	var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
		if(obj1.val() == '') {
			obj1.parent().children().eq(1).html('');
			obj2.html(err + "请填写用户名").addClass('error');
		} else if(obj1.val().length < 2 || obj1.val().length > 10) {
			obj1.parent().children().eq(1).html('');
			obj2.html(err + "用户名应为2-10个字符，区分大小写").addClass('error');
		} else if(pattern.test(obj1.val())) {
			obj1.parent().children().eq(1).html('');
			obj2.html(err + '用户名不得包含特殊字符').addClass('error');
		} else {
			obj2.removeClass('error').html('');
			obj1.parent().children().eq(1).html(succ);
		}
}

function checkPass(obj1, obj2) {
		reg1 = /^.*[\d]+.*$/;
		reg2 = /^.*[A-Za-z]+.*$/;
		reg3 = /^.*[_@#%&^+-/*\/\\]+.*$/; //验证密码
		if(obj1.val() == "") {
			obj1.parent().children().eq(1).html('');
			obj2.html(err + "请填写密码").addClass('error');
		} else if(obj1.val().length > 16 || obj1.val().length < 8) {
			obj1.parent().children().eq(1).html('');
			obj2.html(err + "密码应为8-16个字符，区分大小写").addClass('error');
		} else if(!((reg1.test(obj1.val()) && reg2.test(obj1.val())) || (reg1.test(obj1.val()) && reg3.test(obj1.val())) || (reg2.test(obj1.val()) && reg3.test(obj1.val())))) {
			obj1.parent().children().eq(1).html('');
			obj2.html(err + "需至少包含数字、字母和符号中的两种类型").addClass('error');
		} else {
			obj2.removeClass('error').html('');
			obj1.parent().children().eq(1).html(succ);
		}
}

function checkNotpass(obj1, obj2) {
		if(obj1.val() == '') {
			obj1.parent().children().eq(1).html('');
			obj2.html(err + "请再次填写密码").addClass('error');
		} else if(obj1.val() == $('#pass').val()) {
			obj2.removeClass('error').html('');
			obj1.parent().children().eq(1).html(succ);
		} else {
			obj1.parent().children().eq(1).html('');
			obj2.html(err + "确认密码输入有误").addClass('error');
		};
}

//邮箱
function checkEmail(obj1, obj2) {
		reg = /^\w+[@]\w+((.com)|(.net)|(.cn)|(.org)|(.gmail))$$/;
		if(obj1.val() == "") {
			obj1.parent().children().eq(1).html('');
			obj2.html(err + "邮箱不能为空!").addClass('error');
		} else if(!reg.test(obj1.val())) {
			obj1.parent().children().eq(1).html('');
			obj2.html(err + "邮箱格式错误！").addClass('error');
		} else {
			obj2.removeClass('error').html('');
			obj1.parent().children().eq(1).html(succ);
		}
}

//手机号
function checkPhone(obj1, obj2) {
		reg = /^1(3|4|5|7|8)\d{9}$/i; //验证手机正则(输入前7位至11位)
		if(obj1.val() == "") {
			obj1.parent().children().eq(1).html('');
			obj2.html(err + "请输入手机号").addClass('error');
		} else if(obj1.val().length < 11) {
			obj1.parent().children().eq(1).html('');
			obj2.html(err + "手机号长度有误！").addClass('error');
		} else if(!reg.test(obj1.val())) {
			obj1.parent().children().eq(1).html('');
			obj2.html(err + "逗我呢，你确定这是你的手机号!!").addClass('error');
		} else {
			obj2.removeClass('error').html(''); 
			obj1.parent().children().eq(1).html(succ);
		}
}
