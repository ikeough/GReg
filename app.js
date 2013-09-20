var express = require('express')
  , app = express()
  , path = require('path')
  , mongoose = require('mongoose')
  , routes = require('./routes')
  , pkg = require('./routes/package')
  , passport = require('passport')
  , user = require('./routes/user')
  , users = require('./lib/users')
  , oxy_auth = require('./lib/oxygen_auth')
	, stats = require('./routes/stats')
  , basic_auth = require('./lib/basic_auth')
  , error = require('./lib/error');

////////////////////////
// DB
////////////////////////

  var mongoDbName = process.env.GREG_DB_NAME;
  var mongoDbUrl = process.env.GREG_DB_URL;
	var mongoUri = mongoDbUrl + mongoDbName;	

  mongoose.connect(mongoUri, function(err) {
    if (!err) {
       console.log('Connected to MongoDB at ' + mongoUri);
      } else {
        throw err;
      }
  });

////////////////////////
// Express Config
////////////////////////

  app.configure(function() {
    app.use(express.logger());
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade')
    app.engine('html', require('ejs').renderFile);
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(passport.initialize());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
  });

////////////////////////
// Debug
////////////////////////

  users.initDebugUser();

////////////////////////
// Routes
////////////////////////

  var auth_type =  process.env.GREG_USE_OXYGEN ? 'oxygen' : 'basic'; 

  console.log('Using authorization strategy: ' + auth_type);

// package header download 

  app.get('/package/:id', pkg.by_id );
  app.get('/package/:engine/:name', pkg.by_engine_and_name );

// download pkg contents

  app.get('/download/:id/:version', pkg.download_vers );
  app.get('/download/:id', pkg.download_last_vers );

// list packages

  app.get('/packages', pkg.all );
  app.get('/packages/:engine', pkg.by_engine );

// stats

  // app.get('/pkg_stats/:engine/:query_type', stats.by_engine_and_query );
  app.get('/pkg_stats/:engine', stats.by_engine );
  // app.get('/user_stats', stats.user_stats );
  app.get('/user_stats/:query_type', stats.user_stats );

// search

  app.get('/search/:query', pkg.search ); 

// users

  app.get('/user_name/:name', user.by_name );
  app.get('/user/:id', user.by_id );

// submit pkg

  app.post('/package', passport.authenticate(auth_type, { session: false }), pkg.add);
  app.put('/package', passport.authenticate(auth_type, { session: false }), pkg.add_version);

// deprecation

  app.put('/deprecate/:id', passport.authenticate(auth_type, { session: false }), pkg.deprecate_by_id);
  app.put('/undeprecate/:id', passport.authenticate(auth_type, { session: false }), pkg.undeprecate_by_id);
  app.put('/deprecate/:engine/:name', passport.authenticate(auth_type, { session: false }), pkg.deprecate_by_engine_and_name);
  app.put('/undeprecate/:engine/:name', passport.authenticate(auth_type, { session: false }), pkg.undeprecate_by_engine_and_name);

// voting

  app.put('/upvote/:id', passport.authenticate(auth_type, { session: false }), pkg.upvote_by_id);
  app.put('/downvote/:id', passport.authenticate(auth_type, { session: false }), pkg.downvote_by_id);
  app.put('/upvote/:engine/:name', passport.authenticate(auth_type, { session: false }), pkg.upvote_by_engine_and_name);
  app.put('/downvote/:engine/:name', passport.authenticate(auth_type, { session: false }), pkg.downvote_by_engine_and_name);

// commenting

  app.put('/comment/:id', passport.authenticate(auth_type, { session: false }), pkg.comment_by_id );
  app.put('/comment/:engine/:name', passport.authenticate(auth_type, { session: false }), pkg.comment_by_engine_and_name );

// auth validation

  app.get('/validate', passport.authenticate(auth_type, { session: false }), function(req, res){
    res.send(error.success("You are logged in."))
  });


////////////////////////
// Server
////////////////////////

  var port = process.env.PORT || 8080;
  app.listen(port);
  console.log('Starting server on port: ' + port);

