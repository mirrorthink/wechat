const mongoose = require('mongoose');

var LogErrorSchema = new mongoose.Schema({
  typt: String,
  error:String,
  time:{ type: Date, default: Date.now },
});

mongoose.model('LogError', LogErrorSchema);
