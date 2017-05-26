/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
//const User = mongoose.model('User');
const AdminModel = mongoose.model('Admin');

/**
 * Expose
 */

module.exports = new LocalStrategy({
    usernameField: 'name',
    passwordField: 'password'
  },
  function (name, password, done) {
    const options = {
      criteria: { name: name },
      select: 'name  password '
    };
    AdminModelr.load(options, function (err, user) {
      if (err) return done(err);
      if (!user) {
        return done(null, false, { message: 'Unknown user' });
      }
      if (!user.authenticate(password)) {
        return done(null, false, { message: 'Invalid password' });
      }
      return done(null, user);
    });
  }
);
