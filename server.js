const express = require('express');
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer')
const peerServer = ExpressPeerServer(server, {
	debug: true,
})
const CryptoJS = require('crypto-js');
var bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use('/peerjs', peerServer)
app.use(express.static('public'))

app.set('view engine', 'ejs')

// first, root route
app.get('/', (req, res) => {
	// render index.ejs file
	res.render('index');
})

// as soon as some dynamic value gets appended to root route, this get call is invoked
app.get('/:room', (req, res) => {
	const [roomId, userName] = req.params.room.split('-');
	res.render('room', { roomId, userName })
})


var tempmessage = "HH";
const aesKey = "abc123XYZ";
io.on('connection', (socket) => {
	socket.on('join-room', (roomId, userName, userId) => {
		socket.join(roomId)
		socket.to(roomId).broadcast.emit('user-connected',  userName, userId);

		socket.on('message', (message) => {
			encryptedMessage = CryptoJS.AES.encrypt(message, aesKey).toString();
			console.log(encryptedMessage);
			//console.log(CryptoJS.AES.decrypt(encryptedMessage, aesKey).toString(CryptoJS.enc.Utf8));
			io.to(roomId).emit('createMessage', encryptedMessage,userName, userId)
		})

		socket.on('file', (fileContent, fileName) => {
			io.to(roomId).emit('fileUploaded', fileContent, fileName, userName, userId);
		})

		socket.on('disconnect', () => {
			socket.to(roomId).broadcast.emit('user-disconnected', userId)
		})
	})
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => console.log(`Listening on port ${PORT}`))
