const crypto = require("crypto");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require("body-parser");
let mysql = require("mysql");
let dbConfig = require("../dbconfig");

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
    if (!req.session.name) res.redirect("/login");
    else res.redirect("/welcome");
  });

  app.get("/login", function(req, res) {
    if (!req.session.name)
      res.render("login", { message: "input your id and password." });
    else res.redirect("/welcome");
  });

  app.get("/welcome", function(req, res) {
    if (!req.session.name) return res.redirect("/login");
    else res.render("welcome", { name: req.session.name });
  });

  app.get("/signup", function(req, res) {
    if (!req.session.name) res.render("signup", { message: "join this." });
    else res.redirect("/welcome");
  });

  app.get("/logout", function(req, res) {
    req.session.destroy(function(err) {
      res.redirect("/");
    });
  });

  app.post("/login", function(req, res, next) {
    const userid = req.body["useremail"];
    const userpassword = req.body["userpw"];

    let salt = "";
    let pw = "";

    // let id = req.body.username;
    // let pw = req.body.password;
    let sql = "SELECT * FROM kshield.users WHERE useremail=? and userpw=?";
    conn.query(sql, [userid, userpassword], function(err, rows, fields) {
      // conn.end();
      if (err) {
        console.log("query error:" + err);
        res.send(err);
      } else {
        console.log(userid);
        console.log(userpassword);
        if (rows[0] != undefined) {
          res.send(
            "userid(email):" +
              rows[0]["useremail"] +
              "<br>" +
              "userpw:" +
              rows[0]["userpassword"]
          );
        } else {
          res.send("no data");
        }
        // let result =
        //   "rows:" +
        //   JSON.stringify(rows) +
        //   "<br><br>" +
        //   "fields:" +
        //   JSON.stringify(fields);
        // res.send(result);
      }

      crypto.randomBytes(64, (err, buf) => {
        if (err) throw err;
        salt = buf.toString("hex");
      });

      crypto.pbkdf2Sync(
        userpassword,
        salt,
        100000,
        64,
        "sha512",
        (err, derivedKey) => {
          if (err) throw err;
          pw = derivedKey.toString("hex");
        }
      );
      // if (!fields[0])
      //   return res.render("login", { message: "please check your id." });

      // let user = results[0];
      crypto.pbkdf2Sync(userpassword, salt, 100000, 64, "sha512", function(
        err,
        derivedKey
      ) {
        if (err) console.log(err);

        if (derivedKey.toString("hex") === userpassword) {
          req.session.name = userid;
          req.session.save(function() {
            return res.redirect("/welcome");
          });
        } else {
          return res.render("login", {
            message: "please check your password."
          });
        }
      }); //pbkdf2
    }); // query
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
};
