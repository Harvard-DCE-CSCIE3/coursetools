const crypto = require('crypto');
const randomstring = require('randomstring');

const algorithm = 'aes-256-ctr';

let key = randomstring.generate(48);

class Crypto{
  static encrypt(text){
      var cipher = crypto.createCipher(algorithm,key)
      var crypted = cipher.update(text,'utf8','hex')
      crypted += cipher.final('hex');
      return crypted;
  }

  static decrypt(text){
     var decipher = crypto.createDecipher(algorithm,key)
     var dec = decipher.update(text,'hex','utf8')
     dec += decipher.final('utf8');
     return dec;
  }
}
module.exports = Crypto;
