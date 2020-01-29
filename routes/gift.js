var express = require('express');
var Database = require("../lib/Database");

var router = express.Router();
var db = new Database();

var giftDb = db.collection('usergift');

/* GET user. */
router.post('/:from.:to', function(req, res, next) {
  var from = req.params.from;
  var to = req.params.to;
  var item = req.body.item;
  var date = new Date();

  var gift = {
    id: 5, 
    from: from,
    to: to,
    item: item,
    date: date
  }

  giftDb.insert(gift);
  
  res.redirect(`/user/${from}`);
});

module.exports = router;
