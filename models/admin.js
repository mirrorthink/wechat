const mongoose = require('mongoose');
var crypto = require('crypto');

var config = require('../config/config');
var content = config.password;//加密的明文；


var AdminSchema = new mongoose.Schema({
  name: String,
  phoneNumber: Number,
  idNumber: String,
  password: String,
  regTime: { type: Date, default: Date.now },

});
//AdminSchema.set('toJSON', { getters: true});

AdminSchema.statics.ifNameExit = function (name, cb) {
  return this.model('Admin').findOne({ name: name }, cb);
}
AdminSchema.statics.createWithEncryption = function (data, cb) {
   
  var password =require('crypto').createHash('md5').update(data.password).digest('hex');
  return this.model('Admin').create({ name: data.name, password: password }, cb);
}


AdminSchema.statics.checkout = function (data, cb) {
var md5 = crypto.createHash('md5');
  md5.update(content);
  var password =require('crypto').createHash('md5').update(data.password).digest('hex');
  var data = { name: data.name, password: password };
  this.model('Admin').findOne(data, cb)
}


mongoose.model('Admin', AdminSchema);






