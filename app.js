let app = require('express')();
let server = require('http').createServer(app);
let io = require('socket.io').listen(server);
let ent = require('ent');
let session = require('express-session')({
    secret: 'pseudo',
    resave: true,
     saveUninitialized: true
    });
var sharedsession = require("express-socket.io-session");

app.use(session)
.get('/', function (req, res) {
    res.sendFile('view/index.html' , { root : __dirname});
  });
io.use(sharedsession(session));
io.sockets.on('connection', function (socket, pseudo) {
    socket.emit('msg', 'you are connected !');
    socket.broadcast.emit('msg', 'someone else is connected !!!');
    socket.on('newbie', function(pseudo) {
        socket.handshake.session.pseudo = pseudo;
        socket.handshake.session.save();
    })
    .on('msg', function(msg) {
        console.log(socket.handshake.session.pseudo + ' clicked :' + msg);
    });
});
server.listen(8080);