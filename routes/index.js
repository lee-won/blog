var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var multiparty = require('multiparty');
var util = require('util');
var fs = require('fs');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Message = require('../models/message.js');
var Comment = require('../models/comment.js');
var Friend = require('../models/friend.js');
var Basic = require('../models/basic.js');
var Tourist = require('../models/tourist.js');
var AliDaYu = require('alidayu-node-sdk');
var alidayu = new AliDaYu('23656883', 'a580bb4ad211a601912e61afdfedc15a');

//验证码变量
 var Code=null;
 
/* GET home page. */
router.get('/', function(req, res, next) {
	var sort = req.query.sort;
	//判断是否是第一页，并把请求的页数转换成number类型
	var page = req.query.p ? parseInt(req.query.p) : 1;

	//查询并返回第page页的 5篇文章
	Post.getNum(null, sort, null, null, page, 8, function(err, posts, post_all) {
		if(err) {
			posts = [];
			console.log('读取错误');
		}

		var flag = false;
		if(req.session.user) {
			flag = req.session.user;
		} else {
			flag = false;
		}
		User.getNum(1, 9, function(err, users, user_total) {
			if(err) {
				users = [];
				console.log('读取错误');
			}

			Post.getRec(function(err, posts_r, oragin_total) {
				if(err) {
					postRec = [];
					console.log('读取错误');
				}
				var postRec = [];
				if(oragin_total <= 8) {
					postRec = posts_r;
				} else {
					while(true) {
						var random = Basic['getRadom'](0, oragin_total);
						if(postRec.indexOf(posts_r[random]) == -1) {
							postRec.push(posts_r[random]);
						}
						if(postRec.length == 8) {
							break;
						};
					}
				}

				res.render('index', {
					headPage: 1,
					users: users,
					user_total: user_total,
					login_user: flag,
					posts: posts,
					postRec: postRec,
					post_all: post_all,
					page_all: Math.ceil(post_all / 8),
					page: page,
					isFirstPage: (page - 1) == 0,
					isLastPage: ((page - 1) * 8 + posts.length) == post_all,
					sort: sort,
					title:"首页",
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});

			});

		});
	});

});

router.post('/', function(req, res) {
	var headPage = req.body.headPage;
	if(!req.session.user) {
		req.flash('error', '<script>alert(请先登录！)</script>');
		return res.redirect('/');
	}
	var currentUser = req.session.user,
		type = req.body.type,
		post = new Post(currentUser.name, currentUser.head, req.body.title, req.body.post, type);
	post.save(function(err) {
		if(err) {
			//req.flash('error',err);
			return res.redirect('/');
		}
		//req.flash('success','发布成功！');
		console.log('发布成功');
		res.redirect('/');
	});
})

router.get('/t/:type', function(req, res, next) {
	var type = req.params.type;
	var sort = req.query.sort;

	//判断是否是第一页，并把请求的页数转换成number类型
	var page = req.query.p ? parseInt(req.query.p) : 1;

	//查询并返回第page页的 5篇文章
	Post.getNum(type, sort, null, null, page, 8, function(err, posts, post_all) {
		if(err) {
			posts = [];
			console.log('读取错误');
		}

		var flag = false;
		if(req.session.user) {
			flag = req.session.user;
		} else {
			flag = false;
		}
		User.getNum(1, 9, function(err, users, user_total) {
			if(err) {
				users = [];
				console.log('读取错误');
			}

			Post.getRec(function(err, posts_r, oragin_total) {
				if(err) {
					postRec = [];
					console.log('读取错误');
				}
				var postRec = [];
				if(oragin_total <= 8) {
					postRec = posts_r;
				} else {
					while(true) {
						var random = Basic['getRadom'](0, oragin_total);
						if(postRec.indexOf(posts_r[random]) == -1) {
							postRec.push(posts_r[random]);
						}
						if(postRec.length == 8) {
							break;
						};
					}
				}

				res.render('type_list', {
					headPage: 1,
					users: users,
					user_total: user_total,
					login_user: flag,
					posts: posts,
					postRec: postRec,
					post_all: post_all,
					page_all: Math.ceil(post_all / 8),
					page: page,
					isFirstPage: (page - 1) == 0,
					isLastPage: ((page - 1) * 8 + posts.length) == post_all,
					sort: sort,
					type: type,
					title:'分类-'+type,
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});

			});

		});
	});

});

router.post('/moreHead', function(req, res) {
	var headPage = req.body.headPage
	User.getNum(headPage, 9, function(err, users, user_total) {
		if(err) {
			users = [];
			console.log('读取错误');
		}
		if(users) {
			if(user_total <= headPage * 9) {
				headPage = 0;
			}
			users.push(headPage);
			res.send(users);
		} else {
			res.send(false);
		}
	})
});

router.post('/nice', function(req, res) {
	if(!req.session.user) {
		res.send(false);
	} else {
		var login_user = req.session.user.name,
			id = req.body.id;
		Post.updateNice(id, login_user, function(err) {
			if(err) {
				console.log(err);
				//return res.redirect('back'); 
			}
			res.send(true);
		});
	}
});

//router.get('/reg',checkNotLogin);
router.get('/reg', function(req, res, next) {
	res.render('reg', {
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()

	});
});

router.post('/reg/getCode', function(req, res, next) {
	var phone = req.body.phone;
	var code = Math.random();
	code = code.toString();
	code = code.substring(4, 8);

	alidayu.smsSend({
		sms_free_sign_name: "趣码博客",
		rec_num: phone,
		sms_template_code: "SMS_60135330",
		sms_param: {
			number: code
		}
	}).then(function(result) {
		if(result.alibaba_aliqin_fc_sms_num_send_response) {
			Code=code;
			res.end('true');
		} else {
			res.end();
		}
	});
});

/*router.post('/reg',checkNotLogin);*/
router.post('/reg', function(req, res) {
	var code= req.body.code;
	if(code!=Code || Code==''){
		req.flash('error', '<script type="text/javascript"> alert("验证码不正确!");</script>');
		return res.redirect('/reg'); //返回注册页
	}
	var username = req.body.username,
		password = req.body.pass,
		notpass = req.body.notpass;
	//验证用户两次输入的密码是否一致
	if(notpass != password) {
		req.flash('error', '<script type="text/javascript"> alert("两次输入密码不一致！");</script>');
		console.log('两次密码不一致')
		return res.redirect('/reg'); //返回注册页
	}
	//生成密码的md5值
	var md5 = crypto.createHash('md5'),
		password = md5.update(req.body.pass).digest('hex');
	var newUser = new User({
		username: req.body.username,
		password: password,
		email: req.body.email,
		birth: req.body.birth,
		sex: req.body.sex,
		phone: req.body.phone,
		code: req.body.code,
		read: req.body.read
	});
	//检查用户名是否存在
	User.get(username, function(err, user) {
		if(user) {
			req.flash('error', '<script type="text/javascript"> alert("用户已存在！");</script>');
			console.log('用户已存在！');
			return res.redirect('/reg'); //返回注册页
		}
		User.isEmail(newUser.email, function(err, users) {
			if(users.length != 0) {
				req.flash('error', '<script type="text/javascript"> alert("邮箱已被占用，请使用其他邮箱！");</script>');
				return res.redirect('/reg'); //返回注册页
			}
			User.isPhone(newUser.phone, function(err, users) {
				if(users.length != 0) {
					req.flash('error', '<script type="text/javascript"> alert("手机号已被占用，请使用其他手机号！");</script>');
					return res.redirect('/reg'); //返回注册页
				}
				//如果不存在则新增用户
				newUser.save(function(err, user) {
					if(err) {
						//req.flash('error',err);
						return res.redirect('/reg'); //注册失败返回注册页
					}
					req.flash('success', '<script type="text/javascript"> alert("恭喜您！注册成功");</script>');
					console.log('注册成功');
					Code=null;
					res.redirect('/login'); //注册成功后返回主页
				});
			})
		})

	});
});

/*router.get('/login',checkNotLogin);*/
router.get('/login', function(req, res, next) {
	res.render('login', {
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});

});
//router.post('/login',checkNotLogin);
router.post('/login', function(req, res) {
	var md5 = crypto.createHash('md5'),
		password = md5.update(req.body.pass).digest('hex');

	User.get(req.body.username, function(err, user) {
		if(!user) {
			console.log('用户不存在！');
			req.flash('error', '<script type="text/javascript"> alert("用户不存在！");</script>');
			return res.redirect('/login');
		}

		if(user.password != password) {
			console.log('密码错误!');
			req.flash('error', '<script type="text/javascript"> alert("密码错误！");</script>');
			return res.redirect('/login');
		}

		req.session.user = user;
		req.flash('success', '<script type="text/javascript"> alert("登录成功！");</script>');
		console.log('登录成功！');
		res.redirect('/u/' + encodeURI(req.session.user.name));
	});
});

router.get('/forget',function(req,res){
	res.render('forget', {
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
})

router.post('/forget',function(req,res){
	var code= req.body.code;
	if(code!=Code || Code==''){
		req.flash('error', '<script type="text/javascript"> alert("验证码不正确!");</script>');
		return res.redirect('back'); //返回注册页
	}
	var phone = req.body.phone;
	var md5 = crypto.createHash('md5'),
		password = md5.update(req.body.pass).digest('hex');
		User.get(phone,function(err,user){
			if(err){
				return res.redirect('back');
			}
			if(user){
				User.updatePass(phone,password,function(err){
					if(err){
						return res.redirect('back');
						console.log(err);
					}
					req.flash('success', '<script type="text/javascript"> alert("密码重新设置成功！");</script>');
					Code=null;
					res.redirect('/login');
				})
			}else{
				req.flash('success', '<script type="text/javascript"> alert("不存在含有此手机号的用户！");</script>');
			}
		})
	
})

router.get('/u/:name', function(req, res, next) {
	var sort = req.query.sort;
	var page = req.query.p ? parseInt(req.query.p) : 1;
	var visitor = null;

	User.get(req.params.name, function(err, user) {
		if(!user) {
			req.flash('error', '用户不存在 !');
			return res.redirect('/');
		}
		var age = Basic['getAge'](user.birth);

		if(req.session.user && req.session.user.name != req.params.name) {
			var date = new Date();
			var time = {
				date: date,
				day: (date.getMonth() + 1) + "月" + date.getDate() + "日"
			}
			visitor = {
				parent_id: user._id,
				name: req.session.user.name,
				head: req.session.user.head,
				time: time
			};
			Tourist.getOne(visitor, function(err, tour) {
				if(err) {
					console.log('数据库读取失败');
				}
				if(!tour) {
					newTourist = new Tourist(visitor);
					newTourist.save(function(err) {
						if(err) {
							return res.redirect('back');
						}
					});
				}
			});
		}

		Tourist.getNum(user._id, function(err, tours) {
			if(err) {
				return res.redirect('back');
			}
			Post.getNum(null, sort, req.params.name, null, page, 8, function(err, posts, post_all) {
				if(err) {
					posts = [];
					console.log('读取错误');
				};
				Post.getArchive(req.params.name, function(err, archives) {
					if(err) {
						archives = [];
						console.log('读取错误');
					}
					Post.getTypes(req.params.name, function(arr) {
						res.render('myblog', {
							age:age,
							types: arr,
							login_user: req.session.user,
							user: user,
							posts: posts,
							post_all: post_all,
							page_all: Math.ceil(post_all / 8),
							page: page,
							isFirstPage: (page - 1) == 0,
							isLastPage: ((page - 1) * 8 + posts.length) == post_all,
							sort: sort,
							archives: archives,
							tours: tours,
							title:user.name+'的博客',
							success: req.flash('success').toString(),
							error: req.flash('error').toString()
						});
					});
				});

			});
		});
	});
});

router.get('/u/:name/t/:type', function(req, res, next) {
	var sort = req.query.sort;
	var type = req.params.type;
	var page = req.query.p ? parseInt(req.query.p) : 1;
	var visitor = null;
	if(req.session.user && req.session.user.name != req.params.name) {
		visitor = req.session.user;
	}
	User.get(req.params.name, function(err, user) {
		if(!user) {
			req.flash('error', '用户不存在 !');
			return res.redirect('/');
		}
		var age = Basic['getAge'](user.birth);
		if(req.session.user && req.session.user.name != req.params.name) {
			var date = new Date();
			var time = {
				date: date,
				day: (date.getMonth() + 1) + "月" + date.getDate() + "日"
			}
			visitor = {
				parent_id: user._id,
				name: req.session.user.name,
				head: req.session.user.head,
				time: time
			};
			Tourist.getOne(visitor, function(err, tour) {
				if(err) {
					console.log('数据库读取失败');
				}
				if(!tour) {
					newTourist = new Tourist(visitor);
					newTourist.save(function(err) {
						if(err) {
							return res.redirect('back');
						}
					});
				}
			});
		};

		Tourist.getNum(user._id, function(err, tours) {
			if(err) {
				return res.redirect('back');
			}
			Post.getNum(type, sort, req.params.name, null, page, 8, function(err, posts, post_all) {
				if(err) {
					posts = [];
					console.log('读取错误');
				}
				Post.getTypes(req.params.name, function(arr) {
					Post.getArchive(req.params.name, function(err, archives) {
						if(err) {
							archives = [];
							console.log('读取错误');
						}
						res.render('blog_type_list', {
							age:age,
							types: arr,
							type: type,
							archives: archives,
							login_user: req.session.user,
							user: user,
							posts: posts,
							post_all: post_all,
							page_all: Math.ceil(post_all / 8),
							page: page,
							isFirstPage: (page - 1) == 8,
							isLastPage: ((page - 1) * 8 + posts.length) == post_all,
							sort: sort,
							tours: tours,
							title:'分类-'+type,
							success: req.flash('success').toString(),
							error: req.flash('error').toString()
						});
					});
				});

			});
		});
	});

});

router.get('/logout', checkLogin);
router.get('/logout', function(req, res) {
	req.session.user = null;
	req.flash('success', '登出成功！');
	res.redirect('/');
});

router.post('/upload', checkLogin);
router.post('/upload', function(req, res) {
	//生成multiparty对象，并配置上传目标路径
	var form = new multiparty.Form({
		uploadDir: './public/images/head/',
		maxFilesSize: 2 * 1024 * 1024
	});
	form.parse(req, function(err, fields, files) {
		if(err) {
			console.log('parse error: ' + err);
		} else {
			if(files.file[0].size == 0) {
				fs.unlinkSync(files.file[0].path);
				console.log('移除了空文件');
			} else {
				//var target_path = './public/images/head/' + files.file[0].originalFilename;
				var newHead = files.file[0].path;
				newHead = newHead.substring(6);
				//重命名文件
				//fs.renameSync(files.file[0].path, target_path);
				var data = {
					name: req.session.user.name,
					head: newHead
				};
				var name = {
					name: req.session.user.name
				}
				User.update(name, data, function(err, newUser) {
					if(err) {
						console.log('数据库操作失败');
						return res.redirect('back');
					}
					Post.updateFace(name, data, function(err) {
						if(err) {
							console.log('修改文章库头像操作失败');
							return res.redirect('back');
						}
						Tourist.updateFace(name, data, function(err) {
							if(err) {
								console.log('修改游客库头像操作失败');
								return res.redirect('back');
							}
							Friend.updateFace(name, data, function(err) {
								if(err) {
									console.log('修改游客库头像操作失败');
									return res.redirect('back');
								}
								Message.updateFace(name, data, function(err) {
									if(err) {
										console.log('修改游客库头像操作失败');
										return res.redirect('back');
									}
									Comment.updateFace(name, data, function(err) {
									if(err) {
										console.log('修改游客库头像操作失败');
										return res.redirect('back');
									}
									req.session.user = newUser;
									req.flash('success', '<script type="text/javascript"> alert("恭喜您！头像修改成功");</script>');
									res.redirect('back');
									
								})
									
								})
							})

						})

					})

				})

			}
		}
	});
});

router.get('/archive/:name/:time', function(req, res) {
	var sort = req.query.sort;
	var page = req.query.p ? parseInt(req.query.p) : 1;
	var visitor = null;
	if(req.session.user && req.session.user.name != req.params.name) {
		visitor = req.session.user;
	}
	User.get(req.params.name, function(err, user) {
		if(!user) {
			req.flash('error', '用户不存在 !');
			return res.redirect('/');
		}
		var age = Basic['getAge'](user.birth);
		if(req.session.user && req.session.user.name != req.params.name) {
			var date = new Date();
			var time = {
				date: date,
				day: (date.getMonth() + 1) + "月" + date.getDate() + "日"
			}
			visitor = {
				parent_id: user._id,
				name: req.session.user.name,
				head: req.session.user.head,
				time: time
			};
			Tourist.getOne(visitor, function(err, tour) {
				if(err) {
					console.log('数据库读取失败');
				}
				if(!tour) {
					newTourist = new Tourist(visitor);
					newTourist.save(function(err) {
						if(err) {
							return res.redirect('back');
						}
					});
				}
			});
		};

		Tourist.getNum(user._id, function(err, tours) {
			if(err) {
				return res.redirect('back');
			}
			Post.getNum(null, sort, req.params.name, req.params.time, page, 8, function(err, posts, post_all) {
				if(err) {
					posts = [];
					console.log('读取错误');
				};
				Post.getArchive(req.params.name, function(err, archives) {
					if(err) {
						Archives = [];
						console.log('读取错误');
					}
					Post.getTypes(req.params.name, function(arr) {
						res.render('archive', {
							age:age,
							types: arr,
							login_user: req.session.user,
							user: user,
							posts: posts,
							post_all: post_all,
							page_all: Math.ceil(post_all / 8),
							page: page,
							isFirstPage: (page - 1) == 0,
							isLastPage: ((page - 1) * 8 + posts.length) == post_all,
							sort: sort,
							archives: archives,
							tours: tours,
							title:'文章存档',
							success: req.flash('success').toString(),
							error: req.flash('error').toString()
						});
					});
				});
			});
		});
	});
});

router.get('/search', function(req, res, next) {
	var sort = req.query.sort;
	//判断是否是第一页，并把请求的页数转换成number类型
	var page = req.query.p ? parseInt(req.query.p) : 1;

	//查询并返回第page页的 5篇文章
	Post.search(req.query.keyword, page, 5, function(err, posts, post_all) {
		if(err) {
			posts = [];
			console.log('读取错误');
		}
		if(!posts.length) {
			req.flash('error', '<script>alert("很遗憾！没找到相关帖子")</script>');
			return res.redirect('back');
		}
		var flag = false;
		if(req.session.user) {
			flag = req.session.user;
		} else {
			flag = false;
		}
		User.getNum(1, 9, function(err, users, user_total) {
			if(err) {
				users = [];
				console.log('读取错误');
			}

			Post.getRec(function(err, posts_r, oragin_total) {
				if(err) {
					postRec = [];
					console.log('读取错误');
				}
				var postRec = [];
				if(oragin_total <= 8) {
					postRec = posts_r;
				} else {
					while(true) {
						var random = Basic['getRadom'](0, oragin_total);
						if(postRec.indexOf(posts_r[random]) == -1) {
							postRec.push(posts_r[random]);
						}
						if(postRec.length == 8) {
							break;
						};
					}
				}

				res.render('search', {
					headPage: 1,
					users: users,
					user_total: user_total,
					login_user: flag,
					posts: posts,
					postRec: postRec,
					post_all: post_all,
					page_all: Math.ceil(post_all / 5),
					page: page,
					isFirstPage: (page - 1) == 0,
					isLastPage: ((page - 1) * 5 + posts.length) == post_all,
					sort: "time",
					title:'搜索页-'+req.query.keyword,
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});

			});

		});
	});

});

router.get('/u/:name/:id', function(req, res) {
	var visitor = null;
	var page = req.query.p ? parseInt(req.query.p) : 1;
	if(req.session.user && req.session.user.name != req.params.name) {
		visitor = req.session.user;
	}
	User.get(req.params.name, function(err, user) {
		if(err) {
			req.flash('error', err);
			return res.redirect('/');
		};

		var age = Basic['getAge'](user.birth);
		if(req.session.user && req.session.user.name != req.params.name) {
			var date = new Date();
			var time = {
				date: date,
				day: (date.getMonth() + 1) + "月" + date.getDate() + "日"
			}
			visitor = {
				parent_id: user._id,
				name: req.session.user.name,
				head: req.session.user.head,
				time: time
			};
			Tourist.getOne(visitor, function(err, tour) {
				if(err) {
					console.log('数据库读取失败');
				}
				if(!tour) {
					newTourist = new Tourist(visitor);
					newTourist.save(function(err) {
						if(err) {
							return res.redirect('back');
						}
					});
				}
			});
		};

		Tourist.getNum(user._id, function(err, tours) {
			if(err) {
				return res.redirect('back');
			}
			Post.getOne(req.params.id, function(err, post) {
				if(err) {
					console.log(err);
					return res.redirect('/');
				} else if(!post) {
					return res.render("404");
				}
				Post.getTypes(req.params.name, function(arr) {
					Post.getArchive(req.params.name, function(err, archives) {
						if(err) {
							archives = [];
							console.log('读取错误');
						}
						Comment.getNum(req.params.id, page, 5, function(err, comments, comments_total) {
							if(err) {
								console.log(err);
								return res.redirect('/');
							}
							console.log(comments_total + '4444');
							res.render('article', {
								age: age,
								types: arr,
								archives: archives,
								tours: tours,
								post: post,
								login_user: req.session.user,
								user: user,
								comments: comments,
								comments_total: comments_total,
								page_all: Math.ceil(comments_total / 5),
								page: page,
								title:'帖子详情',
								success: req.flash('success').toString(),
								error: req.flash('error').toString()
							});
						});
					});
				});
			});
		});
	});
});
router.post('/u/:name/:id', function(req, res) {
	if(req.session.user) {
		var date = new Date(),
			time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
			date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
		if(req.body.reply_name) {
			var reply_comment = {
				name: req.session.user.name,
				head: req.session.user.head,
				content: req.body.reply_comm,
				reply_name: req.body.reply_name,
				time: time
			}
			Comment.update(req.body.reply_id, reply_comment, function(err) {
				if(err) {
					console.log('数据库操作失败!');
					return res.redirect('back');
				}
				res.redirect('back');
			})

		} else {
			var comm = {
				article_id: req.params.id,
				name: req.session.user.name,
				head: req.session.user.head,
				content: req.body.comm,
				time: time
			};
			comment = new Comment(comm);

			comment.save(function(err) {
				if(err) {
					console.log(err);
				}
				res.redirect('back');
			});
		};
	} else {
		req.flash('error', '<script type="text/javascript"> alert("请先登录！");</script>');
		res.redirect('back');
	}

});

router.get('/comment/:id', function(req, res) {
	var data = {
		id: req.params.id
	};
	Comment.remove(data, function(err) {
		if(err) {
			return res.redirect('back');
		}
		res.redirect('back');
	});
});
router.get('/comment/:id/:name/:reply_name/:time', function(req, res) {
	var data = {
		id: req.params.id,
		name: req.params.name,
		reply_name: req.params.reply_name,
		time: req.params.time,
	};

	Comment.remove(data, function(err) {
		if(err) {
			return res.redirect('back');
		}
		res.redirect('back');
	});
});

router.get('/edit/:name/:day/:title',checkLogin);
router.get('/edit/:name/:id', function(req, res) {
	User.get(req.params.name, function(err, user) {
		if(!user) {
			req.flash('error', '用户不存在 !');
			return res.redirect('/');
		}
		var age = Basic['getAge'](user.birth);
	Tourist.getNum(user._id, function(err, tours) {
		if(err) {
			return res.redirect('back');
		}
		Post.edit(req.params.id, function(err, post) {
			if(err) {
				req.flash('error', err);
				return res.redirect('back');
			}

			Post.getTypes(req.params.name, function(arr) {
				Post.getArchive(req.params.name, function(err, archives) {
					if(err) {
						Archives = [];
						console.log('读取错误');
					}
					res.render('edit', {
						age:age,
						types: arr,
						archives: archives,
						tours: tours,
						post: post,
						login_user: user,
						user: user,
						title:'修改文章',
						success: req.flash('success').toString(),
						error: req.flash('error').toString()
					});
				});
			});
		});
		});
	});
});

router.post('/edit/:name/:id',checkLogin);
router.post('/edit/:name/:id', function(req, res) {
	var currentUser = req.session.user;
	var newpost = {
		post: req.body.post,
		title: req.body.title,
		type: req.body.type
	}

	Post.update(req.params.id, newpost, function(err) {
		var url = '/u/' + req.params.name + '/' + req.params.id;
		url = encodeURI(url);
		if(err) {
			req.flash('error', err);
			return res.redirect(url); //出错！ 返回文章页
		}
		req.flash('success', '修改成功！');
		res.redirect(url); //成功！ 返回文章页
	});
});


//router.get('/remove/:name/:id',checkLogin);
router.get('/remove/:name/:id', function(req, res) {
	Post.remove(req.params.id, function(err) {
		if(err) {
			req.flash('error', err);
			return res.redirect('back');
		}
		Comment.delete(req.params.id, function(err) {
			if(err) {
				req.flash('error', err);
				return res.redirect('back');
			}
			//req.flash('success','删除成功！');
			res.redirect('/');
		})

	});
});

router.get('/reprint/:name/:id', checkLogin);
router.get('/reprint/:name/:id', function(req, res) {
	Post.edit(req.params.id, function(err, post) {
		if(err) {
			req.flash('error', err);
			return res.redirect(back);
		}

		var currentUser = req.session.user,
			reprint_from = {
				id: post._id,
				name: post.name,
				day: post.time.day,
				title: post.title
			},
			reprint_to = {
				name: currentUser.name,
				head: currentUser.head
			};
		Post.reprint(reprint_from, reprint_to, function(err, post) {

			if(err) {
				console.log(err);
				req.flash('error', err);
				return res.redirect('back');
			}
			req.flash('success', '转载成功！');
			var url = '/u/' + post.name + '/' + post._id;
			url = encodeURI(url);
			//跳转到转载后的文章页面
			res.redirect(url);
		});
	});
});

router.get('/person/:name', checkLogin);
router.get('/person/:name', function(req, res, next) {
	User.get(req.params.name, function(err, user) {
		if(!user) {
			req.flash('error', '用户不存在 !');
			return res.redirect('/');
		}
		age= Basic['getAge'](user.birth);
	Post.getNum(null, null, req.params.name, null, 1, 5, function(err, posts, post_all) {
		if(err) {
			posts = [];
			console.log('读取错误');
		};
		Message.getNoreadNum(req.params.name, function(err, noread_num) {
			if(err) {
				console.log('读取错误');
			};
			Friend.getApplyNum(req.params.name, function(err, apply_num) {
				if(err) {
					console.log('读取错误');
				};

				res.render('person', {
					login_user: req.session.user,
					age: age,
					post_all: post_all,
					noread_num: noread_num,
					apply_num: apply_num,
					title:'我的资料',
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});

			});
		});
	});

	});
});
router.get('/person/:name/modify', checkLogin);
router.get('/person/:name/modify', function(req, res, next) {
	Post.getNum(null, null, req.params.name, null, 1, 5, function(err, posts, post_all) {
		if(err) {
			posts = [];
			console.log('读取错误');
		};
		Message.getNoreadNum(req.params.name, function(err, noread_num) {
			if(err) {
				console.log('读取错误');
			};
			Friend.getApplyNum(req.params.name, function(err, apply_num) {
				if(err) {
					console.log('读取错误');
				};
				res.render('person_modify', {
					login_user: req.session.user,
					post_all: post_all,
					noread_num: noread_num,
					apply_num: apply_num,
					title:'修改资料',
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});

			});
		});

	});
});

//修改个人资料
router.post('/person/:name/modify', checkLogin);
router.post('/person/:name/modify', function(req, res) {
	var code= req.body.code;
	if(code!=Code || Code==''){
		req.flash('error', '<script type="text/javascript"> alert("验证码不正确!");</script>');
		return res.redirect('back'); //返回注册页
	}
	var username = {
		name: req.session.user.name
	};
	var newuser = {
		name: req.body.username,
		email: req.body.email,
		birth: req.body.birth,
		sex: req.body.sex,
		phone: req.body.phone
	};
	var newpost = {
		name: req.body.username
	}
	//检查用户信息是否与其他用户信息重复
	User.isName(newuser.name, function(err, users) {
		if(users.length == 1 && users[0].name != req.session.user.name) {
			req.flash('error', '<script type="text/javascript"> alert("用户已存在！");</script>');
			return res.redirect('back');
		}
		User.isEmail(newuser.email, function(err, users) {
			if(users.length == 1 && users[0].email != req.session.user.email) {
				req.flash('error', '<script type="text/javascript"> alert("邮箱已被占用,请使用其他邮箱！");</script>');
				return res.redirect('back');
			}
			User.isPhone(newuser.phone, function(err, users) {
				if(users.length == 1 && users[0].phone != req.session.user.phone) {
					req.flash('error', '<script type="text/javascript"> alert("手机号已被占用,请使用其他手机号！");</script>');
					return res.redirect('back');
				}
				User.update(username, newuser, function(err, user) {
					if(err) {
						
						res.redirect('back');
					}
					req.session.user = user; //用户信息存入session
					Post.updateInfo(username, newuser, function(err) {
						if(err) {
							
							res.redirect('back');
						}
						Tourist.updateName(username, newuser, function(err) {
							if(err) {
								
								res.redirect('back');
							}
							Comment.updateInfo(username, newuser, function(err) {
								if(err) {
									console.log('修改用户评论数据失败！');
									console.log(err);
									res.redirect('back');
								}
								Message.update(username, newuser, function(err) {
									if(err) {
										console.log('修改短信数据失败！');
										console.log(err);
										res.redirect('back');
									}
									Friend.updateInfo(username, newuser, function(err) {
										if(err) {
											console.log('修改朋友数据失败！');
											console.log(err);
											res.redirect('back');
										}
										Code=null;
										req.flash('success', '<script type="text/javascript"> alert("恭喜您，修改资料成功！");</script>');
										var url = '/person/' + req.session.user.name;
										url = encodeURI(url);
										res.redirect(url);
									})

								})

							})

						})

					})

				})
			})
		})
	})

});

router.get('/person/:name/change_face', checkLogin);
router.get('/person/:name/change_face', function(req, res, next) {
	Post.getNum(null, null, req.params.name, null, 1, 5, function(err, posts, post_all) {
		if(err) {
			posts = [];
			console.log('读取错误');
		};
		Message.getNoreadNum(req.params.name, function(err, noread_num) {
			if(err) {
				console.log('读取错误');
			};
			Friend.getApplyNum(req.params.name, function(err, apply_num) {
				if(err) {
					console.log('读取错误');
				};
				res.render('change_face', {
					login_user: req.session.user,
					post_all: post_all,
					noread_num: noread_num,
					apply_num: apply_num,
					title:'修改头像',
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});

			});
		});

	});
});

router.post('/message', checkLogin);
router.post('/message', function(req, res, next) {
	var mess = {
		re_name: req.body.re_name,
		title: req.body.title,
		content: req.body.content,
		send_name: req.session.user.name,
		send_head: req.session.user.head,
		state: 0
	}
	message = new Message(mess);
	message.save(function(err) {
		if(err) {
			//req.flash('error',err);
			return res.redirect('back');
		}
		//req.flash('success','发布成功！');
		console.log('发送成功');
		res.redirect('back');
	});
});

router.get('/person/:name/inbox', checkLogin);
router.get('/person/:name/inbox', function(req, res, next) {
	var page = req.query.p ? parseInt(req.query.p) : 1;
	Message.getNum(req.params.name, "inbox", page, 8, function(err, messages, message_all) {
		if(err) {
			messages = [];
			console.log('读取错误');
		};
		Message.getNoreadNum(req.params.name, function(err, noread_num) {
			if(err) {
				console.log('读取错误');
			};
			Friend.getApplyNum(req.params.name, function(err, apply_num) {
				if(err) {
					console.log('读取错误');
				};
				res.render('inbox', {
					login_user: req.session.user,
					message_all: message_all,
					page_all: Math.ceil(message_all / 8),
					page: page,
					isFirstPage: (page - 1) == 0,
					isLastPage: ((page - 1) * 8 + messages.length) == message_all,
					messages: messages,
					noread_num: noread_num,
					apply_num: apply_num,
					title:'收件箱',
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			});

		});

	});
});

router.get('/person/:name/outbox', checkLogin);
router.get('/person/:name/outbox', function(req, res, next) {
	var page = req.query.p ? parseInt(req.query.p) : 1;
	Message.getNum(req.params.name, "outbox", page, 8, function(err, messages, message_all) {
		if(err) {
			messages = [];
			console.log('读取错误');
		};
		Message.getNoreadNum(req.params.name, function(err, noread_num) {
			if(err) {
				console.log('读取错误');
			};
			Friend.getApplyNum(req.params.name, function(err, apply_num) {
				if(err) {
					console.log('读取错误');
				};
				res.render('outbox', {
					login_user: req.session.user,
					message_all: message_all,
					page_all: Math.ceil(message_all / 8),
					page: page,
					isFirstPage: (page - 1) == 0,
					isLastPage: ((page - 1) * 8 + messages.length) == message_all,
					messages: messages,
					noread_num: noread_num,
					apply_num: apply_num,
					title:'发件箱',
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			});
		});
	});
});

router.get('/message_detail/:id', checkLogin);
router.get('/message_detail/:id', function(req, res, next) {
	Message.getOne(req.params.id, req.session.user.name, function(err, message) {
		if(err) {
			return res.redirect('back');
			console.log('读取错误');
		};
		Message.getNoreadNum(req.session.user.name, function(err, noread_num) {
			if(err) {
				console.log('读取错误');
			};
			Friend.getApplyNum(req.session.user.name, function(err, apply_num) {
				if(err) {
					console.log('读取错误');
				};
				res.render('message_detail', {
					login_user: req.session.user,
					message: message,
					noread_num: noread_num,
					apply_num: apply_num,
					title:'短信详情',
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			});
		});
	});
});

router.post('/message_detail/:id', checkLogin);
router.post('/message_detail/:id', function(req, res, next) {
	var mess = {
		re_name: req.body.re_name,
		title: req.body.title,
		content: req.body.content,
		send_name: req.session.user.name,
		send_head: req.session.user.head,
		state: 0
	}
	message = new Message(mess);
	message.save(function(err) {
		if(err) {
			//req.flash('error',err);
			return res.redirect('back');
		}
		//req.flash('success','发布成功！');
		console.log('发送成功');
		res.redirect('back');
	});
});

router.get('/remove_message/:id', checkLogin);
router.get('/remove_message/:id', function(req, res, next) {
	Message.remove(req.params.id, req.session.user.name, function(err) {
		if(err) {
			console.log('数据库操作有误');
			res.redirect('back');
		}
		res.redirect('back');
	});
});

router.post('/remove/message', checkLogin);
router.post('/remove/message', function(req, res, next) {
	Message.remove(req.body.id, req.session.user.name, function(err) {
		if(err) {
			console.log('数据库操作有误');
			res.redirect('back');
		}
		res.redirect('back');
	});
});

router.get('/person/:name/friend', checkLogin);
router.get('/person/:name/friend', function(req, res, next) {
	var page = req.query.p ? parseInt(req.query.p) : 1;
	Friend.getNum(req.params.name, 1, page, 15, function(err, friends, friend_all) {
		
		Message.getNoreadNum(req.params.name, function(err, noread_num) {
			if(err) {
				console.log('读取错误');
			};
			Friend.getApplyNum(req.params.name, function(err, apply_num) {
				if(err) {
					console.log('读取错误');
				};
				res.render('friend', {
					login_user: req.session.user,
					friend_all: friend_all,
					page_all: Math.ceil(friend_all / 15),
					page: page,
					isFirstPage: (page - 1) == 0,
					isLastPage: ((page - 1) * 15 + friends.length) == friend_all,
					friends: friends,
					noread_num: noread_num,
					apply_num: apply_num,
					title:'我的好友',
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			});
		});
	})
});
router.post('/friend', checkLogin);
router.post('/friend', function(req, res, next) {
	var apply = {
		re_name: req.body.re_name,
		re_head: req.body.re_head,
		re_sex: req.body.re_sex,
		re_birth: req.body.re_birth,
		content: req.body.content,
		send_name: req.session.user.name,
		send_head: req.session.user.head,
		send_sex: req.session.user.sex,
		send_birth: req.session.user.birth,
		state: 0
	}
	Friend.getOne(apply.re_name, apply.send_name, function(err, value) {
		if(value) {
			if(value.state == 0 && value.re_name == apply.re_name) {
				console.log('您已申请过对方为好友,请等待对方回应！');
				return res.redirect('back');
			} else if(value.state == 0 && value.re_name == apply.send_name) {
				console.log('对方已申请您为好友,请到个人中心进行操作！');
				return res.redirect('back');
			} else if(value.state == 1) {
				console.log('你们已经是好友了,不用再进行申请！');
				return res.redirect('back');
			}
		} else {
			friend = new Friend(apply);
			friend.save(function(err) {
				if(err) {
					//req.flash('error',err);
					return res.redirect('back');
				}
				//req.flash('success','发布成功！');
				console.log('发送成功');
				res.redirect('back');
			});
		}
	});
});

router.get('/person/:name/friend_apply', checkLogin);
router.get('/person/:name/friend_apply', function(req, res, next) {
	var page = req.query.p ? parseInt(req.query.p) : 1;
	Friend.getNum(req.params.name, 0, null, null, function(err, friends, total) {
		friends.forEach(function(friend, index) {
			friend.send_birth = Basic['getAge'](friend.send_birth);
		})
		Message.getNoreadNum(req.params.name, function(err, noread_num) {
			if(err) {
				console.log('读取错误');
			};
			Friend.getApplyNum(req.params.name, function(err, apply_num) {
				if(err) {
					console.log('读取错误');
				};
				res.render('friend_apply', {
					login_user: req.session.user,
					friends: friends,
					noread_num: noread_num,
					apply_num: apply_num,
					title:'好友申请',
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			});
		});
	})
});

router.get('/friend/:id/agree', checkLogin);
router.get('/friend/:id/agree', function(req, res, next) {
	Friend.update(req.params.id, function(err) {
		if(err) {
			return res.redirect('back');
		}

		res.redirect('/person/' + req.session.user.name + '/friend');
	})
});

router.get('/friend/:id/remove', checkLogin);
router.get('/friend/:id/remove', function(req, res, next) {
	Friend.remove(req.params.id, function(err) {
		if(err) {
			console.log('数据库操作失败！');
			return res.redirect('back');
		}

		res.redirect('back');
	})
});

router.get('/person/:name/post_list', checkLogin);
router.get('/person/:name/post_list', function(req, res, next) {
	var page = req.query.p ? parseInt(req.query.p) : 1;
	Post.getNum(null, null, req.params.name, null, page, 8, function(err, posts, post_all) {
		if(err) {
			console.log('数据库读取错误!');
			posts = [];
		}
		Message.getNoreadNum(req.params.name, function(err, noread_num) {
			if(err) {
				console.log('读取错误');
			};
			Friend.getApplyNum(req.params.name, function(err, apply_num) {
				if(err) {
					console.log('读取错误');
				};
				res.render('post_list', {
					login_user: req.session.user,
					posts: posts,
					post_all: post_all,
					page_all: Math.ceil(post_all / 8),
					page: page,
					isFirstPage: (page - 1) == 0,
					isLastPage: ((page - 1) * 8 + posts.length) == post_all,
					noread_num: noread_num,
					apply_num: apply_num,
					title:'帖子列表',
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			});
		});
	})

});

router.use(function(req, res) {
	res.render("404");
});

function checkLogin(req, res, next) {
	if(!req.session.user) {
		req.flash('error', '请先登录!');
		res.redirect('/login');
	}
	next();
}

function checkNotLogin(req, res, next) {
	if(req.session.user) {
		req.flash('error', '已登录!');
		res.redirect('back');
	}
	next();
}
module.exports = router;