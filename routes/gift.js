var express = require('express');
var Database = require("../lib/Database");

var router = express.Router();
var db = new Database();

var giftDb = db.collection('usergift');

/* POST gift. */
router.post('/:from.:to', function(req, res, next) {
  var from = req.params.from;
  var to = req.params.to;
  var item = req.body.item;
  var date = new Date();
  var id = giftDb.findNextID();

  var gift = {
    id: id, 
    from: from,
    to: to,
    item: item,
    date: date,
    received: false
  }

  giftDb.insert(gift);
  
  res.redirect(`/user/${from}`);
});

/*  POST gift (receive gift) */ 
router.post('/:id', function(req, res, next) {
  var id = req.params.id;
  var giftResult = giftDb.findFirstByID(id);

  if (!giftResult.success) {
    throw new Error(`Unable to find gift with ID ${id}`);
  }

  var gift = giftResult.entity;
  // update received
  if (!gift.received) {
    giftDb.update({ id: id }, { received: true });
  }

  res.redirect(`/user/${gift.to}`);
});

module.exports = router;
