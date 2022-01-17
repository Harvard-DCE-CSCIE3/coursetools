require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
var bodyparser = require('body-parser');
const logger = require('morgan');
const helmet = require('helmet');
const caccl = require('caccl-api');
const sendRequest = require('caccl-send-request');
//const apiFwd = require('caccl-api-forwarder');
var users = require('./routes/users');
const crypto = require('./util/Crypto');
const randomstring = require('randomstring');

const config = {
    apiForwardPathPrefix: '/canvas',
    defaultNumRetries: 5,
}
//const initAuthorization = require('caccl-authorizer');

var indexRouter = require('./routes/index');
var credentialRouter = require('./routes/credentials');
var usersRouter = require('./routes/users');

var app = express();
app.use(helmet());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'PUT, POST, GET, DELETE, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.setHeader('Access-Control-Request-Headers', '*');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.use(session({
  secret: randomstring.generate(48),
  saveUninitialized: true,
  cookie: { secure: false },
  resave: true,
  secure: true,
  httpOnly: true,
  name: 'sessionId'
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next)=>{
  req.config = config;
  next();
});

app.use((req, res, next)=>{
  if (req.session.api){
    req.api = new caccl({
      canvasHost: crypto.decrypt(req.session.canvasHost),
      accessToken: crypto.decrypt(req.session.accessToken),
    });
  }
  next();
});

// the following comes from caccl-forwarder - I needed to include it here in the
// request chain so that session properties were available to it
app.all(`${config.apiForwardPathPrefix}*`, async (req, res, next)=>{
  const host = crypto.decrypt(req.session.canvasHost) || 'canvas.instructure.com';
  const isGET = (req.method === 'GET');
  const data = (isGET ? req.query : req.body);

  // Get path
  const path = req.path.substring(config.apiForwardPathPrefix.length);
  const numRetries = (config.numRetries !== undefined ? config.numRetries : 3);

  // Add an access token (if not already included)
  if (!data.access_token) {
    data.access_token = crypto.decrypt(req.session.accessToken) || config.accessToken;
  }

  // Attempt to send the request to Canvas

  try {
    // Send the request
    const response = await sendRequest({
      host,
      path,
      numRetries,
      method: req.method,
      params: data,
      // Ignore self-signed certificate if host is simulated Canvas
      ignoreSSLIssues: (host === 'localhost:8088'),
    });

    // Set status
    res.status(response.status);

    // Send link header
    res.header('Access-Control-Expose-Headers', 'Link');
    res.set('Link', response.headers.link);

    // Send request
    return res.json(response.body);
  } catch (err) {
    return (
      res
        .status(500)
        .send(`We encountered an error while attempting to contact Canvas and forward an API request: ${err.message}`)
    );
  }
});


app.use('/credentials', credentialRouter);
app.get('/config', (req, res, next) => {
  return res.json({canvasHost: crypto.decrypt(req.session.canvasHost)});
});
app.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});
app.use('/coursetools', express.static(__dirname + '/client/coursetools/build/'));
app.use('/coursetools*', express.static(__dirname + '/client/coursetools/build/index.html'));
app.use('/static', express.static(__dirname + '/client/coursetools/build/static/'));
app.use('/', indexRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
