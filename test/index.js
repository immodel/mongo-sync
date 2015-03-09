var assert = require('assert');
var model = require('immodel')
  .use(require('immodel-base'));

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
      assert(user.get('username').value === 'test');
      assert(user.get('_id').value, doc.get('_id').value);
      assert(user.get('_id').value === doc.get('_id').value);
      done();
    });
  });

  it('should populate object ids on new documents', function() {
    var User = Collection
      .collection('users')
      .attr('username', 'string');

    var user = new User();
    assert(user.get('_id').value);
  });
});