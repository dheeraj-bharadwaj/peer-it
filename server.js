const express = require('express');
const app = express()
// const api = express().router();
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer')
const peerServer = ExpressPeerServer(server, {
	debug: true,
})
const { v4: uuidv4 } = require('uuid')

var bodyParser = require('body-parser');
const { resolveSoa } = require('dns');
const { default: axios } = require('axios');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use('/peerjs', peerServer)
app.use(express.static('public'))
app.set('view engine', 'ejs')

const uiID = uuidv4();
app.get('/', (req, res) => {
	res.redirect(`/${uiID}}`)
})

// app.post('/', (req, res) => {
// 	res.redirect(`/${req.body.id}`);
// })

app.get('/:room', (req, res) => {
	console.log('dynamic room route');
	console.log(req.params);
	res.render('room', { roomId: req.params.room })
	// res.redirect(`/${req.params.room}`);
})


// app.get('/dheeraj', (req, res) => {
// 	res.render('room', { roomId: req.params.room });
// })

var roomId;

app.post('/enter-room', (req, res) =>  {
	console.log('in enter room -------');
	roomId = req.body.id;
	axios.get(`http://localhost:5000/${roomId}`).then(() => console.log('called')).catch((e) => console.log('in error', e.name, e.message));
	res.send('ok');
})

io.on('connection', (socket) => {
	socket.on('join-room', (roomId, userName, userId) => {
		// const userId =  name_id.split('_')[1];
		socket.join(roomId)
		socket.to(roomId).broadcast.emit('user-connected',  userName, userId);

		socket.on('message', (message) => {
			io.to(roomId).emit('createMessage', message, userId)
		})
		socket.on('disconnect', () => {
			socket.to(roomId).broadcast.emit('user-disconnected', userId)
		})
	})
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => console.log(`Listening on port ${PORT}`))
