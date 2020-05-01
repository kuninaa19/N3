module.exports = function(app) {

  const mysql = require('../conf/dbInfo');

  /* GET home page. */
  app.get('/', function (req, res) {
    res.render('index');
  });

};