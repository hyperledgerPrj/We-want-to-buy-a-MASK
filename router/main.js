const crypto = require('crypto');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
let mysql = require('mysql');
let dbConfig = require('../dbconfig');
let conn = mysql.createConnection(dbConfig);

// db connection
conn.connect(function(err) {
  if (err) {
    return console.error('error: ' + err.message);
  }
 
  console.log('Connected to the MySQL server.');
});

module.exports = function (app) {
  app.use(session({
    secret: '!@#$%^&*',
    store: new MySQLStore(dbConfig),
    resave: false,
    saveUninitialized: false
  }));

  app.use(bodyParser.json());       // to support JSON-encoded bodies
  app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  }));

  app.get('/', function (req, res) {
    if (!req.session.name)
      res.redirect('/login');
    else
      res.redirect('/welcome');
  });

  app.get('/login', function (req, res) {
    if (!req.session.name)
      res.render('login', { message: 'input your id and password.' });
    else
      res.redirect('/welcome');
  });

  app.get('/welcome', function (req, res) {
    if (!req.session.name)
      return res.redirect('/login');
    else
      res.render('welcome', { name: req.session.name });
  });

  app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
      res.redirect('/');
    });
  });

  app.post('/login', function (req, res) {
    const id = req.body.username;
    const password = req.body.password;

    let salt = '';
    let pw = '';


//  let id = req.body.username;
  let pw = req.body.password;
  let sql = 'SELECT * FROM user WHERE email=?';
  conn.query(sql, [email], function (err, results) {
  
  if (err)
   console.log(err);
   })


    crypto.randomBytes(64, (err, buf) => {
      if (err) throw err;
      salt = buf.toString('hex');
    });

    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) throw err;
      pw = derivedKey.toString('hex');
    });

    // let user = results[0];
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', function (err, derivedKey) {
      if (err)
        console.log(err);
      if (derivedKey.toString('hex') === pw) {
        req.session.name = id;
        req.session.save(function () {
          return res.redirect('/welcome');
        });
      }
      else {
        return res.render('login', { message: 'please check your password.' });
      }
    });//pbkdf2
  }); // end of app.post

  // app.post('/login', function (req, res) {
  // let id = req.body.username;
  // let pw = req.body.password;
  // let sql = 'SELECT * FROM user WHERE id=?';
  // conn.query(sql, [id], function (err, results) {
  // if (err)
  // console.log(err);

  // if (!results[0])
  // return res.render('login', { message: 'please check your id.' });

  // let user = results[0];
  // crypto.pbkdf2(pw, user.salt, 100000, 64, 'sha512', function (err, derivedKey) {
  // if (err)
  // console.log(err);
  // if (derivedKey.toString('hex') === user.password) {
  // req.session.name = user.name;
  // req.session.save(function () {
  // return res.redirect('/welcome');
  // });
  // }
  // else {
  // return res.render('login', { message: 'please check your password.' });
  // }
  // });//pbkdf2
  // });//query
  // });
}
