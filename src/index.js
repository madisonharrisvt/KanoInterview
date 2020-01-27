/**
 * A sample set of calls to provide usage examples of the included supporting classes.
 */

const Database = require("../lib/Database");

// Instantiate a new database
const db = new Database();

// Get a reference to the user collection
const user = db.collection('user');
const item = db.collection('item');

// Find users with name 'Lily' from the user collection
let result = user.find({name: 'Lily'});

// Check that we have returned the correct user
if(result[0].name === 'Lily') {
    console.log('It works!');
}