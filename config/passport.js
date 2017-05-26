const mongoose = require('mongoose');
//const User = mongoose.model('User');
const AdminModel = mongoose.model('Admin');
const local = require('./local');


module.exports = function (passport) {

  // serialize sessions
  passport.serializeUser((user, cb) => cb(null, user.id));
  passport.deserializeUser((id, cb) => AdminModel.load({ criteria: { _id: id } }, cb));

  // use these strategies
  passport.use(local);
};
