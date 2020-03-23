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
    else res.redirect("/indexlogin");
  });

  app.get("/login", function(req, res) {
    if (!req.session.name)
      res.render("login", {
        message: "input your id and password."
        // async: true
      });
    else res.redirect("/welcome");
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
    const useremail = req.body["useremail"];
    const userpw = req.body["userpw"];

    let salt = "";
    let pw = "";

    // let id = req.body.username;
    // let pw = req.body.password;
    let sql = "SELECT * FROM kshield.users WHERE useremail=? and userpw=?";
    conn.query(sql, [useremail, userpw], function(err, rows, fields) {
      if (!err) {
        if (rows[0] != undefined) {
          res.send(
            "useremail:" +
              rows[0]["useremail"] +
              "<br>" +
              "userpw:" +
              rows[0]["userpw"]
          );
        } else {
          res.send("no data");
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

      crypto.pbkdf2Sync(
        userpw,
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
      crypto.pbkdf2Sync(userpw, salt, 100000, 64, "sha512", function(
        err,
        derivedKey
      ) {
        if (err) console.log(err);

        if (derivedKey.toString("hex") === userpw) {
          req.session.name = useremail;
          req.session.save(function() {
            return res.redirect("/indexlogin");
          });
        } else {
          return res.render("login", {
            message: "please check your password."
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

    console.log(req.body);

    if (userpw == userpwRe) {
      let newmemobj = [useremail, userpw, usergroup];
      let sql =
        "INSERT INTO kshield.users (useremail, userpw, usergroup ) VALUE ?";
      conn.query(sql, newmemobj, function(err, rows, fields) {
        if (!err) {
          res.send("success");
          console.log("fields");
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
