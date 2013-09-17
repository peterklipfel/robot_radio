
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.radio = function(req, res){
  res.render('radio', { title: 'Robot Radio!' });
};