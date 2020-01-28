var express = require('express');
var Database = require("../lib/Database");

var router = express.Router();
var db = new Database();

var userDb = db.collection('user');

/* GET user. */
router.get('/:id', function(req, res, next) {
  var id = req.params.id;

  // get user by id
  var userResult = loadFirstUserByID(id);

  // validate user
  if (userResult.success) {
    // load user's friends
    var user = userResult.user;
    var friends = loadFriendsByUser(user);
    res.render('user', { title: user.name, img: user.img, friends: friends });
  }
  // handle errors
  else {
    res.render('user', { title: `Unable to find user with ID ${id}!`, img: "" });
    return;
  }
});

// load first user by id regardless if result is empty/null/undefinied/incorrect
function loadFirstUserByID(id) {
  var userResult = userDb.find( { id: id });
  var user = userResult[0];
  
  if (user != undefined && user.id == id)
  {
    return { user: user, success: true}
  }
  else
  {
    return { user, success: false}
  }
}

function loadFriendsByUser(user) {
  var friendIds = user.friends;
  var friends = [];

  // load friends by user friend IDs
  friendIds.forEach( id => {
    var friendResult = loadFirstUserByID(id)

    // validate
    if (friendResult.success) {
      friends.push(friendResult.user);
    }
  });

  return friends;
}

module.exports = router;
