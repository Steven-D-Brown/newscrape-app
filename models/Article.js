var mongoose = require("mongoose");
var Schema = mongoose.Schema;


var ArticleSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  link: {
    type: String,
    required: true,
    unique: true,
    match: /^https:\/\/www\.cnn\.com.+/
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;