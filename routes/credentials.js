require('dotenv').config();
var express = require('express');
var router = express.Router();
const crypto = require('../util/Crypto');

const caccl = require('caccl-api');
const apiFwd = require('caccl-api-forwarder');
console.log(crypto);
router.post('/', async function(req, res, next) {

    let profile = { name: 'No User Found', };
    try{
        // if fields are present
        var creds = {
          host: req.body.host,
          token: req.body.token,
        }
        // init API and fowarder
        if (validate(creds)){
          req.api = new caccl({
            accessToken: creds.token,
            canvasHost: creds.host,
          });
          req.session.api = req.api;
          req.session.canvasHost = crypto.encrypt(creds.host);
          req.session.accessToken = crypto.encrypt(creds.token);
          apiFwd({
            app: req.app,
            canvasHost: crypto.decrypt(req.session.canvasHost),
            accessToken: crypto.decrypt(req.session.accessToken),
            apiForwardPathPrefix: req.config.apiForwardPathPrefix,
            numRetries: req.config.defaultNumRetries,
          });
        }

        // get profile and confirm
        profile = await req.api.user.self.getProfile();
        console.log(profile);
        // confirm and if correct, forward to '/' page
    }catch(e){
      console.log("Error");
      console.log(e);
    }
    res.redirect('/');
});

function validate(creds){
  return true;
}

module.exports = router;
