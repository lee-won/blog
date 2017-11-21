var mongoose = require('./db');
var Basic = require('./basic');
var friendSchema = new mongoose.Schema({
	re_name:String,
	re_head:String,
	re_sex:String,
	re_birth:String,
	content: String,
	send_name: String,
	send_head: String,
	send_sex: String,
	send_birth: String,
	time: Object,
	state: Number
},{
	collection: 'friends'
});
var friendModel = mongoose.model('Friend',friendSchema);

function Friend(friend){ 
	this.re_name= friend.re_name;
	this.re_head= friend.re_head;
	this.re_sex= friend.re_sex;
	this.re_birth= friend.re_birth;
	this.content= friend.content;
	this.send_name= friend.send_name;
	this.send_head= friend.send_head;
	this.send_sex= friend.send_sex;
	this.send_birth= friend.send_birth;
}

Friend.prototype.save = function(callback){
	var date = new Date();
	var time={
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + "-" + (date.getMonth()+1),
		day: date.getFullYear() + "-" + (date.getMonth()+1) + "-" +date.getDate(),
		minute: date.getFullYear() + "-" + (date.getMonth()+1) + "-" +date.getDate()+ " " +date.getHours() + ":" + (date.getMinutes() < 10 ? '0' +
		date.getMinutes() : date.getMinutes())
	}
	var friend={
		re_name:this.re_name,
		re_head:this.re_head,
		re_sex:this.re_sex,
		re_birth:this.re_birth,
		content: this.content,
		send_name: this.send_name,
		send_head: this.send_head,
		send_sex: this.send_sex,
		send_birth: this.send_birth,
		time:time,
		state: 0
	};
	var newFriend = new friendModel(friend);
	
	newFriend.save(function(err,friend){
		if(err){
			return callback(err);
		}
		callback(null);
	});
	
};

module.exports = Friend;

Friend.getNum=function(name,state,page,pageSize,callback){
	if(state==0){
		friendModel.count({"re_name": name,"state":0},function(err,total){
		friendModel.find({"re_name": name,"state": 0}).sort({"time":-1}).exec(function(err,friends){
			if(err){
				return callback(err);
			}
			callback(null,friends,total);
		}); 
		});
	}
	if(state==1){
		friendModel.count({$or: [{"re_name":name,"state":1},{"send_name":name,"state":1}]},function(err,total){
		friendModel.find({$or: [{"re_name":name,"state":1},{"send_name":name,"state":1}]}).skip((page-1)*pageSize).limit(pageSize).sort({"time":-1}).exec(function(err,friends){
			if(err){
				return callback(err);
			}
			friends.forEach(function(friend, index) {
				if(friend.re_name==name){
					friend.send_birth = Basic['getAge'](friend.send_birth);
				}
				if(friend.send_name==name){
					friend.re_birth = Basic['getAge'](friend.re_birth);
				}
		})
			callback(null,friends,total);
		}); 
		});
	}	
};

Friend.getApplyNum=function(name,callback){
	friendModel.count({"re_name": name,"state":0},function(err,total){
		if(err){
				return callback(err);
			}
			callback(null,total);
	});
}


Friend.update=function(id,callback){
	friendModel.update({"_id":id},{"state":1},function(err){
		if(err){
			return callback(err);
		}
		callback(null);
	})
}

Friend.remove=function(id,callback){
	friendModel.remove({"_id":id},function(err){
		if(err){
			callback(err);
		}
		callback(null);
	})
}

Friend.getOne=function(name1,name2,callback){
	friendModel.findOne({$or: [{"re_name":name1,"send_name":name2}, {"re_name":name2,"send_name":name1}]},function(err,friend){
		if(err){
			return callback(err);
		}
		callback(err,friend);
	})
}


//更新朋友库中的用户数据
Friend.updateInfo=function(olduser,newuser,callback){
	friendModel.find({$or:[{"re_name":olduser.name},{"send_name":olduser.name}]},function(err,friends){
		if(err){
			return callback(err);
		}
		if(friends){
			friends.forEach(function(friend,index){
				if(friend.re_name==olduser.name){
					newuser_birth = Basic['getAge'](newuser.birth);
					friendModel.update({"_id":friend._id},{"re_name":newuser.name,"re_sex":newuser.sex,"re_birth":newuser.birth},function(err){
						if(err){
							return callback(err);
						}
					})
				}else if(friend.send_name==olduser.name){
					friendModel.update({"_id":friend._id},{"send_name":newuser.name,"send_sex":newuser.sex,"send_birth":newuser.birth},function(err){
						if(err){
							return callback(err);
						}
					})
				}
			})
		}
		callback(null);
	})
}

//更新朋友库中的头像
Friend.updateFace=function(username,data,callback){
	friendModel.find({$or:[{"re_name":username.name},{"send_name":username.name}]},function(err,friends){
		if(err){
			return callback(err);
		}
		if(friends){
			friends.forEach(function(friend,index){
				if(friend.re_name==username.name){
					friendModel.update({"_id":friend._id},{"re_head":data.head},function(err){
						if(err){
							return callback(err);
						}
					})
				}else if(friend.send_name==username.name){
					friendModel.update({"_id":friend._id},{"send_head":data.head},function(err){
						if(err){
							return callback(err);
						}
					})
				}
			})
		}
		callback(null);
	})
}