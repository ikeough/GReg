var passport = require('passport')
  , UserModel = require('../models/user').UserModel
  , util = require('util')
  , request = require('superagent');

var debug = false;

/**
 * Constructor for the oxygen authentication strategy
 *
 * @param {Object} options
  * @param {Object} options
 * @api protected
 */

function Strategy(options, verify) {
  if (typeof options == 'function') {
    verify = options;
    options = {};
  }
  
  passport.Strategy.call(this);
  this.name = 'oxygen';
  this._verify = verify;
  this.validation_url = process.env.OXYGEN_VALIDATION_URL;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

function isEmptyObject(obj) {
  for(var prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }
  return true;
}

/**
 * Ask Oxygen to verify an authorization header.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req, options) {

  options = options || {};
 
  var self = this;

  function verified(err, user, info) {
    if (err) { return self.error(err); }
    if (!user) { return self.fail(info); }
    console.log('Verified user');
    self.success(user, info);
  }

  try {
    var oauth_header = "";
    
    if (req.headers.authorization != null){
      
      if (debug){
        console.log("User provided authentication header", req.headers.authorization)
      }
      
      oauth_header = req.headers.authorization; 
	
    } else if (req.query != null) {
	
      if (debug){
        console.log("User provided oauth params in query", req.query);
      }

      oauth_header = "OAuth ";
      for (var key in req.query){
        if (key.indexOf('oauth') === 0){
         oauth_header = oauth_header + key + "=" + "\"" + encodeURIComponent( req.query[key] ) + "\",";
				}
      } 

      oauth_header = oauth_header.slice(0,oauth_header.length-1);

      if (debug){
        console.log("Reconstructed header is", oauth_header);
      }

   } else {

      if (debug){
        console.log("User provided no oauth params.  Rejecting request.");
      }
      return this.fail( new BadRequestError(options.badRequestMessage || 'Missing credentials') );

   }

    var path = req.protocol + "://" + req.headers.host + req._parsedUrl.pathname; 

    if (debug){
      console.log('Resource path:', path);
      console.log('Resource method:', req.method);
      console.log('Request body:', req.body);
    }

    var encodedParams = req.body;

    if ( !isEmptyObject( req.body ) ){
      if (debug){
        console.log('Making param string');
      }
      var param_string = "";
      for (var key in req.body) {
        if (debug){
          console.log("A")
          console.log( key );
          console.log("B")
          console.log( req.body[key] )
          console.log("C")
          console.log( encodeURIComponent( req.body[key] ) )
        }
        param_string = param_string + key;
        param_string = param_string + "=";

        param_string = param_string + encodeURIComponent( req.body[key] );
      }
      encodedParams = param_string;
      if (debug){
        console.log(encodedParams);
      }
    }

    if (debug){
      console.log('Encoded params:\n', encodedParams);
    }

		request
      .post(self.validation_url)
      .type('form')
      .query({authorizationHeader: oauth_header})
      .send({requestUrl:path})
      .send({httpMethod: req.method})
      .send({responseFormat:'json'}) 
      .send({formEncodedParams: encodedParams})
      .set('Accept', 'application/json')
      .end(function(error, res2){
    		if (error){
          if (debug){
            console.log('There was an error getting a response from oxygen');
          }
          return self.fail( new BadRequestError(options.badRequestMessage || 'Invalid credentials') );
    		} else {
    		  try {
            if (debug){
              console.log('Response from oxygen: ', res2.text);
            }
    	      user_data = JSON.parse( res2.text );
    		    self._verify(req, user_data, verified);
    		  } catch (e) {
            if (debug){
              console.log('There was an error verifying the response from oxygen');
            }
    		    return self.fail( new BadRequestError(options.badRequestMessage || 'Invalid authentication response') );
    		  }
    		}
      });
    	
  } catch (e) {
    return self.fail( new BadRequestError(options.badRequestMessage || 'Failed to authenticate') );
  }

}

/**
 * `BadRequestError` error.
 *
 * @api public
 */
function BadRequestError(message) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'BadRequestError';
  this.message = message || null;
};

// Inherit from error
BadRequestError.prototype.__proto__ = Error.prototype;


// Expose Strategy
module.exports = Strategy;


// Sign up the oxygen strategy with passport
passport.use(new Strategy( 

  function(req, user_data, done) {

    console.log(user_data)
    UserModel.findOne({ username: user_data.TokenValidationResult.User.UserName }, function (err, user) {

      // create a new user, as they don't currently exist in the db
      if (err || !user) {
      // try {
        console.log('creating new user')
        var result = user_data.TokenValidationResult;

        var new_user_data = {
          oxygen_id: result.User.Id,
          eidm_guid: result.User.EidmGuid,
          username: result.User.UserName,
          email: result.User.Email,
          first_name: result.User.Profile.FirstName,
          last_name: result.User.Profile.LastName,
          country_code: result.User.Profile.CountryCode,
          language: result.User.Profile.Language
        };

        var new_user = new UserModel(new_user_data);

        new_user.save( function(err) {
          if (err) {
            return done( err );
          }
          return done(null, new_user );
        });

      // } catch (e) {
      //   // bad stuff happened
      // }

      } else {
        // everything's good :D
        return done(null, user);
      }
    
    }); 
  }

));
