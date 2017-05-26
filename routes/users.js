//微信端展示页面
var utils = require('../common/utils');
var express = require('express');

var router = express.Router();
var querystring = require('querystring');
var request = require('request');
var config = require('../config/config');
//var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var url = require('url');
var AppID = config.wechat.appID;
var AppSecret = config.wechat.appSecret;

var async = require('async');
var WechatAPI = require('wechat-api');
var api = new WechatAPI(config.wechat.appID, config.wechat.appSecret);

const mongoose = require('mongoose');
const UserModel = mongoose.model('User');
const LogModel = mongoose.model('Log');
const LogErrorModel = mongoose.model('LogError');
var dbHelper = require('../common/dbHelper');
//网页授权获取openid步骤一
router.get('/', function (req, res, next) {
  var return_uri = config.wechat.Website + 'users/get_wx_access_token'
  var scope = 'snsapi_userinfo';
  console.log(return_uri)
  res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + AppID + '&redirect_uri=' + return_uri + '&response_type=code&scope=' + scope + '&state=STATE#wechat_redirect');
});
//保存全局变量
var Thisopenid = "";

//网页授权获取openid步骤二
router.get('/get_wx_access_token', function (req, res, next) {
  
  // 通过code换取网页授权access_token
  var code = req.query.code;
  async.waterfall([
    function (cb) {
      request.get(
        {
          url: 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + AppID + '&secret=' + AppSecret + '&code=' + code + '&grant_type=authorization_code',
        }, function (error, response, body) {
          if (error) {
            cb(error)
          }
          cb(null, response, body)
        }
      )
    },
    function (response, body, cb) {


      if (response.statusCode == 200) {
        var data = JSON.parse(body);
        Thisopenid = data.openid;

        cb(null, Thisopenid, data.access_token)
      } else {
      }
    },
    function (openId, token, cb) {

      let reqUrl = 'https://api.weixin.qq.com/sns/userinfo?';
      let params = {
        access_token: token,
        openid: openId,
        lang: 'zh_CN'
      };
      let options = {
        method: 'get',
        url: reqUrl + querystring.stringify(params)
      };
      request(options, function (err, res, body) {
        if (res) {
          cb(null, body);
        } else {
          cb(err);
        }
      })


    }
  ], function (err, data) {

    let result = JSON.parse(data);
   // console.log(result)
    if (result) {
      res.render('index', { "name": result.nickname, "headimgurl": result.headimgurl, "openid": result.openid,'url':config.ajaxurl });
    }
    if (err) {
      console.log(err)
    }

  });


});



router.get('/bind', function handle(req, res, next) {
  var params = url.parse(req.url, true).query;
  var name = params.name;
  var phoneNumber = params.phone;

  var openid = params.openid;
  var headimgurl = params.headimgurl;
  var MDragon = { name: name, openid: openid, phoneNumber: phoneNumber,headimgurl:headimgurl };
  if (openid) {
    UserModel.ifOpenidExit(openid, function (err, person) {
      //正式时使用
      if (person) {

        res.send('alreadyexit');
        // res.send('<h1 style="font-size:50px; margin-top:40vh;text-align:center;">你的账号已被使用</h1>');
      } else {
        UserModel.findOne({ name: name }, function (err, person) {
          if (err) {
            dbHelper.addBackendErrorLog(err);
          } else {
            if (person) {
              console.log(person)
              res.send('nameBeused');
            } else {
              UserModel.create(MDragon, function (err, success) {
                if (err) {
                  dbHelper.addBackendErrorLog(err);
                } else {
                  res.send('success');
                }
              });
            }
          }
        });
      }
    })
  }else{
     res.send('wechatneed');
  }

})
router.get('/detail', function handle(req, res, next) {
  var openid = url.parse(req.url, true).query.openid;
  UserModel.findOne({ openid: openid }, function (err, person) {
  //  LogModel.find({ name: person.name }).sort({ 'modifyTime': -1 }).limit(1).exec(function (err, log) {
    console.log(person)
      if (err) {
        dbHelper.addBackendErrorLog(err);
        return;
      } else {
        if (person) {
          res.render('layout', {"name":person.name, "changeMoney": person.changeMoney, "totalMoney": person.totalMoney, 'headimgurl':person.headimgurl});
        } else {
          res.render('layout', { "name":'', "changeMoney": 0, "totalMoney": 0, 'headimgurl':'' });
        
       }
      }
   // })
  })
});

function renderLogin(req, res, next) {
  fs.readFile('./public/users/login.html', function (err, contents) {
    if (err) {
      // helpers.send_failure(res, helpers.http_code_for_error(err), err);
      dbHelper.addBackendErrorLog(err);
      return;
    }
    contents = contents.toString('utf8');
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(contents);
  });
}



module.exports = router;