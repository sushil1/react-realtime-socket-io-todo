import express from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import mongoose from 'mongoose'
import http from 'http'
import socketServer from 'socket.io'
import Todo from './models/Todo'

const app = express()

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.send('hello')
})

mongoose.connect('mongodb://localhost:27017/todos')

mongoose.connection
  .once('open', ()=> console.log('DB connected'))
  .on('error', () => console.log('DB connection failed'))


const server = http.createServer(app)
const io = socketServer(server)

const connections = []

io.on('connection', (client) => {
  console.log('new client connected ', client.id)
  connections.push(client)

  client.on('loadInitialData', () => {
    Todo.find({}).sort({updatedAt:'-1'})
      .then((todos) => client.emit('initialData', todos))
  })

  client.on('addItem', (data) => {
  new Todo({
      ...data
    }).save()
    .then(todo => {

      io.emit('itemAdded', todo)
    })

  })

  client.on('updateItem', (data) => {

    Todo.findByIdAndUpdate({_id:data._id}, {task:data.task}, {new:true})
      .then(todo =>
        io.emit('itemUpdated', todo)
    )

  })

  client.on('toggleTodo', (id) => {
    Todo.findById(id, (err, doc) => {
      if(err){
        return err
      } else{
        doc.completed = !doc.completed
        doc.save().then(todo => io.emit('todoToggled', todo))
      }
    })

  })


  client.on('deleteTodo', (id) => {
    Todo.findByIdAndRemove(id)
      .then(result => io.emit('todoDeleted', result._id) )

  })

  client.on('disconnect', () => {
    console.log('client disconnected ', client.id)
    connections.splice(connections.indexOf(client), 1)
  })

})


server.listen(8000, ()=> console.log('Express server with socket running on port 8000'))
