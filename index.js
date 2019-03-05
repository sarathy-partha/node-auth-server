const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const app = express()
const router = require('./routes/router')
const mongoose = require('mongoose')
const config = require('./config/keys')
const cors = require('cors')
const winston = require('./middleware/logger')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const expressSession = require('express-session')
const methodOverride = require('method-override')
// db setup

mongoose.connect(
  config.mongoConnectionString,
  { useNewUrlParser: true }
)

app.use(expressSession({ secret: 'keyboard cat', resave: true, saveUninitialized: false }))
// App Setup
app.use(morgan('combined', { stream: winston.stream }))
app.use(methodOverride())
app.use(cors())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json()) // parse application/json
app.use(passport.initialize())
app.use(passport.session())
router(app)

// Server Setup

const port = process.env.PORT || 3000
const server = http.createServer(app)
server.listen(port)
console.info('Server running on: ' + port)
