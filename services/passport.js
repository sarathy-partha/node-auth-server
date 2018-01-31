const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

// Create local strategy
const localOptions = { usernameField: 'email' };
const localLogin = new LocalStrategy(localOptions, function (email, password, done) {
    //Verify user, call done post validating as valid or invalid
    User.findOne({ email: email }, function (err, user) {
        if (err) { return done(err) }
        if (!user) { return done(null, false) }
        //Validate password
        user.comparePassword(password, function (err, isMatch) {
            if (err) { return done(err) }
            if (!isMatch) { return done(null, false) }
            return done(null, user);
        })
    });
});

// Setup options for JWT strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.secret
};

// Create JWT strategy
const jwtLogin = new JwtStrategy(jwtOptions, function (payload, done) {
    // User ID is valid, if so call done with user object, 
    // else call done without any user object
    User.findById(payload.sub, function (err, user) {
        if (err) { return done(err, false) }
        if (user) {
            return done(null, user);
        } else {
            done(null, false);
        }
    });
});

// Get Passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin);
