/**
 * A sample set of calls to provide usage examples of the included supporting classes.
 */

const Database = require("../lib/Database");

// Instantiate a new database
const db = new Database();

// Get a reference to the user collection
const user = db.collection('user');

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: "Gift Exchange", users: user.data });
});

module.exports = router;
