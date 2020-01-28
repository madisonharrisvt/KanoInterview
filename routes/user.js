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
  var userResult = loadFirstEntityByDbAndID(userDb,id);

  // validate user
  if (userResult.success) {
    // load user's friends
    var user = userResult.entity;
    var friends = loadFriendsByUser(user);
    var giftsSent = loadGiftCompositesSentByUser(user);
    res.render('user', { title: user.name, img: user.img, friends: friends, giftsSent: giftsSent });
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
// load first User by id regardless if result is empty/null/undefinied/incorrect
function loadFirstEntityByDbAndID(db, id) {
  var entityResult = db.find( { id: id });
  var entity = entityResult[0];
  
  if (entity != undefined && entity.id == id)
  {
    return { entity: entity, success: true }
  }
  else
  {
    return { entity: entity, success: false }
  }
}

// load all Gifts from User id regardless if result is empty/null/undefinied/incorrect
function loadAllGiftsFromUserId(id) {
  var giftsResult = giftDb.find( { from: id });
  
  if (giftsResult != undefined)
  {
    return { gifts: giftsResult, success: true }
  }
  else
  {
    return { gifts: giftsResult, success: false }
  }
}

function loadFriendsByUser(user) {
  var friendIds = user.friends;
  var friends = [];

  // load friends by user friend IDs
  friendIds.forEach( id => {
    var friendResult = loadFirstEntityByDbAndID(userDb, id)

    // validate
    if (friendResult.success) {
      friends.push(friendResult.entity);
    }
  });

  return friends;
}

function loadGiftCompositesSentByUser(user) {
  var sentGiftsResult = loadAllGiftsFromUserId(user.id);
  var giftsSent = [];
  
  // don't process gifts if they don't exist
  if (!sentGiftsResult.success || sentGiftsResult.length === 0) {
    return giftsSent;
  }

  sentGiftsResult.gifts.forEach( g => {
    var fromUserResult = loadFirstEntityByDbAndID(userDb, g.from);
    var toUserResult = loadFirstEntityByDbAndID(userDb, g.to);
    var itemResult = loadFirstEntityByDbAndID(itemDb, g.item);

    // TODO: move error messages to somewhere not in the name :(
    var giftComposite = {
      id: g.id,
      from: fromUserResult.success ? fromUserResult.entity : { name: `Unable to load User with ID ${g.from}!`},
      to: toUserResult.success ? toUserResult.entity : { name: `Unable to load User with ID ${g.to}!`},
      item: itemResult.success ? itemResult.entity : { name: `Unable to load Item with ID ${g.item}!`},
      date: g.date
    }
    giftsSent.push(giftComposite);
  });
  return giftsSent;  
}

module.exports = router;
