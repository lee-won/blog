var mongoose = require('./db');
var Basic = require('./basic');
var Post = require('./post');
var commentSchema = new mongoose.Schema({
	article_id: String,
	name: String,
	head: String,
	content: String,
	reply_comments: Array,
	time: Object,
}, {
	collection: 'comments'
});
var commentModel = mongoose.model('Comment', commentSchema);

function Comment(comment) {
	this.article_id = comment.article_id;
	this.name = comment.name;
	this.head = comment.head;
	this.content = comment.content;
	this.reply_comments = comment.reply_comments;
	this.time = comment.time;
}

Comment.prototype.save = function(callback) {
	var comment = {
		article_id: this.article_id,
		name: this.name,
		head: this.head,
		content: this.content,
		reply_comments: this.reply_comments,
		time: this.time
	};
	var newComment = new commentModel(comment);

	newComment.save(function(err, comment) {
		if(err) {
			return callback(err);
		}
		Post.updateComment(comment.article_id, 1, function(err) {
			if(err) {
				return callback(err);
			}
			callback(null);
		});

	});

};

module.exports = Comment;

Comment.getNum = function(id, page, pageSize, callback) {
	commentModel.count({
		"article_id": id
	}, function(err, total) {

		commentModel.find({
			"article_id": id
		}).skip((page - 1) * pageSize).limit(pageSize).sort({time:1}).exec(function(err, comments) {
			if(err) {
				return callback(err);
			}
			callback(null, comments, total);
		})
	})
}

//向评论中添加回复
Comment.update = function(id, data, callback) {
	commentModel.update({
		"_id": id
	}, {
		$push: {
			reply_comments: {
				name: data.name,
				head: data.head,
				content: data.content,
				reply_name: data.reply_name,
				time: data.time
			}
		}
	}, function(err) {
		if(err) {
			return callback(err);
		}
		callback(null);
	})
};

//修改资料时修改评论中的用户信息
Comment.updateInfo=function(olduser,newuser,callback){
	commentModel.update({"name":olduser.name},{"name":newuser.name},{multi:true},function(err){
		if(err){
			return callback(err);
		}
		commentModel.find({},function(err,comments){
			comments.forEach(function(comment,index){
				var newcomment=comment;
				comment.reply_comments.forEach(function(reply,index){
					if(reply.name==olduser.name){
						newcomment.reply_comments[index].name=newuser.name;
					}else if(reply.reply_name==olduser.name){
						newcomment.reply_comments[index].reply_name=newuser.name;
					}
				});
				commentModel.remove({"_id":comment._id},function(err){
					if(err){
						return callback(err);
					}
					newComment= new Comment(newcomment);
					newComment.save(function(err){
						if(err){
							return callback(err);
						}
					})
				})
				
				
			});
			callback(null);
		})
		
	})
}


//修改头像时修改评论中的相关头像
Comment.updateFace=function(username,data,callback){
	commentModel.update({"name":username.name},{"head":data.head},{multi:true},function(err){
		if(err){
			return callback(err);
		}
		commentModel.find({$or:[{"reply_comments.name":username.name}]},function(err,comments){
			comments.forEach(function(comment,index){
				var newcomment=comment;
				comment.reply_comments.forEach(function(reply,index){
					if(reply.name==username.name){
						newcomment.reply_comments[index].head=data.head;
					}
				});
				commentModel.remove({"_id":comment._id},function(err){
					if(err){
						return callback(err);
					}
					newComment= new Comment(newcomment);
					newComment.save(function(err){
						if(err){
							return callback(err);
						}
					})
				})
				
				
			});
			callback(null);
		})
		
	})
}



//删除帖子时，删除该帖子的全部评论
Comment.delete=function(id,callback){
	commentModel.remove({"article_id":id},function(err){
		if(err){
			return callback(err);
		}
		callback(null);
	})
};

//移除某一条评论或回复
Comment.remove = function(data, callback) {
		if(data.name) {
			commentModel.update({
				"_id": data.id
			}, {
				$pull: {
					"reply_comments": {
						"name": data.name,
						"reply_name": data.reply_name,
						"time": data.time
					}
				}
			}, function(err) {
				if(err) {
					return callback(err);
				}
				callback(null);

			})
		} else {
			commentModel.findOne({
				"_id": data.id
			}, function(err, comment) {
				if(comment) {
					Post.updateComment(comment.article_id, -1, function(err) {
						if(err) {
							return callback(err);
						}
						commentModel.remove({
							"_id": data.id
						}, function(err) {
							if(err) {
								return callback(err);
							}
							callback(null);

						})
					});

				}
			})

		}

	}
	