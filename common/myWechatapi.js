var config = require('../config/config');
var WechatAPI = require('wechat-api');
var api = new WechatAPI(config.wechat.appID, config.wechat.appSecret);
var request = require('request');
var helper = require('./helper');
var dbHelper = require('./dbHelper');
var myWechatapi = {};

var wechaturl = {
    sendTemplateMessage: `${config.wechat.prefix}message/template/send?access_token=`,
}
myWechatapi.sendTemplateMessage = function (name, openid, changeMoney, totalMoney,lastModifyTime) {
    var mess = creatMessage(name, openid, changeMoney, totalMoney,lastModifyTime);

    api.getLatestToken(function (err, token) {
        if (err) {
            // console.log(err)
        }
        if (token) {
            // console.log(token)
            var url = wechaturl.sendTemplateMessage + token.accessToken
            request({
                url: url,
                method: "POST",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: mess
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                     // console.log(response)

                }
                if (error) {
                    console.log(error);
                }
            });
        }

    });
}
function creatMessage(name, openid, changeMoney, totalMoney,lastModifyTime) {
   

   

    return {
        "touser": openid,
        "template_id": config.wechat.template_id,
        "url": config.wechat.Website + "users/detail?openid=" + openid,
        "topcolor": "#FF0000",
        "data": {
            "first": {
                "value": name+',你的本期信息如下: ',
                "color": "#173177"
            },
            "keyword1": {
                "value": helper.getDate(lastModifyTime),
                "color": "#173177"
            },
            "keyword2": {
                "value": changeMoney,
                "color": "#173177"
            },
            "keyword3": {
                "value": totalMoney,
                "color": "#173177"
            },
            'remark': {
                "value": '',
                "color": "#173177"
            }
        }
    };
}


module.exports = myWechatapi;  