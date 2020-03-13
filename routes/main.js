const express = require("express");
const router = express.Router();

// Get Home page
// router.get("/", (req, res, next) => res.render("Main.html"));

router.get("/", (req, res, next) =>
  res.render("Main.html", { title: "We want By a Mask" })
);
// router.get("/Login", (req, res) => res.render("Login.html", { page: "Login" }));
// router.get("/SignUp", (req, res) => res.render("signup", { page: "SignUp" }));

module.exports = router;
