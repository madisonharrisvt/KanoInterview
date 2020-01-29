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
  var friends = loadFriendCompositesByUser(user);
  var giftsSent = loadGiftsSentByUser(user);
  var giftsReceived = loadGiftsReceivedByUser(user);
  var allowAllGiftReceive = anyGiftUnreceived(giftsReceived);
  var allowAllGiftSend = anyGiftUnsentToAllFriendsTodayByUser(friends, user);

  res.render('user', { 
    user: user, 
    img: user.img, 
    friends: friends, 
    giftsSent: giftsSent, 
    giftsReceived: giftsReceived, 
    allowAllGiftReceive: allowAllGiftReceive,
    allowAllGiftSend: allowAllGiftSend
  });
});

/******************************************************
 *  Helper functions
 *******************************************************/

// load all Gifts from User id regardless if result is empty/null/undefinied/incorrect
function loadGiftsSentByUser(user) {
  var gifts = giftDb.find( { from: user.id });
  
  return loadGiftCompositesByGifts(gifts);
}

// load all Gifts to User id regardless if result is empty/null/undefinied/incorrect
function loadGiftsReceivedByUser(user) {
  var gifts = giftDb.find( { to: user.id });
  
  return loadGiftCompositesByGifts(gifts);
}

function anyGiftUnreceived(gifts) {
  var hasGiftUnreceived = false;

  gifts.forEach( g => {
    if (!hasGiftUnreceived && !g.received) {
      hasGiftUnreceived = true;
    }
  });

  return hasGiftUnreceived;
}

function giftUnsentToFriendTodayByUser(friend, user) {
  var today = new Date();
  var formattedToday = today.toLocaleDateString("en-US");
  var sentGift = giftDb.find({ from: user.id, to: friend.id, date: formattedToday });

  return sentGift != undefined && sentGift.length === 0
}

function anyGiftUnsentToAllFriendsTodayByUser(friends, user) {
  var hasGiftUnsent = false;

  friends.forEach( f => {
    var hasGiftUnsentToFriendToday = giftUnsentToFriendTodayByUser(f, user);

    if (!hasGiftUnsent && hasGiftUnsentToFriendToday) {
      hasGiftUnsent = true;
    }
  });

  return hasGiftUnsent;
}

function loadFriendCompositesByUser(user) {
  var friendIds = user.friends;
  var friendComposites = [];

  // load friends by user friend IDs
  friendIds.forEach( id => {
    var friendResult = userDb.findFirstByID(id);

    // validate
    if (friendResult.success) {
      var friend = friendResult.entity;
      var hasGiftUnsentToFriendToday = giftUnsentToFriendTodayByUser(friend, user);
      var friendComposite = friend;
      friendComposite["hasGiftUnsent"] = hasGiftUnsentToFriendToday;

      friendComposites.push(friendComposite);
    }
  });

  return friendComposites;
}

function loadGiftCompositesByGifts(gifts) {
  var giftComposites = [];
  
  // don't process gifts if they don't exist
  if (gifts == undefined || gifts.length === 0) {
    return gifts;
  }

  gifts.forEach( g => {
    var fromUserResult = userDb.findFirstByID(g.from);
    var toUserResult = userDb.findFirstByID(g.to);
    var itemResult = itemDb.findFirstByID(g.item);

    // TODO: move error messages to somewhere not in the name :(
    var giftComposite = {
      id: g.id,
      from: fromUserResult.success ? fromUserResult.entity : { name: `Unable to load User with ID ${g.from}!`},
      to: toUserResult.success ? toUserResult.entity : { name: `Unable to load User with ID ${g.to}!`},
      item: itemResult.success ? itemResult.entity : { name: `Unable to load Item with ID ${g.item}!`},
      date: g.date,
      received: g.received
    }
    giftComposites.push(giftComposite);
  });
  return giftComposites;  
}

module.exports = router;
