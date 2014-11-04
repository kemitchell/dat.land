var debug = require('debug')('test-search')

module.exports.searchSimple = function (test, common) {
 test('creates a new Metadat via POST', function(t) {
    var data = {
      'owner_id': 1,
      'name': 'test entry',
      'url': 'http://dat-data.dathub.org',
      'license': 'BSD-2'
     // 'keywords': ['entry', 'test', 'data', 'dathub']
    }
  });
}


module.exports.all = function(test, common) {
  module.exports.searchSimple(test, common);
}