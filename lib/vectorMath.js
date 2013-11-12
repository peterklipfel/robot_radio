exports.magnitude = function(vector){
  var total = 0.0;
  for(var i in vector){
    total += vector[i]/1.0*vector[i]/1.0
  }
  return Math.sqrt(total)
}

exports.dotProduct = function(a, b){
  if(a.length!==b.length){
    return undefined
  }
  var total = 0.0
  for(i in a){
    total+=a[i]/1.0*b[i]/1.0
  }
  return total
}

exports.cosineSimilarity = function(a, b){
  return exports.dotProduct(a, b)/(exports.magnitude(a)*exports.magnitude(b))
}

exports.similarity = function(a, b){
  var similarity = Math.abs((exports.magnitude(a)-exports.magnitude(b)))*exports.cosineSimilarity(a, b)/
    (exports.magnitude(a)*exports.magnitude(b))
  console.log("comparing: \n"+a+"\nvs.\n"+b)
  console.log("similarity = "+similarity)
  return similarity
}
