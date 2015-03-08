var monk = require('monk');
var mquery = require('mquery');
var objectid = require('objectid');

module.exports = function(mongoUrl) {
  var db = monk(mongoUrl);
  
  return function() {
    require('immodel-mongo-id')(this);
    
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
       
       
    this.attr('_id', 'ObjectID');
    this.on('init', function(evt) {
      var doc = evt.doc;
      doc.isNew = ! doc.value._id;
      if(doc.isNew)
        doc._id = objectid();
      
      doc.query = function() {
        return this.model.query();
      };
      
      doc.save = function(cb) {
        var json = this.toJSON();
        var model = this.model;
        
        if(this.isNew) {
          this.model.db().insert(json, function(err, doc) {
            if(err) return cb(err);
            cb(null, new model(doc));
          });
        } else {
          this.query()
            .where('_id', json._id)
            .update(json, function(err, numAffected) {
              if(err) return cb(err);
              if(numAffected === 0) return cb(new Error('Document not found'));
              cb(null, new model(json));
            });
        }
      };
    })
  };
};