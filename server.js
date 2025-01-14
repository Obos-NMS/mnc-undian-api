require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
// Create database connection and call all models
const db = require("./models");
require('module-alias/register');
const app = express();
const server = require("http").createServer(app);
global.io = require("socket.io")(server);

const port = process.env.PORT ?? 3300;

const UPLOAD_TEMP_PATH = "public/storage/uploads/temp/";
const multer = require('multer');
const upload = multer({ dest: UPLOAD_TEMP_PATH });
app.use(upload.any());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.options("*", cors());

app.use(bodyParser.json({ limit: "200mb", extended: true }));
app.use(bodyParser.text({ limit: "200mb" }));
app.use(express.static(__dirname + '/public'));
app.use(
  bodyParser.urlencoded({
    limit: "200mb",
    extended: true,
    parameterLimit: 50000,
  })
);

require("./socket/v1");
app.use("/v1", require("./routes/v1"));
app.get("/", (req, res) => res.send("Service is running"));

// jika force: true, hati-hati karena data akan di hapus semua (rollback)
// db.sequelize.sync({ alter: true, force: false }).then(function () {
db.sequelize.authenticate().then(function () {
  server.listen(port, function () {
    console.log("server is successfully running!");
  });
});