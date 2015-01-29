var multiparty   = require('multiparty');
var tmp          = require('./../../config').tmpdir;

function uploadHandler(connection, next) {
  var form  = new multiparty.Form({'uploadDir': tmp});

  form.parse(connection.req, function(err, fields, files) {
    if (!err) {
      for (var i in fields) if (fields.hasOwnProperty(i)) {
        if (fields[i].length === 1) {
          fields[i] = fields[i][0]
        }
      }
      connection.req.body = fields;
      connection.req.files = files;
    }

    next(err, connection);
  });
}

module.exports = uploadHandler;
