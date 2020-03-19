const crypto = require("crypto");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const bodyParser = require("body-parser");
// var mysql = require('mysql');
// var dbConfig = require('./dbconfig');
// var conn = mysql.createConnection(dbOptions);
// conn.connect();

module.exports = function(app) {
  app.use(
    session({
      secret: "!@#$%^&*",
      // store: new MySQLStore(dbOptions),
      resave: false,
      saveUninitialized: false
    })
  );

  app.use(bodyParser.json()); // to support JSON-encoded bodies
  app.use(
    bodyParser.urlencoded({
      // to support URL-encoded bodies
      extended: true
    })
  );

  app.get("/", function(req, res) {
	  res.redirect("/welcome");
    //if (!req.session.name) res.redirect("/login");
    res.render("index");
  });

   app.get("/welcome", function(req, res) {
    //if (!req.session.name) return res.redirect("/login");
    //else res.render("welcome", { name: req.session.name });
  //	res.redirect("/welcome");
       res.render("welcome", { message: "input your id and password." });
    });
	
  app.get("/login", function(req, res) {
    //if (!req.session.name)
    //  res.render("login", { message: "input your id and password." });
    //else res.redirect("/welcome");
	res.render("login");
  });
  
  app.get("/signup", function(req, res) {
    //if (!req.session.name) return res.redirect("/login");
    //else res.render("signup.html", { name: req.session.name });
	res.render("signup", { message: "input your id and password." });
  });
  
   app.get("/indexlogin", function(req, res) {
    //if (!req.session.name) return res.redirect("/login");
    //else res.render("signup.html", { name: req.session.name });
	res.render("indexlogin", { message: "input your id and password." });
  });
  
 
 app.get("/index", function(req, res) {
    //if (!req.session.name) return res.redirect("/login");
    //else res.render("signup.html", { name: req.session.name });
	res.render("index", { message: "input your id and password." });
  });
  
  app.get("/registersupplier", function(req, res) {
    //if (!req.session.name) return res.redirect("/login");
    //else res.render("signup.html", { name: req.session.name });
	res.render("[rgis]supplier", { message: "input your id and password." });
  });
  app.get("/registerseller", function(req, res) {
    //if (!req.session.name) return res.redirect("/login");
    //else res.render("signup.html", { name: req.session.name });
	res.render("[rgis]seller", { message: "input your id and password." });
  });
  app.get("/registerdis", function(req, res) {
    //if (!req.session.name) return res.redirect("/login");
    //else res.render("signup.html", { name: req.session.name });
	res.render("[rgis]distributor", { message: "input your id and password." });
  });
  app.get("/dislist", function(req, res) {
    //if (!req.session.name) return res.redirect("/login");
    //else res.render("signup.html", { name: req.session.name });
	res.render("[mask]distributorlist", { message: "input your id and password." });
  });
  app.get("/sellerlist", function(req, res) {
    //if (!req.session.name) return res.redirect("/login");
    //else res.render("signup.html", { name: req.session.name });
	res.render("[mask]sellerlist", { message: "input your id and password." });
  });
  app.get("/supplierlist", function(req, res) {
    //if (!req.session.name) return res.redirect("/login");
    //else res.render("signup.html", { name: req.session.name });
	res.render("[mask]supplierlist", { message: "input your id and password." });
  });
   app.get("/policy_notice", function(req, res) {
    //if (!req.session.name) return res.redirect("/login");
    //else res.render("signup.html", { name: req.session.name });
	res.render("policy_notice", { message: "input your id and password." });
  });
   app.get("/policy_notice_login", function(req, res) {
    //if (!req.session.name) return res.redirect("/login");
    //else res.render("signup.html", { name: req.session.name });
	res.render("policy_notice_login", { message: "input your id and password." });
  });
   app.get("/sellerdetail", function(req, res) {
    //if (!req.session.name) return res.redirect("/login");
    //else res.render("signup.html", { name: req.session.name });
	res.render("sellerlist_detail", { message: "input your id and password." });
  });
  app.get("/supplierdetail", function(req, res) {
    //if (!req.session.name) return res.redirect("/login");
    //else res.render("signup.html", { name: req.session.name });
	res.render("supplier_detail", { message: "input your id and password." });
  });
   app.get("/disdetail", function(req, res) {
    //if (!req.session.name) return res.redirect("/login");
    //else res.render("signup.html", { name: req.session.name });
	res.render("distributor_detail", { message: "input your id and password." });
  });

  app.get("/logout", function(req, res) {
    req.session.destroy(function(err) {
      res.redirect("/");
    });
  });

  app.post("/login", function(req, res) {
    let id = req.body.userid;
    let password = req.body.password;

    let salt = "";
    let pw = "";

    crypto.randomBytes(64, (err, buf) => {
      if (err) throw err;
      salt = buf.toString("hex");
    });

    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) throw err;
      pw = derivedKey.toString("hex");
    });

    // var user = results[0];
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", function(
      err,
      derivedKey
    ) {
      if (err) console.log(err);
      if (derivedKey.toString("hex") === pw) {
        req.session.name = id;
        req.session.save(function() {
          return res.redirect("/welcome");
        });
      } else {
        return res.render("login", { message: "please check your password." });
      }
    }); //pbkdf2
  }); // end of app.post

  // app.post('/login', function (req, res) {
  // var id = req.body.userid;
  // var pw = req.body.password;
  // var sql = 'SELECT * FROM user WHERE id=?';
  // conn.query(sql, [id], function (err, results) {
  // if (err)
  // console.log(err);

  // if (!results[0])
  // return res.render('login', { message: 'please check your id.' });

  // var user = results[0];
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
};
