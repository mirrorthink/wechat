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
var Thisopenid = "";

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
  res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + AppID + '&redirect_uri=' + return_uri + '&response_type=code&scope=' + scope + '&state=STATE#wechat_redirect');
});
//网页授权获取openid步骤二
router.get('/get_wx_access_token', function (req, res, next) {
  // 通过code换取网页授权access_token
  var code = req.query.code;
  request.get(
    {
      url: 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + AppID + '&secret=' + AppSecret + '&code=' + code + '&grant_type=authorization_code',
    },
    function (error, response, body) {
      if (response.statusCode == 200) {
        var data = JSON.parse(body);
        Thisopenid = data.openid;
        

        // res.redirect(config.wechat.Website + "users/login")
        renderLogin(req, res, next)
      } else {
        console.log(response.statusCode);
      }
    }
  );
});


router.get('/bind', function handle(req, res, next) {
  var params = url.parse(req.url, true).query;
  var name = params.name;
  var phoneNumber = params.phoneNumber;

  var idNumber = params.idNumber;
  var MDragon = { name: name, openid: Thisopenid, phoneNumber: phoneNumber, idNumber: idNumber };
  UserModel.ifOpenidExit(Thisopenid, function (err, person) {
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
})
router.get('/detail', function handle(req, res, next) {

  // dbHelper.addBackendErrorLog('测试错误记录');

  var openid = url.parse(req.url, true).query.openid;
  UserModel.findOne({ openid: openid }, function (err, person) {
    LogModel.find({ name: person.name }).sort({ 'modifyTime': -1 }).limit(1).exec(function (err, log) {
      if (err) {
        dbHelper.addBackendErrorLog(err);
        return;
      } else {
        if (log.length == 0) {
          res.render('layout', { "name": person.name, "money": person.money, "fund": person.fund, "time": ' 无', "detail": '无信息' });
        } else {

          res.render('layout', { "name": person.name, "money": person.money, "fund": person.fund, "time": utils.getDate(log[0].modifyTime), "detail": log[0].detail });
        }
      }
    })
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
function getUserInfo(AccessToken, openId) {
  let reqUrl = 'https://api.weixin.qq.com/sns/userinfo?';
  let params = {
    access_token: AccessToken,
    openid: openId,
    lang: 'zh_CN'
  };

  let options = {
    method: 'get',
    url: reqUrl + querystring.stringify(params)
  };

  return new Promise((resolve, reject) => {
    request(options, function (err, res, body) {
      if (res) {
        resolve(body);
      } else {
        reject(err);
      }
    });
  })
}



module.exports = router;