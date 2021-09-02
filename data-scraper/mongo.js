const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://' + process.env.DB_HOST + ':' + process.env.DB_PORT;

module.exports = class Mongo {

  constructor() {
    this.db = {};
    this.client = {};
  }

  connectToDb() {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, {
        useNewUrlParser: true
      }, (err, client) => {
        if (err) throw err;
        this.client = client;
        this.db = this.client.db(process.env.DB_NAME);
        resolve();
      });
    });
  }

  readObject(collectionName) {
    return new Promise((resolve, reject) => {
      this.db.collection(collectionName).findOne({}, function (err, result) {
        if (err) throw err;
        resolve(result);
      });
    });
  }

  destroyObject(collectionName, query) {
    return new Promise((resolve, reject) => {
      this.db.collection(collectionName).deleteMany(query, function (err, result) {
        if (err) throw err;
        resolve(result);
      });
    });
  }

  readObjectByJoin(collectionName, skip, limit, dir=1) {
    return new Promise((resolve, reject) => {
      const params = [
        {
          "$sort": 
          {
            "county": dir
          }
        },
        {
          "$lookup": {
            "from": "licenseInfo",
            "localField": "serial_number",
            "foreignField": "serial_number",
            "as": "licenseInfo"
          }
        },
        {
          "$match": {
            "licenseInfo.0": {
              "$exists": false
            }
          }
        }
      ];
      this.db.collection(collectionName).aggregate(params).skip(skip).limit(limit).toArray(function (err, result) {
        if (err) throw err;
        resolve(result);
      });
    });
  }

  readObjectByLimit(collectionName, skip, limit) {
    return new Promise((resolve, reject) => {
      this.db.collection(collectionName).find().skip(skip).limit(limit).toArray(function (err, result) {
        if (err) throw err;
        resolve(result);
      });
    });
  }

  queryObject(collectionName, query) {
    return new Promise((resolve, reject) => {
      this.db.collection(collectionName).findOne(query, function (err, result) {
        if (err) throw err;
        resolve(result);
      });
    });
  }

  writeObject(collectionName, obj) {
    obj['createdAt'] = new Date();
    return new Promise((resolve, reject) => {
      this.db.collection(collectionName).insertOne(obj, function (err, result) {
        if (err) throw err;
        resolve();
      });
    });
  }

  writeUnOrderedBulkObject(collectionName, objList) {
    return new Promise((resolve, reject) => {
      const col = this.db.collection(collectionName);
      const batch = col.initializeUnorderedBulkOp();

      for (var i = 0; i < objList.length; ++i) {
        batch.insert(objList[i]);
      }
      
      batch.execute((err, result) => {
        if (err) {
          let serialIds = [];
          if (err.name === 'BulkWriteError') {
            if (typeof err.op !== 'undefined') {
              serialIds.push(err.op.serial_number);
            } else {
              let sLength = err.writeErrors.length;
              for (let index = 0; index < sLength; index++) {
                serialIds.push(err.writeErrors[index].err.op.serial_number);
              }
            }
	    resolve(serialIds);	  
          } else { throw err; }
        } else { resolve(); }
      });

    });
  }

  destroyOneObject(collectionName, query) {
    return new Promise((resolve, reject) => {
      this.db.collection(collectionName).deleteOne(query, function (err, result) {
        if (err) throw err;
        resolve(result);
      });
    });
  }

  updateObject(collectionName, obj, query) {
    return new Promise((resolve, reject) => {
      obj['updatedAt'] = new Date();
      this.db.collection(collectionName).updateOne(query, {
        $set: obj
      }, function (err, res) {
        if (err) throw err;
        resolve();
      });
    });
  }

  disconnectToDb() {
    return new Promise((resolve, reject) => {
      this.client.close();
      resolve();
    });
  }

};
