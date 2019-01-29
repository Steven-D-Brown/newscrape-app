//need to fix issue with find method
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");

var axios = require("axios");
var cheerio = require("cheerio");
var app = express();
app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

var db = require("./models");
var mongoDB = mongoose.connection;

mongoDB.on("error", function(err){
  console.log("Mongoose error: ", err);
});

mongoDB.once("open", ()=>{
  console.log("Mongoose connection successful.");
});

var PORT = 3000;

var app = express();

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);

app.get("/", function (req, res) {
  //no article summaries readily available
  axios.get("https://www.cnn.com/").then(function (response) {
    var $ = cheerio.load(response.data);

    $("strong").each(function (index, element) {
      let insert = {};
      insert.link = "https://www.cnn.com" + $(this).parent().parent().attr("href");
      insert.title = $(this).text;

      db.Article.create(insert).then(function (dbArticle) {
        console.log(dbArticle);
      }).catch(function (err) {
        console.log(err);
      });
    });

    $("span.cd__headline-text").each(function (i, ele) {
      let insert = {};
      insert.link = "https://www.cnn.com" + $(this).parent().attr("href");
      insert.title = $(this).text();

      db.Article.create(insert).then(function (dbArticle) {
        console.log(dbArticle);
      }).catch(function (err) {
        console.log(err);
      });
    });
  });
  res.send("Scrape Complete");
});

app.get("/articles", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.get("/articles/:id", function (req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.post("/articles/:id", function (req, res) {
  db.Note.create(req.body)
    .then(function (dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});