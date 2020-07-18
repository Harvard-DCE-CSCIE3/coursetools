var express = require('express');
var router = express.Router();



/* GET home page. */
router.get('/', async function(req, res, next) {
  if (req.api){
    const profile = await req.api.user.self.getProfile();
    res.render('index', { title: 'Express', user: profile });
  }else{
    res.render('getTokenAndHost');
  }
});
router.get('/logout', async function(req, res, next) {
//console.log('lo')
  req.session.destroy();
  req.api = null;
  res.redirect('/');
});

module.exports = router;
