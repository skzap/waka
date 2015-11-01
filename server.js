// this server serves the html app
// also runs the peer js connection broker server
var winston = require('winston')
winston.add(winston.transports.File, { filename: 'logs.log' });
var express = require('express')
var app = express()
var path    = require("path")
var ExpressPeerServer = require('peer').ExpressPeerServer

var serverOptions = {
    debug: true,
    allow_discovery: true
}

var server = app.listen(80)
app.use(express.static('public'))
app.use('/peerjs', ExpressPeerServer(server, serverOptions))
app.get('/public/*', function (req, res) {
})
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname+'/app.html'));
})
 



// server.on('connection', function(conn) {
// 	//winston.info('Socket opened: ' + conn.id)
// 	//conn.send('hi');
// })

// server.on('disconnect', function(conn) {
// 	// client disconnected
// });
