//文件上传
var async = require('async');
var fs = require('fs');
var xlsx = require('node-xlsx');
var multer = require('multer');
var config = require('../config/config');
var DIR = config.uploadDir;
var myWechatapi = require('../common/myWechatapi');
var mongoose = require('mongoose');
const UserModel = mongoose.model('User');
Date.prototype.Format = function (time, format) {
    var o = {
        "M+": time.getMonth() + 1, //month 
        "d+": time.getDate(), //day 
        "h+": time.getHours(), //hour 
        "m+": time.getMinutes(), //minute 
        "s+": time.getSeconds(), //second 
        "q+": Math.floor((time.getMonth() + 3) / 3), //quarter 
        "S": time.getMilliseconds() //millisecond 
    }

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (time.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}

var getDate = function (time) {
    var date = new Date();
    var currentTime = date.Format(time, "yyyy-MM-dd hh:mm:ss");
    return currentTime;
}
var upload = function () {

    let storage = multer.diskStorage({
        //设置上传后文件路径，uploads文件夹会自动创建。
        destination: function (req, file, cb) {
            cb(null, DIR)
        },
        //给上传文件重命名，获取添加后缀名
        filename: function (req, file, cb) {
            var fileFormat = (file.originalname).split(".");
            cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
        }
    });
    //添加配置文件到muler对象。

    let upload = multer({ storage: storage }).single('file');
    return upload;
}

var handdlexlsxFile = function (file, req, res) {

    const workSheetsFromFile = xlsx.parse(file.path);
    var len = workSheetsFromFile[0].data.length;

    async.parallel({
        records: function (done) {   // 查询一页的记录
            const workSheetsFromFile = xlsx.parse(file.path);
            var len = workSheetsFromFile[0].data.length;

            var count = 0;
            var flag = true;
            for (let i = 1; i < len; i++) {
                console.log('第几条' + i);

                (function (i) {
                    let name = workSheetsFromFile[0].data[i][0];
                    let totalMoney = workSheetsFromFile[0].data[i][2];



                    UserModel.findOne({ name: name }, function (err, person) {
                        if (err) {
                            dbHelper.addBackendErrorLog(err);
                        } else {
                            //return res.json(state)
                            if (person) {
                                let changeMoney = totalMoney - person.totalMoney;
                                if (changeMoney != 0) {
                                    let data = { totalMoney: totalMoney, changeMoney: changeMoney , lastModifyTime: new Date()};
                                    UserModel.update({ name: name }, data, function (err, doc) {
                                        if (doc.nModified > 0) {
                                            count = count + 1
                                            UserModel.findOne({ name: name }, function (err, person) {
                                                if (err) {
                                                } else {
                                                    if (person.openid) {
                                                        myWechatapi.sendTemplateMessage(person.name, person.openid, changeMoney, totalMoney, new Date())
                                                    }
                                                }
                                            });
                                            if (i == len - 1) {
                                                console.log('结束了' + i + '')
                                                console.log('doc.nModifiedi == len-1')
                                                let resule = {
                                                    'count': count,
                                                    'flag': flag,
                                                }
                                                done(null, resule)
                                            }
                                        } else {
                                            if (i == len - 1) {
                                                console.log('结束了' + i + '')
                                                let resule = {
                                                    'count': count,
                                                    'flag': flag,
                                                }
                                                done(null, resule)
                                            }
                                        }

                                    })
                                } else {
                                    if (i == len - 1) {
                                        console.log('结束了' + i + '')
                                        let resule = {
                                            'count': count,
                                            'flag': flag,
                                        }
                                        done(null, resule)
                                    }
                                }

                            } else {
                                console.log('第' + i + '无数据')
                                if (i == len - 1) {
                                    console.log('结束了' + i + '')
                                    console.log('elsei == len-1')
                                    let resule = {
                                        'count': count,
                                        'flag': flag,
                                    }
                                    done(null, resule)
                                }
                            }



                        }
                    });

                })(i);
            }
        }
    }, function (err, results) {
        console.log(results)
        if (err) {
            console.log(err)
        } else {
            if (results) {
                var state = {
                    'state': "success",
                    'count': results.records.count,
                };
                console.log('count'+ results.records.count)
                res.send(JSON.stringify(state));
            } else {
                var state = {
                    'state': "success",
                    'count': 0,
                };
                console.log('noresult')
                res.send(JSON.stringify(state));
            }
        }

    });

}



module.exports = {
    getDate: getDate,

    upload: upload,
    handdlexlsxFile: handdlexlsxFile,
};