var monk = require('monk');
var mquery = require('mquery');

module.exports = function(mongoUrl) {
  var db = monk(mongoUrl);
  
  return function(model) {
    model.collection = function(name) {
      return this.use(function(model) {
        model.collectionName = name;
      });
    };
    
    model.db = function() {
      return db.get(this.collectionName);
    };
    
    model.query = function() {
      return mquery(this.db());
    };
       
    model.on('init', function(evt) {
      var doc = evt.doc;
      doc.query = function() {
        return this.model.query();
      };
      
      doc.save = function(cb) {
        var json = this.toJSON();
        this.query()
          .where('_id', json._id)
          .update(json, cb);
      };
    })
  };
};