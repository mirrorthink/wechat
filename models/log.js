const mongoose = require('mongoose');

var LogSchema = new mongoose.Schema({
  name: String,
  admin:String,
  modifyTime: { type: Date, default: Date.now },
  type: String,
  detail:String,
});

mongoose.model('Log', LogSchema);