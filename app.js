let express = require('express')
let app = express();
let server = require('http').createServer(app);
let io = require('socket.io')(server);
let ent = require('ent');
let session = require('express-session')({
    secret: 'pseudo',
    resave: true,
     saveUninitialized: true
    });
var sharedsession = require("express-socket.io-session");

app.use(session)
.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'))
.use('/js', express.static(__dirname + '/node_modules/jquery/dist'))
.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'))
.use('/css', express.static(__dirname + '/public/css/'))
.get('/', function (req, res) {
    res.sendFile('view/index.html' , { root : __dirname});
  });
io.use(sharedsession(session));
io.sockets.on('connection', function (socket, pseudo) {
    socket.emit('connect');

    socket.on('newbie', function(pseudo) {
        pseudo=ent.encode(pseudo);
        socket.handshake.session.pseudo = pseudo;
        socket.handshake.session.save();
        socket.broadcast.emit('newbie', socket.handshake.session.pseudo)
    })
    .on('msg', function(msg) {
        msg=ent.encode(msg);
        pseudo=socket.handshake.session.pseudo
        socket.broadcast.emit('msg', {pseudo : pseudo, msg: msg })
    })
    .on('disconnect', function(){
        let pseudo=socket.handshake.session.pseudo
        socket.broadcast.emit("diconnected", {pseudo: pseudo});
    })
});
server.listen(8080, () => {
    console.info('server up on 8080')
});