var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser')
var config = require('./config/config');
//路由文件
//测试用
var index = require('./routes/index');
//微信用户相关
var users = require('./routes/users');
//微信直接相关
var wechat = require('./routes/wechat');
//处理前端请求
var backend = require('./routes/backend');

var app = express();



var session = require('express-session');
var cookieParser = require('cookie-parser');
var MongoStore = require('connect-mongo')(session);
//
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', config.AllowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

if (process.env.NODE_ENV == 'dev') {
  app.use(logger('dev'));
}


app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
/*
app.use(cookieSession({ 
	secret: "FLUFFY BUNNIES",
    maxAge: 86400000
}));*/

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))
/*
app.use(session({
  secret: '12345',
  name: 'testapp',
  cookie: { maxAge: 80000 },
  resave: true,
    rolling: true,
  saveUninitialized: true,
  store: new MongoStore({   //创建新的mongodb数据库
    host: 'localhost',    //数据库的地址，本机的话就是127.0.0.1，也可以是网络主机
    port: 27017,          //数据库的端口号
    db: config.db,
    url: 'mongodb://localhost:27017/demo'       //数据库的名称。
  })
}));*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//////////



////

//中间件顺序很重要
 app.get('/awesome', function(req, res){
     
  
         console.log('Last page was: ' + req.session.lastPage + ".");    
       
     req.session.lastPage = '/awesome';
     res.send("You're Awesome. And the session expired time is: " + req.session.cookie.maxAge);
 });

 app.get('/radical', function(req, res){

         console.log('Last page was: ' + req.session.lastPage + ".");    
    
    req.session.lastPage = '/radical';
    res.send('What a radical visit! And the session expired time is: ' + req.session.cookie.maxAge);
 });
 
app.use('/wechat', wechat);
app.use('/users', users);
app.use('/backend', backend);
app.use('/', index);


// catch 404 and forward to error handler 要放到最后
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


module.exports = app;
