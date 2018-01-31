const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const router = require('./router');
const mongoose = require('mongoose');
const config = require('./config');
const cors = require('cors');
// db setup

mongoose.connect(config.mongoConnectionString);

//App Setup
app.use(morgan('combined'));
app.use(cors());
app.use(bodyParser.json({ type: '*/*' }));
router(app);

//Server Setup

const port = process.env.PORT || 3090;
const server = http.createServer(app);
server.listen(port);
console.info('Server running on: ' + port);
