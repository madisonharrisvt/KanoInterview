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
  if (userResult.success) {
    // load user's friends
    var user = userResult.entity;
    var friends = loadFriendsByUser(user);
    var giftsSent = loadGiftsSentByUser(user);
    var giftsReceived = loadGiftsReceivedByUser(user);
    res.render('user', { user: user, img: user.img, friends: friends, giftsSent: giftsSent, giftsReceived: giftsReceived });
  }
  // handle errors
  else {
    res.render('user', { title: `Unable to find user with ID ${id}!`, img: "", friends: [], giftsSent: [] });
    return;
  }
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

function loadFriendsByUser(user) {
  var friendIds = user.friends;
  var friends = [];

  // load friends by user friend IDs
  friendIds.forEach( id => {
    var friendResult = userDb.findFirstByID(id);

    // validate
    if (friendResult.success) {
      friends.push(friendResult.entity);
    }
  });

  return friends;
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
    var date = new Date(g.date);

    // TODO: move error messages to somewhere not in the name :(
    var giftComposite = {
      id: g.id,
      from: fromUserResult.success ? fromUserResult.entity : { name: `Unable to load User with ID ${g.from}!`},
      to: toUserResult.success ? toUserResult.entity : { name: `Unable to load User with ID ${g.to}!`},
      item: itemResult.success ? itemResult.entity : { name: `Unable to load Item with ID ${g.item}!`},
      date: date.toLocaleDateString("en-US"),
      received: g.received
    }
    giftComposites.push(giftComposite);
  });
  return giftComposites;  
}

module.exports = router;
