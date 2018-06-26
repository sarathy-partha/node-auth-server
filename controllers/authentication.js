const User = require('../models/user')
const jwt = require('jwt-simple')
const config = require('../config/keys')

function tokenForUser(user) {
  const timestamp = new Date().getTime()
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret)
}

exports.signin = function(req, res, next) {
  // Auth complete, so provide a token
  res.send({ token: tokenForUser(req.user) })
}

exports.signup = function(req, res, next) {
  const email = req.body.email
  const password = req.body.password

  if (!email || !password) {
    return res.status(422).send({ error: 'Email and/or Password missing...' })
  }

  // Check if user exists?
  User.findOne({ email: email }, function(err, existingUser) {
    if (err) {
      return next(err)
    }

    // If exists return error
    if (existingUser) {
      return res.status(422).send({ error: 'Email is taken already, provide alternate email or signin with the same email' })
    }

    // If all good with user, create user
    const user = new User({
      email: email,
      password: password
    })

    user.save(function(err) {
      if (err) {
        return next(err)
      }
      // Respond success back
      res.json({ token: tokenForUser(user) })
    })
  })
}
