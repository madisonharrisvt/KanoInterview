const data = require('./Store');

/**
 * A Collection class to simulate basic collection behaviour in Mongo. find, insert and update are
 * all implemented to behave similarily to a proper Mongo environment.
 */
class Collection {
  constructor(collectionName) {
    this.data = data[`${collectionName}Data`];
  }

  /**
   * Find a document in this collection, based on provided query criteria
   *
   * @param {object} query Query to find a record in the collection based on this criteria.
   */
  find(query) {
    if(typeof query !== 'object') {
      throw new Error('Collection:find :: Invalid query.');
    }

    let queryKeys = Object.keys(query);
    let result = [];
    for(let i in this.data) {
      let isMatch = true;
      let item = this.data[i];
      for(let j in queryKeys) {
        if(item[queryKeys[j]].toString() !== query[queryKeys[j]].toString()) {
          isMatch = false;
          break;
        }
      }
      if(isMatch) result.push(item);
    }
    return result;
  }

  /**
   * Insert a document into this collection.
   *
   * @param {object} document A document to insert into this collection.
   */
  insert(document) {
    if(typeof document !== 'object') {
      throw new Error('Collection:insert :: Invalid document to insert.');
    }

    this.data.push(document);
  }

  /**
   * Update document fields in this collection, if they match query criteria
   *
   * @param {object} query Criteria to determine which documents should be updated.
   * @param {object} updates Updates to apply to documents which match query criteria.
   */
  update(query, updates) {
    if(typeof query !== 'object') {
      throw new Error('Collection:find :: Invalid query.');
    }
    if(typeof updates !== 'object') {
      throw new Error('Collection:find :: Invalid updates.');
    }

    let queryKeys = Object.keys(query);
    let updateKeys = Object.keys(updates);
    let result = [];
    for(let i in this.data) {
      let isMatch = true;
      let item = this.data[i];
      for(let j in queryKeys) {
        if(item[queryKeys[j]].toString() !== query[queryKeys[j]].toString()) {
          isMatch = false;
          break;
        }
      }
      if(isMatch) {
        for(let j in updateKeys) {
          item[updateKeys[j]] = updates[updateKeys[j]];
        }
      }
    }
    return result;
  }
}

module.exports = Collection;