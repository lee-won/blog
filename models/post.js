var mongoose = require('./db');
var Basic = require('./basic');
var postSchema = new mongoose.Schema({
	name:String,
	head: String,
	title: String,
	post: String,
	type: String,
	time: Object,
	comments: Number,
	reprint_info: Object , 
	pv: Number,
	nice: Array
},{
	collection: 'posts'
});
var postModel = mongoose.model('Post',postSchema);

function Post(name,head,title,post,type){
	this.name= name;
	this.head= head;
	this.title= title;
	this.post= post;
	this.type= type;
}

Post.prototype.save = function(callback){
	var date = new Date();
	var time={
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + "-" + (date.getMonth()+1),
		day: date.getFullYear() + "-" + (date.getMonth()+1) + "-" +date.getDate(),
		minute: date.getFullYear() + "-" + (date.getMonth()+1) + "-" +date.getDate()+ " " +date.getHours() + ":" + (date.getMinutes() < 10 ? '0' +
		date.getMinutes() : date.getMinutes())
	}
	var post={
		name: this.name,
		head: this.head,
		time: time,
		title: this.title,
		type: this.type,
		post: this.post,
		comments: 0,
		reprint_info:{
			reprint_from:{},
			reprint_to: []
			},
		pv: 0,
		nice:[],
	};
	var newPost = new postModel(post);
	
	newPost.save(function(err,post){
		if(err){
			return callback(err);
		}
		callback(null);
	});
	
};

module.exports = Post;


Post.getNum=function(type,sort,name,time,page,pageSize,callback){
	var query={};
	if(name){
		query.name=name;
	};
	if(type){
		query.type=type;
	};
	if(time){
		postModel.count({"name": name,"time.month": time},function(err,total){
		if(sort == 'pv'){
			postModel.find({"name": name,"time.month": time}).skip((page-1)*pageSize).limit(pageSize).sort({"pv":-1}).exec(function(err,posts){
			if(err){
				return callback(err);
			}
			callback(null,posts,total);
			});
		}else if(sort == 'comments'){
			postModel.find({"name": name,"time.month": time}).skip((page-1)*pageSize).limit(pageSize).sort({"comments":-1}).exec(function(err,posts){
			if(err){
				return callback(err);
			}
			callback(null,posts,total);
			});
		}else{
			postModel.find({"name": name,"time.month": time}).skip((page-1)*pageSize).limit(pageSize).sort({"time":-1}).exec(function(err,posts){
			if(err){
				return callback(err);
			}
			callback(null,posts,total);
			});
		}
		
		
	})
		
	}else{
	postModel.count(query,function(err,total){
		if(sort == 'pv'){
			postModel.find(query).skip((page-1)*pageSize).limit(pageSize).sort({"pv":-1}).exec(function(err,posts){
			if(err){
				return callback(err);
			}
			callback(null,posts,total);
			});
		}else if(sort == 'comments'){
			postModel.find(query).skip((page-1)*pageSize).limit(pageSize).sort({"comments":-1}).exec(function(err,posts){
			if(err){
				return callback(err);
			}
			callback(null,posts,total);
			});
		}else{
			postModel.find(query).skip((page-1)*pageSize).limit(pageSize).sort({"time":-1}).exec(function(err,posts){
			if(err){
				return callback(err);
			}
			callback(null,posts,total);
			});
		}
		
		
	})
	};
}

Post.getOne = function(id,callback){
	postModel.findOne({
		"_id":id
	},function(err,post){
		if(err){
			return callback(err);
		}
		if(post){
			postModel.update({
				"_id":id
			},{$inc: {"pv": 1}},function(err){
				if(err){
					return callback(err);
				}
			})
		}
		callback(null,post);
	})
};


Post.edit = function(id,callback){
			postModel.findOne({
				"_id":id
			},function(err,doc){
				if(err){
					return callback(err);
				}
				callback(null,doc);  
			});
};

//更新一篇帖子
Post.update = function(id,data,callback){
	
			//更新文章内容
			postModel.update({"_id":id},data,function(err){
				if(err){
					console.log('文章更新失败');
					return callback(err);
				}
				callback(null);
			});
}

//修改资料时更新文章库中对应的数据
Post.updateInfo = function(olduser,newuser,callback){
	postModel.update({"name":olduser.name},{"name":newuser.name},{multi:true},function(err){
		if(err){
			return callback(err);
		}
		postModel.update({"reprint_info.reprint_from.name":olduser.name},{"reprint_info.reprint_from.name":newuser.name},{multi:true},function(err){
			if(err){
				return callback(err);
			}
			postModel.update({"reprint_info.reprint_to.name":olduser.name},{$set:{"reprint_info.reprint_to.$.name":newuser.name}},{multi:true},function(err){
				if(err){
					return callback(err);
				}
				postModel.update({"nice.login_user":olduser.name},{$set:{"nice.$.login_user":newuser.name}},{multi:true},function(err){
				if(err){
					return callback(err);
				}
				callback(null);
			});
		});
	});
	});
}

//修改头像时更新文章库中对应的头像
Post.updateFace = function(name,data,callback){
	postModel.update(name,{"head":data.head},{multi:true},function(err){
		if(err){
			return callback(err);
		}
		callback(null);
	})
}

Post.remove = function(id, callback ){
			postModel.findOne({
				"_id":id
			},function(err,doc){
				if(err){
					return callback(err);
				}
				//如果有 reprint_from, 即该文章是转载来的，先保存下来 reprint_from
				var reprint_from = "";
				if(doc.reprint_info.reprint_from){
					reprint_from = doc.reprint_info.reprint_from;
				}
				if(reprint_from != ""){
					//更新原文所在文档的 reprint_to
					postModel.update({
						"name": reprint_from.name,
						"time.day": reprint_from.day,
						"title": reprint_from.title
					},{
						$pull: {
							"reprint_info.reprint_to": {
								"name": doc.name,
								"day" : doc.time.day,
								"title": doc.title
						}}
					},function(err){
						if(err){
							return callback(err);
						}
					});
				}
				//删除转载来的文章所在的文档
				postModel.remove({
					"_id" : id
				},function(err){
					if(err){
						return callback(err);
					}
					callback(null);
				});
			});	
};


Post.reprint = function(reprint_from,reprint_to,callback){

			//找到被转载的文章的原文档
			postModel.findOne({
				"_id": reprint_from.id
			},function(err,doc){
				if(err){
					return callback(err);
				}
				var date = new Date();
				var time = {
					date: date,
					year: date.getFullYear(),
					month: date.getFullYear() + "-" + (date.getMonth()+1),
					day: date.getFullYear() + "-" + (date.getMonth()+1) + "-" +date.getDate(),
					minute: date.getFullYear() + "-" + (date.getMonth()+1) + "-" +date.getDate()+ " " +date.getHours() + ":" + (date.getMinutes() < 10 ? '0' +
					date.getMinutes() : date.getMinutes())
				}
				var newdoc={};
				newdoc.name = reprint_to.name;
				newdoc.head = reprint_to.head;
				newdoc.time = time;
				newdoc.title = doc.title;
				newdoc.type = doc.type;
				newdoc.post = doc.post;
				newdoc.comments = 0;
				newdoc.reprint_info = {"reprint_from" : reprint_from};
				newdoc.pv = 0;
				newdoc.nice=[];
				//更新被转载的原文档的 reprint_info 内的 reprint_to
				postModel.update({
					"_id" : reprint_from.id
				},{
				$push: {
					"reprint_info.reprint_to": {
					"name": reprint_to.name,
					"day" : time.day,
					"title" : doc.title
				}}
				},function(err){
					if(err){
						return callback(err);
					}
				});
				//将转载生成的副本修改后存入数据库，并返回存储后的文档
				var newPost = new postModel(newdoc);
				newPost.save(function(err,post){
				if(err){
					
					return callback(err);
				}
					callback(null,post);
				});
				
			});
		};


//更新赞的次数
Post.updateNice= function(id,login_user,callback){
			postModel.update({
			"_id" : id
			},{
				$push:{
					"nice": {
						login_user
					}}
			},function(err){
				if(err){
					return callback(err);
					}
				});
				callback(null);
		};
		
Post.updateComment= function(id,flag,callback){
			postModel.update({
			"_id" : id
			},{$inc: {"comments": flag}},function(err){
				if(err){
					return callback(err);
					}
				});
				callback(null);
		};

//好文推荐选择
Post.getRec = function(callback){
	postModel.count({"reprint_info.reprint_from" : undefined },function(err,total){	
		postModel.find({"reprint_info.reprint_from" : undefined},function(err,posts){
			if(err){
				
			}
			callback(null,posts,total);
		});
	})
}

//取得文章类型的总条数
Post.getTypes=function(blog_auther,callback){
	var types=['移动开发','web前端','架构设计','编程语言 ','互联网','数据库','系统运维','云计算'];
	var arr=new Array();
	types.forEach(function(type,index){
		postModel.count({"type":type,"name":blog_auther},function(err,total){
			if(err){
				return callback(err);
			}
			
			arr.push({type:type,count:total});
			if(arr.length == types.length){
				callback(arr);
			}
		});
	});
}




Post.getArchive=function(name,callback){
	postModel.find({"name": name}).sort({"time":-1}).exec(function(err,posts){
		var arr1=new Array();
		var arr2=new Array();
		if(posts.length==0){
			return callback(null,arr2);
		}
		posts.forEach(function(post,index){
			if(arr1.indexOf(post.time.month) == -1){
				arr1.push(post.time.month);
			};
		});
		arr1.forEach(function(value,index){
			postModel.count({"time.month":value,"name":name},function(err,total){
			if(err){
				return callback(err);
			}
			
			arr2.push({time:value,count:total});
			if(arr2.length == arr1.length){
				callback(null,arr2);
			}
		});
		});
	})

}


Post.search = function(keyword,page,pageSize,callback){
		var patten = new RegExp("^.*" + keyword + ".*$", "i");
		postModel.count({$or:[{"title":patten},{"name":patten}]},function(err,total){
			if(err){
				return callback(err);
			}
			postModel.find({$or:[{"title":patten},{"name":patten}]}).sort({"tiem":-1}).exec(function(err,docs){
				if(err){
					callback(err);
				}
				callback(null,docs,total);
			});
		});
};



/*
function Post(name,head,title,tags,post){
	this.name=name;
	this.head=head;
	this.title=title;
	this.post=post;
	this.tags=tags;
}
module.exports = Post;

Post.prototype.save = function(callback){
	var date = new Date();
	var time={
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + "-" + (date.getMonth()+1),
		day: date.getFullYear() + "-" + (date.getMonth()+1) + "-" +date.getDate(),
		minute: date.getFullYear() + "-" + (date.getMonth()+1) + "-" +date.getDate()+ " " +date.getHours() + ":" + (date.getMinutes() < 10 ? '0' +
		date.getMinutes() : date.getMinutes())
	}
	
	var post={
		name: this.name,
		head: this.head,
		time: time,
		title: this.title,
		tags: this.tags,
		post: this.post,
		comments: [],
		reprint_info: {},
		pv: 0,
		nice: 0
	};
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.insert(post,{safe: true},function(err){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null);
			});
		});
	});
};

//一次获取十篇文章
Post.getFive = function(name,page,num,callback){
	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//读取posts集合
		db.collection('posts',function(err, collection){
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
					limit: pageSize
				}).sort({
					time: -1
				}).toArray(function(err,docs){
					mongodb.close();
					if(err){
						return callback(err);
					}
				
				callback(null,docs,total);
				});
			});
		});
	});
};

Post.getOne = function(name,day,title,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.findOne({
				"name": name,
				"time.day": day,
				"title": title
			},function(err,doc){
				if(err){
					mongodb.close();
					return callback(err);
				}
				if(doc){
					collection.update({
						"name": name,
						"time.day": day,
					"title": title},{
						$inc: {"pv": 1}
					},function(err){
						mongodb.close();
						if(err){
							return callback(err);
						}
					});
					callback(null,doc);
				}
				
			});
		});
	});
};

Post.edit = function(name,day,title,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.findOne({
				"name": name,
				"time.day": day,
				"title": title
			},function(err,doc){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,doc);  //返回查询的一篇文章(markdown 格式)
			});
		});
	});
};

//更新一篇文章及相关信息
Post.update = function(name,day,title,post,new_title,tag,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//更新文章内容
			collection.update({
				"name": name,
				"time.day": day,
				"title": title
			},{$set: {
				post : post,
				title : new_title,
				tags : tag
			}},function(err){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null);
			});
		});
	});
}


//删除一篇文章
Post.remove = function(name, day, title, callback ){
	//打开数据库
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//根据用户名，日期和标题查找并删除一篇文章
			collection.findOne({
				"name": name,
				"time.day": day,
				"title": title
			},function(err,doc){
				if(err){
					mongodb.close();
					return callback(err);
				}
				
				//如果有 reprint_from, 即该文章是转载来的，先保存下来 reprint_from
				var reprint_from = "";
				if(doc.reprint_info.reprint_from){
					reprint_from = doc.reprint_info.reprint_from;
				}
				if(reprint_from != ""){
					//更新原文所在文档的 reprint_to
					collection.update({
						"name": reprint_from.name,
						"time.day": reprint_from.day,
						"title": reprint_from.title
					},{
						$pull: {
							"reprint_info.reprint_to": {
								"name": name,
								"day" : day,
								"title": title
						}}
					},function(err){
						if(err){
							mongodb.close();
							return callback(err);
						}
					});
				}
				//删除转载来的文章所在的文档
				collection.remove({
					"name": name,
					"time.day": day,
					"title": title
				},{
					w: 1
				},function(err){
					mongodb.close();
					if(err){
						return callback(err);
					}
					callback(null);
				});
			});
		});
	});
};

//返回所有文章存档信息
Post.getArchive = function(callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//返回只包含 name,time,title 属性的文档组成的文档数组
			collection.find({},{
				"name": 1,
				"title": 1,
				"time": 1
			}).sort({
				time: -1
			}).toArray(function(err,docs){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,docs);
			});
		});
	});
}



//返回所有标签
Post.getTags = function(callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//distinct 用来找出给定键的所有不同值
			collection.distinct("tags",function(err,docs){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,docs);
			});
		});
	});
};

//返回含有特定标签的所有文章
Post.getTag = function(tag,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.find({
				"tags": tag
			},{"name": 1,"time": 1,"title": 1}).sort({
				time: -1
			}).toArray(function(err,docs){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,docs);
			});
		});
	});
};

Post.search = function(keyword,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			
		var patten = new RegExp("^.*" + keyword + ".*$", "i");
		collection.find({ 
			"title": patten
		},{
			"name": 1,
			"time": 1,
			"title": 1
		}).sort({
			time: -1
		}).toArray(function(err,docs){
			mongodb.close();
			if(err){
				return callback(err);
			}
			callback(null,docs);
			});
		});
	});
};

//转载一篇文章
Post.reprint = function(reprint_from,reprint_to,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//找到被转载的文章的原文档
			collection.findOne({
				"name": reprint_from.name,
				"time.day": reprint_from.day,
				"title": reprint_from.title
			},function(err,doc){
				if(err){
					mongodb.close();
					return callback(err);
				}
				var date = new Date();
				var time = {
					date: date,
					year: date.getFullYear(),
					month: date.getFullYear() + "-" + (date.getMonth()+1),
					day: date.getFullYear() + "-" + (date.getMonth()+1) + "-" +date.getDate(),
					minute: date.getFullYear() + "-" + (date.getMonth()+1) + "-" +date.getDate()+ " " +date.getHours() + ":" + (date.getMinutes() < 10 ? '0' +
					date.getMinutes() : date.getMinutes())
				}
	
				delete doc._id;//注意要删掉原来的ID
	
				doc.name = reprint_to.name;
				doc.head = reprint_to.head;
				doc.time = time;
				doc.title = doc.title;
				doc.comments = [];
				doc.reprint_info = {"reprint_from" : reprint_from};
				doc.pv = 0;
	
				//更新被转载的原文档的 reprint_info 内的 reprint_to
				collection.update({
					"name" : reprint_from.name,
					"time.day" : reprint_from.day,
					"title" : reprint_from.title
				},{
				$push: {
					"reprint_info.reprint_to": {
					"name": doc.name,
					"day" : time.day,
					"title" : doc.title
				}}
				},function(err){
					if(err){
						mongodb.close();
						return callback(err);
					}
				});
	
				//将转载生成的副本修改后存入数据库，并返回存储后的文档
				collection.insert(doc,{
					safe:true
					},function(err,post){
						mongodb.close();
						if(err){
							return callback(err);
						}
						callback(err,post.ops);
					});
				});
		});
	});
};
	
	
//更新赞的次数
Post.updateNice= function(time,name,title,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}	
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			
			collection.update({
			"time.minute": time,
			"name": name,
			"title": title},{
				$inc: {"nice": 1}
			},function(err){
				mongodb.close();
				if(err){
					return callback(err);
					}
				});
				callback(null);
		});
	});
};
*/


	
	
	
	
	
	
	
	
	
	
	
	
	
	
	