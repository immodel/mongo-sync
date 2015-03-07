var assert = require('assert');
var model = require('immodel').bootstrap();

require('mongo-id')(model);

var Collection = model
  .use(require('../')('localhost/test'))
  
describe('mongo-sync', function() {
  it('should work', function(done) {
    var User = Collection
      .collection('users')
      .attr('username', 'string');
  
    var doc = new User({username: 'test'});

    doc.save(function(err, user) {
      assert(err === null);
      assert(user.get('username') === 'test');
      assert(user.get('_id') === doc.get('_id'));
      done();
    });
  });
});