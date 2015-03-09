var monk = require('monk');
var mquery = require('mquery');
var objectid = require('objectid');

module.exports = function(mongoUrl) {
  var db = monk(mongoUrl);

  return function() {
    this.use(require('immodel-mongo-id'));
    this.attr('_id', 'ObjectID');

    this.collection = function(name) {
      return this.use(function() {
        this.collectionName = name;
      });
    };

    this.db = function() {
      return db.get(this.collectionName);
    };

    this.query = function() {
      return mquery(this.db());
    };

    this.prototype.query = function() {
      return this.model.query();
    };

    this.prototype.save = function(cb) {
      var doc = this;

      doc.run('saving', function(err, doc) {
        if(err) return cb(err);

        var json = doc.toJSON();
        var model = doc.model;

        function done(err, json) {
          if(err) return cb(err);
          var doc = new model(json);
          doc.run('saved', cb);
        }

        if(doc.isNew) {
          model.db().insert(json, done);
        } else {
          doc.query()
            .where('_id', json._id)
            .update(json, function(err, numAffected) {
              if(! err && numAffected === 0) return err = new Error('Document not found');
              done(err, json);
            });
        }
      });
    };

    this.on('init', function(evt) {
      var doc = evt.doc;
      doc.isNew = ! doc.value._id;
      var err = new Error;
      if(doc.isNew) {
        doc.value._id = objectid().toString();
      }
    });
  };
};