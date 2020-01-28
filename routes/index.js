var express = require('express');
var Database = require("../lib/Database");

var router = express.Router();
var db = new Database();

// Get a reference to the user collection
var user = db.collection('user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: "Gift Exchange", users: user.data });
});

module.exports = router;
