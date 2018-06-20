const Authentication = require('../controllers/authentication')
const passportService = require('../services/passport') // eslint-disable-line no-unused-vars
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', { session: false })
const requireSignin = passport.authenticate('local', { session: false })
const logger = require('../middleware/logger')
const config = require('../config/config')

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}

module.exports = function(app) {
  app.get('/', function(req, res) {
    res.send({ user: req.user })
  })
  app.post('/signin', requireSignin, Authentication.signin)
  app.post('/signup', Authentication.signup)

  // validate requests using passed token
  app.get('/validate', requireAuth, function(req, res) {
    res.send({ message: 'Here is your secret code....husshh its secured' })
  })
  // Azure AD Auth routes

  app.get('/account', ensureAuthenticated, function(req, res) {
    res.send({ user: req.user })
  })

  app.get(
    '/login',
    function(req, res, next) {
      passport.authenticate('azuread-openidconnect', {
        response: res, // required
        resourceURL: config.resourceURL, // optional. Provide a value if you want to specify the resource.
        customState: 'some_state', // optional. Provide a value if you want to provide custom state value.
        failureRedirect: '/',
        session: true
      })(req, res, next)
    },
    function(req, res) {
      logger.info('Login was called in the Sample')
      res.redirect('/')
    }
  )

  app.get('/logout', function(req, res) {
    req.session.destroy(function() {
      req.logOut()
      res.redirect(config.destroySessionUrl)
    })
  })

  // GET /auth/openid/return
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request. If authentication fails, the user is redirected back to the
  //   sign-in page. Otherwise, the primary route function is called,
  //   which, in this example, redirects the user to the home page.
  app.get(
    '/auth/openid/return',
    function(req, res, next) {
      passport.authenticate('azuread-openidconnect', {
        response: res, // required
        failureRedirect: '/',
        session: true
      })(req, res, next)
    },
    function(req, res) {
      logger.info('We received a return from AzureAD.')
      res.redirect('/')
    }
  )

  // POST /auth/openid/return
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request. If authentication fails, the user is redirected back to the
  //   sign-in page. Otherwise, the primary route function is called,
  //   which, in this example, redirects the user to the home page.
  app.post(
    '/auth/openid/return',
    function(req, res, next) {
      passport.authenticate('azuread-openidconnect', {
        response: res, // required
        failureRedirect: '/'
      })(req, res, next)
    },
    function(req, res) {
      logger.info('We received a return from AzureAD.')
      res.redirect('/')
    }
  )
}
