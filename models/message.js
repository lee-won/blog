var mongoose = require('./db');
var Basic = require('./basic');
var messageSchema = new mongoose.Schema({
	re_name:String,
	title: String,
	content: String,
	send_name: String,
	send_head: String,
	time: Object,
	state: Number,
	re_del: Number,
	send_del: Number
},{
	collection: 'messages'
});
var messageModel = mongoose.model('Message',messageSchema);

function Message(mess){ 
	this.re_name= mess.re_name;
	this.title= mess.title;
	this.content= mess.content;
	this.send_name= mess.send_name;
	this.send_head= mess.send_head;
}

Message.prototype.save = function(callback){
	var date = new Date();
	var time={
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + "-" + (date.getMonth()+1),
		day: date.getFullYear() + "-" + (date.getMonth()+1) + "-" +date.getDate(),
		minute: date.getFullYear() + "-" + (date.getMonth()+1) + "-" +date.getDate()+ " " +date.getHours() + ":" + (date.getMinutes() < 10 ? '0' +
		date.getMinutes() : date.getMinutes())
	}
	var message={
		re_name:this.re_name,
		title: this.title,
		content: this.content,
		send_name: this.send_name,
		send_head: this.send_head,
		time:time,
		state: 0,
		re_del: 0,
		send_del: 0
	};
	var newMessage = new messageModel(message);
	
	newMessage.save(function(err,message){
		if(err){
			return callback(err);
		}
		callback(null);
	});
	
};

module.exports = Message;

Message.getNum=function(name,boxType,page,pageSize,callback){
	if(boxType=="inbox"){
		messageModel.count({"re_name": name,"re_del": 0},function(err,total){
			
		messageModel.find({"re_name": name,"re_del": 0}).skip((page-1)*pageSize).limit(pageSize).sort({"time":-1}).exec(function(err,messages){
			if(err){
				return callback(err);
			}
			callback(null,messages,total);
		});
		});
	};
	if(boxType=="outbox"){
		messageModel.count({"send_name": name,"send_del":0},function(err,total){
		messageModel.find({"send_name": name,"send_del":0}).skip((page-1)*pageSize).limit(pageSize).sort({"time":-1}).exec(function(err,messages){
			if(err){
				return callback(err);
			}
			callback(null,messages,total);
		}); 
		});
	}
};

Message.getNoreadNum=function(name,callback){
	messageModel.count({"re_name": name,"re_del": 0,"state": 0},function(err,total){
		if(err){
				return callback(err);
			}
		callback(null,total);
	});
}


Message.getOne=function(id,name,callback){
	messageModel.findOne({"_id": id},function(err,message){
			if(err){
				return callback(err);
			}
			if(message.send_name!=name && !message.state){
				messageModel.update({"_id": id},{"state":1},function(err){
					if(err){
							return callback(err);
					}
					callback(null,message);
				})
			}else{
				callback(null,message);
			}
			
	}); 
};




Message.remove=function(ids,name,callback){
	if(typeof(ids)=='object'){
		ids.forEach(function(id,index){
		messageModel.findOne({"_id": id},function(err,message){
		if(message.re_del || message.send_del){
			message.remove({"_id": id},function(err){
				if(err){
					return callback(err);
				}
				
			})
		}else{
			if(name==message.re_name){	
				messageModel.update({"_id": id},{"re_del":1},function(err){
					if(err){
						return callback(err);
					}
						
				});
			}else if(name==message.send_name){
				messageModel.update({"_id": id},{"send_del":1},function(err){
					if(err){
						return callback(err);
					}
						
				});
			}
		}
		
	});
	})
	callback(null);
	}else{
		messageModel.findOne({"_id": ids},function(err,message){
		if(message.re_del || message.send_del){
			message.remove({"_id": ids},function(err){
				if(err){
					return callback(err);
				}
				callback(null);
			})
		}else{
			if(name==message.re_name){	
				messageModel.update({"_id": ids},{"re_del":1},function(err){
					if(err){
						return callback(err);
					}
					callback(null);	
				});
			}else if(name==message.send_name){
				messageModel.update({"_id": ids},{"send_del":1},function(err){
					if(err){
						return callback(err);
					}
					callback(null);	
				});
			}
		}
		
	});
	}
	
		
}

//更新短信中的用户数据
Message.update=function(olduser,newuser,callback){
	messageModel.find({$or:[{"re_name":olduser.name},{"send_name":olduser.name}]},function(err,messages){
		if(err){
			return callback(err);
		}
		if(messages){
			messages.forEach(function(message,index){
				if(message.re_name==olduser.name){
					messageModel.update({"_id":message._id},{"re_name":newuser.name},function(err){
						if(err){
							return callback(err);
						}
					})
				}else if(message.send_name==olduser.name){
					messageModel.update({"_id":message._id},{"send_name":newuser.name},function(err){
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
	


//更新短信中的头像
Message.updateFace=function(username,data,callback){
	messageModel.find({"send_name":username.name},function(err,messages){
		if(err){
			return callback(err);
		}
		if(messages){
			messages.forEach(function(message,index){
					messageModel.update({"_id":message._id},{"send_head":data.head},function(err){
						if(err){
							return callback(err);
						}
					})
			});
		}
		callback(null);
	})
}