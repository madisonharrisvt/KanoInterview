var express = require('express');
var Database = require("../lib/Database");

var router = express.Router();
var db = new Database();

var userDb = db.collection('user');
var itemDb = db.collection('item');
var giftDb = db.collection('usergift');

/* GET user. */
router.get('/:id', function(req, res, next) {
  var id = req.params.id;

  // get user by id
  var userResult = userDb.findFirstByID(id);

  // validate user
  if (!userResult.success) {
    throw new Error(`Unable to find User with ID ${id}`);
  }

  // load user's friends
  var user = userResult.entity;
  var friendGiftItemComposites = loadFriendGiftItemCompositesByUser(user);
  var allowAllGiftReceive = anyGiftUnreceived(friendGiftItemComposites);
  var allowAllGiftSend = anyGiftUnsentToday(friendGiftItemComposites);
  var items = itemDb.data;

  res.render('user', { 
    user: user, 
    friendGiftItemComposites: friendGiftItemComposites, 
    allowAllGiftReceive: allowAllGiftReceive,
    allowAllGiftSend: allowAllGiftSend,
    items: items
  });
});

/******************************************************
 *  Helper functions
 *******************************************************/
function loadFriendGiftItemCompositesByUser(user) {
  var friendIds = user.friends;
  var friendComposites = [];

  friendIds.forEach(fid => {
    var friendResult = userDb.findFirstByID(fid);

    if (friendResult.success) {
      var friend = friendResult.entity;
      var giftItemCompositesSentToFriend = loadAllGiftItemCompositesFromFirstUserToSecondUser(user, friend);
      var giftItemCompositesSentByFriend = loadAllGiftItemCompositesFromFirstUserToSecondUser(friend, user);
      var giftHasBeenSentToFriendToday = giftHasBeenSentToday(giftItemCompositesSentToFriend);

      var friendComposite = {
        friend: friend,
        giftItemCompositesSentToFriend: giftItemCompositesSentToFriend,
        giftItemCompositesSentByFriend: giftItemCompositesSentByFriend,
        giftHasBeenSentToFriendToday: giftHasBeenSentToFriendToday
      }

      friendComposites.push(friendComposite);
    }
  });

  return friendComposites;
}

function loadAllGiftItemCompositesFromFirstUserToSecondUser(firstUser, secondUser) {
  var giftsResult = giftDb.find({ from: firstUser.id, to: secondUser.id });
  var giftItemComposites = [];

  if (giftsResult != undefined && giftsResult.length !== 0) {
    var gifts = giftsResult;

    gifts.forEach( g => {
      var itemResult = itemDb.findFirstByID(g.item)
      if (itemResult.success) {
        var item = itemResult.entity;

        var giftItemcomposite = {
          gift: g,
          item: item
        };

        giftItemComposites.push(giftItemcomposite);
      }
    })
  }

  return giftItemComposites;
}

function giftHasBeenSentToday(giftItemComposites)  {
  var giftHasBeenSentToday = false;

  giftItemComposites.forEach( gic => {
    var today = new Date();
    if (!giftHasBeenSentToday && gic.gift.date === today.toLocaleDateString("en-US")) {
      giftHasBeenSentToday = true;
    }
  });

  return giftHasBeenSentToday;
}

function anyGiftUnreceived(friendGiftItemComposites) {
  var hasAnyGiftUnreceived = false;

  friendGiftItemComposites.forEach( f => {
    if (!hasAnyGiftUnreceived) {
      var received = f.giftItemCompositesSentByFriend.map( gic => gic.gift.received );

      if (received != undefined && received.includes(false)) {
        hasAnyGiftUnreceived = true;
      }
    }
  });

  return hasAnyGiftUnreceived;
}

function anyGiftUnsentToday(friendGiftItemComposites) {
  var hasAnyGiftUnsentToday = false;

  friendGiftItemComposites.forEach( f => {
    if (!hasAnyGiftUnsentToday && !f.giftHasBeenSentToFriendToday) {
      hasAnyGiftUnsentToday = true;
    }
  });

  return hasAnyGiftUnsentToday;
}




module.exports = router;
