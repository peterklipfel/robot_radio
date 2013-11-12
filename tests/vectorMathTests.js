var vectorMath = require('../lib/vectorMath.js')
var assert = require("assert")

describe('vectorMath', function(){
  describe('#magnitude()', function(){
    it('should calculate the correct magnitude', function(){
      assert.equal(2, vectorMath.magnitude([1, 1, 1, 1]) );
      assert.equal(4, vectorMath.magnitude([2, 2, 2, 1, 1, 1, 1]) );
    })
  })

  describe("#dotProduct", function(){
    it("should calculate correct magnitude", function(){
      assert.equal(0, vectorMath.dotProduct([0, 1, 0], [1, 0, 1]))
      assert.equal(1, vectorMath.dotProduct([1, 0, 0], [1, 0, 1]))
      assert.equal(7, vectorMath.dotProduct([2, 1, 3], [2, 0, 1]))
    })
  })

  describe("#similarity", function(){
    it("should calculate correct magnitude", function(){
      assert.equal(0, vectorMath.similarity([0, 10, 0], [10, 0, 10]))
      assert.equal(true, 
        vectorMath.similarity([1, 1, 1, 1], [1, 1, 1, 1]) >
        vectorMath.similarity([1, 1, 1, 2], [1, 1, 1, 1])
        )
    })
  })

})
