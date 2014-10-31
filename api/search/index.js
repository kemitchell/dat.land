var url = require('url')
var debug = require('debug')('search')

module.exports = function(models) {

  return {
    index: function (req, res, opts) {
      debug('found req', req.url)
      var q = url.parse(req.url, true).query

      models.db.query(q.field, q.query)
        .on('data', function (data) {
          console.log(data)
        })
        .on('stats', function (stats) {
          debug('stats for query ', q.field, q.query, stats)
        })
        .on('end', function () {
          res.end()
        });
    }
  }
}
