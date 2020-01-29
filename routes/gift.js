var express = require('express');
var Database = require("../lib/Database");

var router = express.Router();
var db = new Database();

var giftDb = db.collection('usergift');

/* GET user. */
router.post('/:from.:to.:item', function(req, res, next) {
  console.log("Hiya");

  var from = req.params.from;
  var to = req.params.to;
  var item = req.params.item;

  var gift = {
    id: 5, 
    from: from,
    to: to,
    item: item,
    date: new Date()
  }

  giftDb.insert(gift);
  
  res.redirect(`/user/${from}`);
});

module.exports = router;
