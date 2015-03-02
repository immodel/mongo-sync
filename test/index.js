var expect = require('chai').expect;
var model = require('immodel').bootstrap();

require('mongo-id')(model);

var Collection = model
  .use(require('../')('localhost/test'))
  .attr('_id', 'ObjectID');
  
describe('mongo-sync', function() {
  it('should work', function(done) {
    var User = Collection
      .collection('users')
      .attr('username', 'string');
  
    var doc = new User({username: 'test'});
    
    doc.save(function(err, user) {
      expect(err).to.be.null;
      done();
    });
  });
});