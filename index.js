var Twitter = require('twitter');

var express = require('express');
var app = express();
var server = require('http').createServer(app);

//socket.io
var io = require('socket.io')(server);

// Set the port
app.set('port', (process.env.PORT || 5000));

//
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Helper functions
function statuses_user_timeline(screen_name, resstream) {
  var client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
  });

  client.get('statuses/user_timeline', {screen_name: screen_name}, function(error, tweets, response) {
    //console.log(tweets);
    for (i = 0; i < tweets.length; i++) {
      resstream.write(tweets[i].created_at + '\n');
      resstream.write('[@' + tweets[i].user.screen_name + ']:\n');
      resstream.write(tweets[i].text + '\n\n');
    }
    resstream.end();
  });
}




// Page routes
app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/helloworld', function(request, response) {
  response.send("hello world");
});

app.get('/timeline/:user', function(request, response) {

  statuses_user_timeline(request.params.user, response);

  //response.send(request.params.user);
});

app.get('/socketiochat', function(req, res) {
  res.render('pages/socketiochat');
  //res.sendFile(__dirname + '/views/pages/index.html');
});


//Socket IO
io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('chat message', function(msg){
    //console.log('message: ' + msg);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', function() {
    console.log('a user disconnected');
  });
});

// Run the application
server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
