const passport = require('passport')
const User = require('../models/user')
const keys = require('../config/keys')
const config = require('../config/config')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const LocalStrategy = require('passport-local')
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy
const logger = require('../middleware/logger')

// Create local strategy
const localOptions = { usernameField: 'email' }
const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
  // Verify user, call done post validating as valid or invalid
  User.findOne({ email: email }, function(err, user) {
    if (err) {
      return done(err)
    }
    if (!user) {
      return done(null, false)
    }
    // Validate password
    user.comparePassword(password, function(err, isMatch) {
      if (err) {
        return done(err)
      }
      if (!isMatch) {
        return done(null, false)
      }
      return done(null, user)
    })
  })
})

// Setup options for JWT strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: keys.secret
}

// Create JWT strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
  // User ID is valid, if so call done with user object,
  // else call done without any user object
  User.findById(payload.sub, function(err, user) {
    if (err) {
      return done(err, false)
    }
    if (user) {
      return done(null, user)
    } else {
      done(null, false)
    }
  })
})

// OIDC Strategy for Azure AD

const azureADLogin = new OIDCStrategy(
  {
    identityMetadata: config.creds.identityMetadata,
    clientID: config.creds.clientID,
    responseType: config.creds.responseType,
    responseMode: config.creds.responseMode,
    redirectUrl: config.creds.redirectUrl,
    allowHttpForRedirectUrl: config.creds.allowHttpForRedirectUrl,
    clientSecret: config.creds.clientSecret,
    validateIssuer: config.creds.validateIssuer,
    isB2C: config.creds.isB2C,
    issuer: config.creds.issuer,
    passReqToCallback: config.creds.passReqToCallback,
    scope: config.creds.scope,
    loggingLevel: config.creds.loggingLevel,
    nonceLifetime: config.creds.nonceLifetime,
    nonceMaxAmount: config.creds.nonceMaxAmount,
    useCookieInsteadOfSession: config.creds.useCookieInsteadOfSession,
    cookieEncryptionKeys: config.creds.cookieEncryptionKeys,
    clockSkew: config.creds.clockSkew
  },
  function(iss, sub, profile, accessToken, refreshToken, done) {
    if (!profile.upn) {
      return done(new Error('No email found'), null)
    }
    // asynchronous verification, for effect...
    process.nextTick(function() {
      findByEmail(profile.upn, function(err, user) {
        if (err) {
          return done(err)
        }
        if (!user) {
          // "Auto-registration"
          users.push(profile)
          return done(null, profile)
        }
        return done(null, user)
      })
    })
  }
)

// Passport session setup. (Section 2)

//   To support persistent sign-in sessions, Passport needs to be able to
//   serialize users into the session and deserialize them out of the session. Typically,
//   this is done simply by storing the user ID when serializing and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.upn)
})

passport.deserializeUser(function(id, done) {
  findByEmail(id, function(err, user) {
    done(err, user)
  })
})

// array to hold signed-in users
var users = []

var findByEmail = function(email, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i]
    logger.info('we are using user: ', user)
    if (user.upn === email) {
      return fn(null, user)
    }
  }
  return fn(null, null)
}

// Get Passport to use this strategy
passport.use(jwtLogin)
passport.use(localLogin)

// Use the OIDCStrategy within Passport. (Section 2)
//
//   Strategies in passport require a `validate` function that accepts
//   credentials (in this case, an OpenID identifier), and invokes a callback
//   with a user object.
passport.use(azureADLogin)
