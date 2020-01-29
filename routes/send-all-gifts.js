var express = require('express');
var Database = require("../lib/Database");

var router = express.Router();
var db = new Database();

var userDb = db.collection('user');
var giftDb = db.collection('usergift');

/*  POST all gifts (send all gifts for a user) */ 
router.post('/:userid', function(req, res, next) {
  var userID = req.params.userid;
  var userResult = userDb.findFirstByID(userID);
  var item = req.body.item;
  
  if (!userResult.success) {
    throw new Error(`Unable to find User with ID ${userID}`);
  }

  var user = userResult.entity;
  
  // send gift to user if haven't sent one today
  user.friends.forEach( f => {
    var today = new Date();
    var formattedToday = today.toLocaleDateString("en-US");
    var sentGift = giftDb.find({ from: userID, to: f, date: formattedToday });

    // no gift was sent, send one
    if (sentGift != undefined && sentGift.length === 0) {
      var id = giftDb.findNextID();

      var gift = {
        id: id, 
        from: userID,
        to: f,
        item: item,
        date: formattedToday,
        received: false
      };

      giftDb.insert(gift);
    }
  });

  res.redirect(`/user/${userID}`);
});



module.exports = router;
