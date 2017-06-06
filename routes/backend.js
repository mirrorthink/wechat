var express = require('express');
var router = express.Router();
//数据库模型
const mongoose = require('mongoose');
const UserModel = mongoose.model('User');
const AdminModel = mongoose.model('Admin');
const LogModel = mongoose.model('Log');
const LogErrorModel = mongoose.model('LogError');
var uuid = require('uuid');
var querystring = require('querystring');
var util = require('util');
var dbHelper = require('../common/dbHelper');
var utils = require('../common/utils');
var config = require('../config/config');
var WechatAPI = require('wechat-api');
var api = new WechatAPI(config.wechat.appID, config.wechat.appSecret);

var myWechatapi = require('../common/myWechatapi');




router.get('/personinfo', function (req, res, next) {


  var querydata = [{}, { name: true, openid: true, phoneNumber: true, idNumber: true, wechatNumber: true, totalMoney: true, changeMoney: true, lastModifyTime: true }]
  var page = req.query.page || 1;

  dbHelper.pageQuery(page, 10, UserModel, '', querydata, {
    regTime: 'desc'
  }, function (error, $page) {
    if (error) {
      next(error);
    } else {
      var state = {
        "records": $page.results,
        "pageCount": $page.pageCount
      }
      return res.json(state)
    }
  });
})
router.get('/admininfo', function (req, res, next) {
  console.log(req.session.logged_in)
  //方法一

  var querydata = [{}, { name: true, phoneNumber: true, idNumber: true, regTime: true }]
  var page = req.query.page || 1;
  dbHelper.pageQuery(page, 10, AdminModel, '', querydata, {
    regTime: 'desc'
  }, function (error, $page) {
    if (error) {
      next(error);
    } else {
      var state = {
        "records": $page.results,
        "pageCount": $page.pageCount
      }
      return res.json(state)
    }
  });
})

router.post('/reg', function (req, res, next) {
  var postjson = JSON.parse(req.body.data)
  var data = { name: postjson.name, password: postjson.password };
  //用户名是否已注册
  AdminModel.ifNameExit(postjson.name, function (err, person) {
    if (person) {
      var state = { 'state': "alredyeite" };
      res.send(JSON.stringify(state));
    } else {
      AdminModel.createWithEncryption(data, function (err, doc) {
        if (err) {
          dbHelper.addBackendErrorLog(err);
        }
        if (doc) {
          var state = { 'state': "success" };
          return res.json(state)
        }
      })
    }
  })
});

router.post('/login', function (req, res, next) {
  req.session.logged_in = true;
  var postjson = JSON.parse(req.body.data);
  var data = { name: postjson.name, password: postjson.password };
  AdminModel.checkout(data, function (err, person) {
    if (err) {
      dbHelper.addBackendErrorLog(err);
    }
    if (person) {
      res.setHeader('Set-Cookie', 'username=' + postjson.name + ';max-age=0');
      req.session.logged_in = true;
      req.session.save();
      console.log(req.session)
      var state = { 'state': "success", 'name': postjson.name };
      return res.json(state)
    } else {
      var state = { 'state': "false" };
      return res.json(state)
    }
  })
});

router.post('/modifyUser', function (req, res, next) {
  var postjson = JSON.parse(req.body.data);

  var data = { changeMoney: postjson.changeMoney, totalMoney: postjson.totalMoney, lastModifyTime: new Date() };
  UserModel.where({ name: postjson.name }).update(data, function (err, doc) {
    if (err) {
      dbHelper.addBackendErrorLog(err);
    }
    if (doc.n > 0) {
      console.log()
      var state = { 'state': "success" };
      //name, openid, changeMoney, totalMoney,lastModifyTime
      myWechatapi.sendTemplateMessage(postjson.name, postjson.openid, postjson.changeMoney, postjson.totalMoney, new Date())
      return res.json(state)
    }
  })
});
//
router.post('/modifyadministrator', function (req, res, next) {
  var postjson = JSON.parse(req.body.data);
  var data = { phoneNumber: postjson.phoneNumber, idNumber: postjson.idNumber };
  AdminModel.where({ name: postjson.name }).update(data, function (err, doc) {
    if (err) {
      dbHelper.addBackendErrorLog(err);
    }
    if (doc.nModified > 0) {
      var state = { 'state': "success" };
      return res.json(state)
    }
  })
});
router.get('/deleteAdmin', function (req, res, next) {
  var id = req.query._id;
  AdminModel.findByIdAndRemove(id, function (err, doc) {
    if (err) {
      dbHelper.addBackendErrorLog(err);
    }
    if (doc) {
      var state = { 'state': "success" };
      return res.json(state)
    }
  })
})
router.get('/deleteUser', function (req, res, next) {
  var id = req.query._id;
  UserModel.findByIdAndRemove(id, function (err, doc) {
    if (err) {
      dbHelper.addBackendErrorLog(err);
    }
    if (doc) {
      var state = { 'state': "success" };
      return res.json(state);
    }
  })
})
router.post('/addLog', function (req, res, next) {

  var postjson = JSON.parse(req.body.data);


  LogModel.create(postjson, function (err, doc) {
    if (err) {
      dbHelper.addBackendErrorLog(err);
    }
    if (doc) {
      var state = { 'state': "success" };
      return res.json(state)
    }
  });
});
router.get('/loginfo', function (req, res, next) {
  //方法一

  var querydata = [{}, { name: true, admin: true, modifyTime: true, type: true, detail: true }]
  var page = req.query.page || 1;

  dbHelper.pageQuery(page, 10, LogModel, '', querydata, {
    modifyTime: 'desc'
  }, function (error, $page) {
    if (error) {
      dbHelper.addBackendErrorLog(err);
    } else {
      var state = {
        "records": $page.results,
        "pageCount": $page.pageCount
      }
      return res.json(state)
    }
  });
})
router.get('/search', function (req, res, next) {
  var search = req.query.search;
  var type
  search.length == 11 ? (type = 'phoneNumber') : (type = 'name');
  type == 'phoneNumber' ? (search = Number(search)) : (search = search);

  // console.log(type)
  if (type == 'phoneNumber') {
    UserModel.findOne({ phoneNumber: search }, function (err, person) {

      if (err) {
        dbHelper.addBackendErrorLog(err);
      } else {
        if (person) {
          var state = {
            'state': "success",
            'person': person,
          };
          return res.json(state)
        } else {
          var state = {
            'state': "false",
          };
          return res.json(state)
        }
      }
    });
  } else {
    UserModel.findOne({ name: search }, function (err, person) {
 
      if (err) {
        dbHelper.addBackendErrorLog(err);
      } else {
        if (person) {
          var state = {
            'state': "success",
            'person': person,
          };
          return res.json(state)
        } else {
          var state = {
            'state': "false",
          };
          return res.json(state)
        }
      }
    });
  }

})
router.get('/searchAdmin', function (req, res, next) {
  var search = req.query.search;
  var type;
  AdminModel.findOne({ name: search }, function (err, person) {
    if (err) {
      dbHelper.addBackendErrorLog(err);
    } else {
      return res.json(person);
    }
  });
})

router.get('/JsConfig', function (req, res, next) {

  //TODO:change
  var param = {
    debug: false,
    jsApiList: ['playVoice', 'pauseVoice','stopVoice','onVoicePlayEnd'],
    url: config.wechat.Website
  };
  api.getJsConfig(param, function (err, result) {
    if (err) {
      dbHelper.addBackendErrorLog(err);
    }
    if (result) {
      return res.json(result);
    }
  });
})

router.post('/upload', function (req, res) {
  let upload = utils.upload();
  upload(req, res, function (err) {
    if (err) {
      return res.end(err.toString());
    }
    utils.handdlexlsxFile(req.file, req, res)
  });
});

//TODO: CHANGE
router.get('/logError', function (req, res, next) {
  var err = req.query.err;
  var data = { type: 'fontEnd', error: err };
  LogErrorModel.create(data, function (err, doc) {
    if (err) {
      dbHelper.addBackendErrorLog(err);
    }
    if (doc) {
      var state = { 'state': "success" };
      return res.json(state);
    }
  })
})

module.exports = router;

