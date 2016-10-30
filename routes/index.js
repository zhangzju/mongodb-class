var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Mongogo' });
});

router.get('/document', function(req, res, next) {
  res.render('document', { title: 'Documents' });
});

router.get('/database', function(req, res, next) {
  res.render('database', { title: 'Database' });
});

module.exports = router;
