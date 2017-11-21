var mongoose = require('./db');
var Basic = require('./basic');
var touristSchema = new mongoose.Schema({
	parent_id: String,
	name: String,
	head: String,
	time: Object,
}, {
	collection: 'tourists'
});
var touristModel = mongoose.model('Tourist', touristSchema);

function Tourist(tourist) {
	this.parent_id = tourist.parent_id;
	this.name = tourist.name;
	this.head = tourist.head;
	this.time = tourist.time;
}

Tourist.prototype.save = function(callback) {
	var tourist = {
		parent_id: this.parent_id,
		name: this.name,
		head: this.head,
		time: this.time
	};
	var newtourist = new touristModel(tourist);

	newtourist.save(function(err, tourist) {
		if(err) {
			return callback(err);
		}
		callback(null);

	});

};

Tourist.getOne = function(data,callback){
	touristModel.findOne({"name":data.name,"parent_id":data.parent_id,"time.day":data.time.day},function(err,tour){
		if(err){
			return callback(err);
		}
		callback(null,tour);
	})
};

Tourist.getNum= function(id,callback){
	touristModel.find({"parent_id":id}).sort({"time":-1}).exec(function(err,tours){
		if(err){
			return callback(err);
		}
		callback(null,tours);
	})
}

Tourist.updateName=function(username,newuser,callback){
	touristModel.update(username,{$set:{"name":newuser.name}},{multi:true},function(err){
		if(err){
			return callback(err);
		}
		callback(null);
	})
}

//修改头像时更新对应的头像
Tourist.updateFace = function(name,data,callback){
	touristModel.update(name,{"head":data.head},{multi:true},function(err){
		if(err){
			return callback(err);
		}
		callback(null);
	})
}

module.exports = Tourist;


