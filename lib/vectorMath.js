exports.magnitude = function(vector){
  var total = 0;
  for(var i in vector){
    total += parseInt(vector[i]*vector[i])
  }
  return Math.sqrt(total)
}

exports.dotProduct = function(a, b){
  if(a.length!==b.length){
    return undefined
  }
  var total = 0
  for(i in a){
    total+=a[i]*b[i]
  }
  return total
}

exports.similarity = function(a, b){
  return exports.dotProduct(a, b)/(exports.magnitude(a)*exports.magnitude(b))
}

