//var mongodb = require('./db');
var crypto = require('crypto');
var mongoose = require('./db');

var userSchema = new mongoose.Schema({
	name: String,
	password: String,
	email: String,
	birth: String,
	sex: String,
	phone: String,
	read: String,
	head: String,
}, {
	collection: 'users'
});

var userModel = mongoose.model('User', userSchema);

function User(user) {
	this.name = user.username;
	this.password = user.password;
	this.email = user.email;
	this.birth = user.birth;
	this.sex = user.sex;
	this.phone = user.phone;
	this.read = user.read;
}
User.prototype.save = function(callback) {
	var md5 = crypto.createHash('md5'),
		email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),
		head = "/images/head/face.jpg";
	var user = {
		name: this.name,
		password: this.password,
		email: this.email,
		birth: this.birth,
		sex: this.sex,
		phone: this.phone,
		read: this.read,
		head: head,
	};
	var newUser = new userModel(user);

	newUser.save(function(err, user) {
		if(err) {
			return callback(err);
		}
		callback(null, user);
	});
};

User.get = function(name, callback) {
	userModel.findOne({
		$or: [{
			"name": name
		}, {
			"phone": name
		}, {
			"email": name
		}]
	}, function(err, user) {
		if(err) {
			return callback(err);
		}
		callback(null, user);
	});
};

//判断是否有重复的手机号
User.isPhone = function(phone, callback) {
	userModel.find({
		"phone": phone
	}, function(err, users) {
		if(err) {
			return callback(err);
		}
		callback(null, users)
	})
}

//判断是否有重复的邮箱
User.isEmail = function(email, callback) {
		userModel.find({
			"email": email
		}, function(err, users) {
			if(err) {
				return callback(err);
			}
			callback(null, users)
		})
	}
	//判断是否有重复的用户名
User.isName = function(name, callback) {
	userModel.find({
		"name": name
	}, function(err, users) {
		if(err) {
			return callback(err);
		}
		callback(null, users)
	})
}

User.getNum = function(page, num, callback) {
	userModel.count({}, function(err, total) {

		userModel.find({}).skip((page - 1) * num).limit(num).sort({
			'time': -1
		}).exec(function(err, users) {
			if(err) {
				return callback(err);
			}
			callback(null, users, total);
		});
	})

}

User.update = function(olduser, newuser, callback) {
	userModel.update(olduser, newuser, function(err) {
		if(err) {
			console.log("数据库读取错误");
			return callback(err);
		}
		userModel.findOne({
			"name": newuser.name
		}, function(err, newUser) {
			callback(null, newUser);
		});

	});
}

User.updatePass = function(phone,pass,callback) {
	userModel.update({"phone":phone}, {"password":pass}, function(err) {
		if(err) {
			console.log("数据库读取错误");
			return callback(err);
		}
		callback(null);
	});
}

module.exports = User;

/*
function User(user){
	this.name = user.username;
	this.password = user.password;
	this.email = user.email;
	this.birth = user.birth;
	this.sex = user.sex;
	this.phone = user.phone;
	this.code = user.code;
	this.read = user.read;
}
module.exports = User;

//存储用户信息
User.prototype.save = function(callback){
	//要存入数据库的用户文档
	var md5 = crypto.createHash('md5'),
	email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),
	head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=40";
	var user = {
		name: this.name,
		password: this.password,
		email: this.email,
		birth: this.birth,
		sex: this.sex,
		phone: this.phone,
		code: this.code,
		read:this.read,
		head : head
	};
	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			return callback(err); //错误，返回err信息
		}
		//读取users 集合
		db.collection('users',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err); //错误，返回err信息
			}
			//将用户数据插入users集合
			collection.insert(user,{
				safe:true
			},function(err,user){
				mongodb.close();
				if(err){
					return callback(err); //错误，返回err信息
				}
				callback(null,user[0]);//成功！err为null,并返回存储后的用户文档
			});
		});
	});
};

//读取用户信息
User.get = function(name, callback){
	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			return callback(err); //错误，返回 err 信息
		}
		//读取users集合
		db.collection('users',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err); //错误,返回err信息
				
			}
			//查找用户名 （name键） 值为 name 一个文档
			collection.findOne({
				name:name
			},function(err,user){
				mongodb.close();
				if(err){
					return callback(err);//失败！返回err信息
				}
				callback(null,user);//成功！返回查询的用户信息
			});
		});
	});
};

//读取8个用户的信息
User.getNum = function(name,page,num,callback){
	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//读取users集合
		db.collection('users',function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if(name){
				query.name = name;
			}
			//使用 count 返回特定查询的文档数 total
			collection.count(query,function(err, total){
				//根据 query 对象的查询，并跳过前(page-1)*5 个结果，返回之后的5个结果
				collection.find(query,{
					skip: (page-1)*num,
					limit: num
				}).sort({
					time: -1
				}).toArray(function(err,users){
					mongodb.close();
					if(err){
						return callback(err);
					}
				
				
				callback(null,users,total);
				});
			});
		});
	});
};
*/