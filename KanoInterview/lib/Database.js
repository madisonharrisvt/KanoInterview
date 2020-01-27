const Collection = require("./Collection");

const collections = ['user', 'item', 'usergift'];

/**
 * A Database class to simulate basic database behaviour in Mongo. collection is implemented
 * to behave similarily to a proper Mongo environment.
 */
class Database {
  constructor() {

  }

  /**
   * Fetch a reference to a collection by name, in this database.
   *
   * @param {string} collectionName Name of the collection being fetched from the database
   */
  collection(collectionName) {
    if(collections.indexOf(collectionName) !== -1) {
      return new Collection(collectionName);
    } else {
      throw new Error('Database:collection :: Collection does not exist.');
    }
  }
}

module.exports = Database;