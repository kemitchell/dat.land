var level = require('level-prebuilt'),
    RestModels = require('level-restful'),
    bytewise = require('bytewise/hex'),
    util = require('util'),
    debug = require('debug')('models'),
    timestamp = require('monotonic-timestamp'),
    levelQuery = require('level-queryengine'),
    fulltextEngine = require('fulltext-engine');

var defaults = require('./defaults.js'),
    Users = require('./auth/users.js');

module.exports = function(opts) {
  var db = levelQuery(level(opts.DAT_REGISTRY_DB,
    { keyEncoding: bytewise, valueEncoding: 'json' }))

  db.query.use(fulltextEngine())

  db.ensureIndex('name', 'fulltext', fulltextEngine.index());

  return {
    db: db,
    users: new Users(db),
    metadat: new MetaDat(db)
  }
}

function MetaDat(db) {
  // MetaDat is the metadata for a particular dat instance.
  // id is the primary key, auto incremented by timestamp
  fields = [
    {
      'name': 'owner_id',
      'type': 'number'
    },
    {
      'name': 'name',
      'type': 'string'
    },
    {
      'name': 'url',
      'type': 'string'
    },
    {
      'name': 'schema',
      'type': 'string',
      'optional': true
    },
    {
      'name': 'license',
      'type': 'string',
      'optional': true,
      'default': 'BSD'
    }
  ]
  RestModels.call(this, db, 'metadat', 'id', fields, opts);
}

util.inherits(MetaDat, RestModels);
MetaDat.prototype.keyfn = timestamp
