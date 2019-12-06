/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
//const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

const mongoose = require("mongoose");

//-- get the mongoose localhost connection
mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .catch(error => {
    console.log("error in connecting to mongodb");
  });

const schema = mongoose.Schema;

const bookSchema = new schema(
  {
    title: { type: String, required: true },
    comment: { type: [String], default: [] },
    commentcount: { type: Number, default: 0 }
  },
  { toObject: { retainKeyOrder: true } },
  { toJSON: { retainKeyOrder: true } }
);

const Book = mongoose.model("Book", bookSchema);

//--test the connection to database

//--test the connection to database
/* let pirate = new Book({
  title: "pirate",
  })

pirate.save(err=>{
if (err) {console.log("error")}
}) */

module.exports = function(app) {
  app
    .route("/api/books")
    .get(function(req, res) {
      Book.find({})
        .select("_id title commentcount")
        .exec((err, docs) => {
          if (err) {
            return res.send("error in finding books in library database");
          }
          if (docs) {
           // console.log(docs)
            //-- to get the order of keys in the output
            let arr = [];
            docs.forEach(val => {
              let obj = {};
              obj["_id"] = val["_id"];
              obj["title"] = val["title"];
              obj["commentcount"] = val["commentcount"];
              arr.push(obj);
            });
            return res.json(arr);
          } else {
            return res.send("no books in the library");
          }
        });
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })

    .post(function(req, res) {
      var title = req.body.title;

      if(!title){return res.send("no title provided")}
      var newBook = new Book({
        title: title
      });
      newBook.save((err, docs) => {
        if (err) {
          return res.send("error in saving data");
        }
        return res.json({
          _id: docs._id,
          comments: docs.comment,
          title: docs.title
        });
      });
      //response will contain new book object including atleast _id and title
    })

    .delete(function(req, res) {
      Book.deleteMany({}, err => {
        if (err) {
          return res.send("error in deleting documents in library database");
        }
        return res.send("complete delete successful");
      });
      //if successful response will be 'complete delete successful'
    });

  app
    .route("/api/books/:id")
    .get(function(req, res) {
      var bookid = req.params.id;
      Book.findById({ _id: bookid })
        .select("_id title comment")
        .exec((err, docs) => {
          if (err) {
            return res.send("error in finding the id of the book");
          }
          if (docs) {
            //console.log(docs);
            return res.json({
              _id: docs._id,
              title: docs.title,
              comments: docs.comment
            });
          } else {
            return res.send("no data found with the provided id");
          }
        });
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })

    .post(function(req, res) {
      var bookid = req.params.id;
      var comment = req.body.comment;
 
      Book.findById({ _id: bookid }, (err, doc) => {
        if (err) {
          return res.send("error in finding book with the provided id");
        }
        if (doc) {
          doc["comment"].push(comment);
          doc.commentcount = doc["comment"].length;
          doc.save();
          //console.log(doc)
           return res.json({
              _id: doc._id,
              title: doc.title,
              comments: doc.comment
            });         
        } else {
          return res.send("no data found with the provided id");
        }
      });
      //json res format same as .get
    })

    .delete(function(req, res) {
      var bookid = req.params.id;
      Book.deleteOne({_id:bookid},(err)=>{
        if(err){return res.send("error in deleting the book with provided id")}
        return res.send("delete successful")
      })
      //if successful response will be 'delete successful'
    });
};
