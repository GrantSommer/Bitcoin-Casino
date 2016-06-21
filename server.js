//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//

var games = [];

games["slots"] = {
  "id":"slots",
  "name":"Slots",
  "price":"0.0001000"
};

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//

// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var bitcoins = 0.002;
var price = 0.0001;

var sockets = [];

var cgame = [];

var slotPlayedTime = 0;

function genNumber(){
  var num = (Math.floor(Math.random() * (6 - 0)) + 0)+1;
  console.log("Times:"+slotPlayedTime);
  if (slotPlayedTime>=15){
    console.log('!! Special roll !!');
    return (Math.floor(Math.random() * (7 - 5)) + 6);
  } else {
    if ((Math.floor(Math.random() * (2 - 0)) + 0) >= 1) {

      if (num>4){
        console.log('num is > 4');
        return genNumber();
      } else {
        console.log('num is <= 4');
        return num;
      }
    } else {
      console.log('no need to gen diffrent');
      return num;
    }
  }
}

server.listen(8080, function () {
  console.log('Server listening at port %d', 8080);
});

// Routing
app.use(express.static(__dirname + '/client'));

io.sockets.on('connection', function (socket) {
  sockets.push(socket);

  socket.on('start game',function(game){
    socket.emit('game',games[game].id+".html");
    cgame[socket.id]=game;
  });

  socket.on('spin',function(){
    if(bitcoins>=price){
      bitcoins-=price;

      slotPlayedTime++;
      console.log('spin');
      var one = genNumber();
      var two = genNumber();
      var thr = genNumber();
      var thebignum = parseInt(one.toString()+two.toString()+thr.toString());
      socket.emit('numbers',[one,two,thr]);
      if (one===7&&two===7&&thr===7){
        socket.emit('win',{title:"777",desc:"You got the BIG WIN!!",num:0.00015});
        bitcoins+=0.00015;
      } else if (one===6&&two===6&&thr===6){
        socket.emit('win',{title:"Devil's Number",desc:"You just got the Devil's number..",num:0.00005});
        bitcoins+=0.00005;
      } else if (thebignum===111){
        socket.emit('win',{title:"Unlucky",desc:"111... 111...",num:0.0000001});
        bitcoins+=0.0000001;
      }
      if (slotPlayedTime >= 15){
        if (slotPlayedTime >= 20){
          slotPlayedTime=0;
        }
      }
      socket.emit('bitcoins',bitcoins);
    } else {
      socket.emit('alert',{type:"danger",content:"<strong>Not enough Bitcoins :/</strong>"});
    }
  });

  /*socket.on('ready for game',function(){
    game = cgame[socket.id];
    console.log(game);
    socket.emit('alert',{type:"success",content:"Welcome to "+game.name+"!"});
    socket.emit('price',game.price);
  });*/
});

function broadcast(name,message){
  sockets.forEach(function(socket){
    socket.emit(name,message);
  });
}
