let express = require("express");
let app = express();
let ejs = require("ejs");
const session = require("express-session");
let loginRouter = require("./router/main")(app);
// let mysqlDB = require("./mysql-db");
// mysqlDB.connect();

let port = 3000;
let hostname = "localhost";

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
app.use(express.static("public"));
// app.use("/login", loginRouter);

var server = app.listen(port, function() {
  console.log(`
        Server is running at http://${hostname}:${port}/ 
        Server hostname ${hostname} is listening on port ${port}!
    `);
});
