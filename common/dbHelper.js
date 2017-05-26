var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var async = require('async');
const LogErrorModel = mongoose.model('LogError');
var pageQuery = function (page, pageSize, Model, populate, queryParams, sortParams, callback) {
    var start = (page - 1) * pageSize;
    var $page = {
        pageNumber: page
    };
    async.parallel({
        count: function (done) {  // 查询数量
            Model.count(queryParams).exec(function (err, count) {
                done(err, count);
            });
        },
        records: function (done) {   // 查询一页的记录
            Model.find(queryParams[0], queryParams[1]).skip(start).limit(pageSize).populate(populate).sort(sortParams).lean().exec(function (err, doc) {
                done(err, doc);
            });
        }
    }, function (err, results) {
        var count = results.count;
        $page.pageCount =Math.ceil( count / pageSize);
        $page.results = results.records;
        callback(err, $page);
    });
};
var addBackendErrorLog = function (err) {
    var data = { 'type': 'backEnd', error: err };
    LogErrorModel.create(data, function (err, doc) {
        if (doc) {
            console.log(doc)
        }
    })
}

module.exports = {
    pageQuery: pageQuery,
    addBackendErrorLog: addBackendErrorLog,
};