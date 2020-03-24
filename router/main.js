const crypto = require("crypto");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require("body-parser");
let mysql = require("mysql");
let dbConfig = require("../dbconfig");
// let pool = mysql.createPool(dbConfig, {
//   connectionLimit: 10
// });

// db connection
let conn = mysql.createConnection(dbConfig);
conn.connect(function(err) {
  if (err) {
    return console.error("error: " + err.message);
  }

  console.log("Connected to the MySQL server.");
});

module.exports = function(app) {
  app.use(
    session({
      secret: "!@#$%^&*",
      store: new MySQLStore(dbConfig),
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

  app.get("/", function(req, res, next) {
    if (!req.session.name) res.redirect("/index");
    else res.redirect("/login");
  });

  app.get("/index", (req, res, next) => {
    res.render("index", { session: req.session });
  });

  app.get("/indexlogin", (req, res, next) => {
    res.render("indexlogin", { name: req.session.name });
  });

  app.get("/manufacturerlist", (req, res, next) => {
    res.render("manufacturerlist", { name: req.session.name });
  });

  app.get("/sellerlist", (req, res, next) => {
    res.render("sellerlist", { name: req.session.name });
  });

  app.get("/distributorlist", (req, res, next) => {
    res.render("distributorlist", { name: req.session.name });
  });

  // policy
  app.get("/policy_notice", (req, res, next) => {
    res.render("policy_notice", { name: req.session.name });
  });

  // policy
  app.get("/policy_notice_login", (req, res, next) => {
    res.render("policy_notice_login", { name: req.session.name });
  });

  // register
  app.get("/rgmanufacturer", (req, res, next) => {
    res.render("rgmanufacturer", { name: req.session.name });
  });

  app.get("/rgseller", (req, res, next) => {
    res.render("rgseller", { name: req.session.name });
  });

  app.get("/rgdistributor", (req, res, next) => {
    res.render("rgdistributor", { name: req.session.name });
  });

  app.get("/login", function(req, res) {
    // if (!req.session.name)
    // if (!req.session.logined)
    res.render("login", {
      session: req.session
      // async: true
    });
    // else res.redirect("/welcome");
  });

  app.get("/welcome", function(req, res) {
    if (!req.session.name) return res.redirect("/login");
    else res.render("welcome", { name: req.session.name });
  });

  app.get("/signup", function(req, res, next) {
    // if (!req.session.name) return res.redirect("/signup");
    // else
    res.render("signup", { name: req.session.name });
  });

  app.get("/logout", function(req, res) {
    req.session.destroy(function(err) {
      res.redirect("/");
    });
  });

  app.post("/login", function(req, res, next) {
    const useremail = req.body["useremail"]; // body-parser
    const userpw = req.body["userpw"];

    let salt = "";
    let pw = "";

    // let id = req.body.username;
    // let pw = req.body.password;
    let sql = "SELECT * FROM kshield.users WHERE useremail=? and userpw=?";
    conn.query(sql, [useremail, userpw], function(err, results, fields) {
      if (!err) {
        if (results.length > 0) {
          if (results[0].userpw == userpw)
            // res.send(
            //   { code: 200, success: "login successfull" }
            // "useremail:" +
            //   results[0]["useremail"] +
            //   "<br>" +
            //   "userpw:" +
            //   results[0]["userpw"]
            return res.redirect("/indexlogin");
        } else {
          res.send({ code: 400, failed: "no data, error occurred" });
        }
      } else {
        console.log("query error:" + err);
        res.send(err);
      }
      // let result =
      //   "rows:" +
      //   JSON.stringify(rows) +
      //   "<br><br>" +
      //   "fields:" +
      //   JSON.stringify(fields);
      // res.send(result);

      crypto.randomBytes(64, (err, buf) => {
        if (err) throw err;
        salt = buf.toString("hex");
      });

      crypto.pbkdf2(userpw, salt, 100000, 64, "sha512", (err, derivedKey) => {
        if (err) throw err;
        pw = derivedKey.toString("hex");
      });
      // if (!fields[0])
      //   return res.render("login", { message: "please check your id." });

      // let user = results[0];
      crypto.pbkdf2(userpw, salt, 100000, 64, "sha512", function(
        err,
        derivedKey
      ) {
        if (err) console.log(err);

        if (derivedKey.toString("hex") === userpw) {
          req.session.logined = true;
          req.session.name = useremail;
          req.session.save(function() {
            return res.redirect("/indexlogin");
          });
        } else {
          return res.render("login", {
            session: req.session,
            message: "please check your password"
          });
        }
      }); //pbkdf2
    }); // query
  }); // end of app.post

  app.post("/signup", (req, res, next) => {
    let useremail = req.body["useremail"];
    let userpw = req.body["userpw"];
    let userpwRe = req.body["userpwRe"];
    let usergroup = req.body["usergroup"];

    //console.log("req", req.body);
    let today = new Date();

    let users = {
      useremail: req.body.useremail,
      userpw: req.body.userpw,
      usergroup: req.body.usergroup,
      created_at: today,
      updated_at: today
    };

    if (userpw == userpwRe) {
      // let newobj = [useremail, userpw, usergroup, created_at, updated_at];
      let sql = "INSERT INTO kshield.users SET ?";
      conn.query(sql, users, function(err, results, fields) {
        if (!err) {
          console.log("The rows is:", results);
          // res.send({ code: 200, success: "user registered sucessfully" });
          res.redirect("login");
        } else {
          res.send("query err:" + err);
        }
      }); //end of query
    } else {
      res.send("password not match!");
    }
  }); // end of app.post('/signup')

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
};
