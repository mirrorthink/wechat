var express = require('express');
var crypto = require('crypto');
var router = express.Router();
//xml解析模块
var XMLJS = require('xml2js');
//解析，将xml解析为json
var parser = new XMLJS.Parser();
//重组，将json重组为xml
var builder = new XMLJS.Builder();
var token = "systemtest"; //此处与微信绑定一致
const mongoose = require('mongoose');
const UserModel = mongoose.model('User');
var myWechatapi = require('../common/myWechatapi');
//微信接口配置信息
router.get('/', function (req, res, next) {

    var signature = req.query.signature;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    var echostr = req.query.echostr;

    /*  加密/校验流程如下： */
    //1. 将token、timestamp、nonce三个参数进行字典序排序
    var array = new Array(token, timestamp, nonce);
    array.sort();
    var str = array.toString().replace(/,/g, "");

    //2. 将三个参数字符串拼接成一个字符串进行sha1加密
    var sha1Code = crypto.createHash("sha1");
    var code = sha1Code.update(str, 'utf-8').digest("hex");

    //3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    if (code === signature) {
        res.send(echostr)
    } else {
        res.send("error");
    }
});


//微信事件推送的入口
router.post('/', function (req, res, next) {
    //获取参数
    var signature = req.query.signature;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    var echostr = req.query.echostr;

    /*  加密/校验流程如下： */
    //1. 将token、timestamp、nonce三个参数进行字典序排序
    var array = new Array(token, timestamp, nonce);
    array.sort();
    var str = array.toString().replace(/,/g, "");

    //2. 将三个参数字符串拼接成一个字符串进行sha1加密
    var sha1Code = crypto.createHash("sha1");
    var code = sha1Code.update(str, 'utf-8').digest("hex");

    //3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    if (code === signature) {

        //获取xml数据
        req.on("data", function (data) {
            //将xml解析
            parser.parseString(data.toString(), function (err, result) {
                var body = result.xml;
                var messageType = body.MsgType[0];

                //用户点击菜单响应事件
                if (messageType === 'event') {
                    var eventName = body.Event[0];
                    (EventFunction[eventName] || function () { })(body, req, res);
                    //自动回复消息
                } else if (messageType === 'text') {
                    EventFunction.responseNews(body, req, res);
                    //第一次填写URL时确认接口是否有效
                } else {
                    res.send(echostr);
                }
            });
        });
    } else {
        //认证失败，非法操作
        res.send("Bad Token!");
        console.log("Bad Token!")
    }
});
//微信客户端各类回调用接口
var EventFunction = {
    //关注
    subscribe: function (body, req, res) {

        var xml = {
            xml: {
                ToUserName: body.FromUserName,
                FromUserName: body.ToUserName,
                CreateTime: + new Date(),
                MsgType: 'text',
                Content: '你好!感谢关注,立即绑定账户,获取金额、积分变动最新消息,随时随地查询金额、积分'
            }
        };

        xml = builder.buildObject(xml);//发送给微信
        res.send(xml);

    },
    //注销
    unsubscribe: function (openid, req, res) {
        //删除对应id
    },
    //打开某个网页
    VIEW: function (body, req, res) {
        //根据需求，处理不同的业务
        // console.log(body)
        // res.redirect("/pages/home");
    },
    //自动回复
    responseNews: function (body, req, res) {
        //组装微信需要的json
        var xml = {
            xml: {
                ToUserName: body.FromUserName,
                FromUserName: body.ToUserName,
                CreateTime: + new Date(),
                MsgType: 'text',
                Content: '编辑@+您想说的话，我们可以收到'
            }
        };
        var reciviMessage = body.Content[0]
        if (/^\@.*/.test(reciviMessage)) {
            xml.xml.Content = '已经收到您的建议，会及时处理！'
        } //将json转为xml
        xml = builder.buildObject(xml);//发送给微信
        res.send(xml);
    },
    CLICK: function (body, req, res) {
        console.log('CLICK')
        if (body.EventKey[0] == 'check') {
            console.log('check')
            res.send('success')
            UserModel.findOne({ openid: body.FromUserName[0] }, function (err, person) {
                if (person) {
                    myWechatapi.sendTemplateMessage(person.name,body.FromUserName[0], person.changeMoney, person.totalMoney,person.lastModifyTime)
                } else {
                    myWechatapi.sendTemplateMessage('',body.FromUserName[0], 0, 0,'')
                }

            })
        } else if (body.EventKey[0] == 'off') {

            UserModel.remove({ openid: body.FromUserName[0] }, function (err, person) {
                console.log(body.FromUserName[0])
                if (err) {
                    console.log(err);
                    return;
                }
                res.send('success')
            })
        }
    }
}




module.exports = router;







