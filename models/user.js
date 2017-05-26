const mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  name: String,
  openid: String,
  phoneNumber: Number,
  idNumber: String,
  wechatNumber: String,
  headimgurl:String,
  regTime: { type: Date,  default: Date.now },
  changeMoney: { type: Number, default: 0 },
  totalMoney: { type: Number, default: 0 },
  lastModifyTime: Date,
});
//UserSchema.set('toJSON', { getters: true});
UserSchema.statics.ifOpenidExit = function (Openid, cb) {
  return this.model('User').findOne({ openid: Openid }, cb);
}



mongoose.model('User', UserSchema);