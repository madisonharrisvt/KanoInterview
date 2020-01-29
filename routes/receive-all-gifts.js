var express = require('express');
var Database = require("../lib/Database");

var router = express.Router();
var db = new Database();

var giftDb = db.collection('usergift');

/*  POST all gifts (receive all gifts for a user) */ 
router.post('/:userid', function(req, res, next) {
  var userID = req.params.userid;
  var giftsToUser = giftDb.find( { to: userID } );

  if (giftsToUser == undefined || giftsToUser.length === 0) {
    throw new Error(`Unable to find gifts sent to User ID ${userID}`);
  }

  // receive all gifts
  giftsToUser.forEach( g => {
    if (!g.received) {
      giftDb.update({ id: g.id }, { received: true });
    }
  });

  res.redirect(`/user/${userID}`);
});



module.exports = router;
