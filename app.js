var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const usuariosRouter = require('./routes/usuarios');
const loginRouter = require('./routes/login');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const validate = (req, res, next) => {
  jwt.verify(req.headers['x-access-token'], process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      res.status(400).json(err.message)
    } else {
      // add user id to request
      req.body.userId = decoded.id
      next()
    }
  })
}

app.use('/index', indexRouter);
app.use('/users', usersRouter);
app.use('/usuarios', validate, usuariosRouter);
app.use('/login', loginRouter);

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
