import React, { Component } from 'react';
import {AppBar, RaisedButton, TextField, Divider, List, ListItem} from 'material-ui'
import ActionSetting from 'material-ui/svg-icons/action/settings';
import TodoStatus from './TodoStatus'

import openSocket from "socket.io-client"
const socket = openSocket('http://localhost:8000')

let markCompleteStyle = {
  textDecoration: "line-through"
}

let iconStyles = {
	height:12,
	width:12
}

const defaultData ={
    task:'',
    completed:false
  }


class App extends Component {
  constructor(props){
    super(props)

    socket.emit('loadInitialData')

    socket.on('initialData', (todos) => {
      this.setState({
        todos
      })
    })

    socket.on('itemAdded', (todo) => {
      this.setState({
        data:{...this.state.data, task:''},
        todos: [todo, ...this.state.todos]
      })
    })

    socket.on('itemUpdated', (todo) => {
        this.cancelEditState()
        this.setState({
        todos: this.state.todos.map(item => item._id === todo._id? todo : item),
      })
    })

    socket.on('todoToggled', (todo) => this.setState({
        todos: this.state.todos.map(item => item._id === todo._id ? todo : item)
      }))

    socket.on('todoDeleted', (result) => {
      this.setState({
        todos: this.state.todos.filter((item) => item._id !== result)
      })
    })

  this.state={
    data:defaultData,
    todos:[],
    editState:false,
    deleteConfirm:false,
    errors:{}
  }

}

  cancelEditState(){
    this.setState({
      editState:false,
      deleteConfirm:false,
      data: defaultData
    })
  }

  deleteConfirmation(){
    this.setState({
      deleteConfirm:true
    })
  }

  cancelDeleteState(){
    this.setState({
      deleteConfirm:false
    })
  }

  onChange = (e) => {
    this.setState({
      data: {
        ...this.state.data, [e.target.id]: e.target.value
      }
    })
  }

  update(data){
    socket.emit('updateItem', data)
  }


  saveTodo(data){
    socket.emit('addItem', data)
  }

  editTodo(data){
    this.setState({
      data: data,
      editState:true
    })
  }

  toggleCompleted(id){
    socket.emit('toggleTodo', id)
  }

  delete(id){
    this.cancelEditState()
    this.cancelDeleteState()
    socket.emit('deleteTodo', id)
  }


  submitToDo = (e) => {
    if(e){
      e.preventDefault()
    }
    if(this.state.data.task === ''){
      this.setState({
        errors: {task:'Please Enter a Todo'}
      })
      return
    } else{
      this.setState({errors:{}})
      if(!this.state.data._id){
        return this.saveTodo(this.state.data)
      } else{
        return this.update(this.state.data)
      }

    }

  }

  componentWillUnMount(){
    socket.emit('disconnect')
  }


  render() {
    const {errors, todos, data, editState, deleteConfirm} = this.state
    return (
      <div>
        <AppBar title="React Realtime Socket.IO"/>
        <Divider />
        <TodoStatus />
				<div style={{width:'90%', margin:'0 auto'}}>
          <form onSubmit={this.submitToDo}>
            <TextField hintText='Add new todo'
              floatingLabelText={editState ? 'Modify your todo' : 'Enter your todo'}
              onChange={this.onChange}
              id='task'
              value={data.task}
              errorText={errors.task}
            />{" "}
            <RaisedButton
              label={editState? "Update To do" : "Add To do"}
              onClick={() => this.submitToDo()}
            />{" "}
            {editState &&
              <RaisedButton
              label="Cancel"
              onClick={() => this.cancelEditState()}
            />}{" "}
            {editState && !deleteConfirm &&
              <RaisedButton
              label="Delete To do"
              onClick={() => this.deleteConfirmation()}
            />
          }

          {deleteConfirm && <div>
            <RaisedButton
            label="Yes"
            onClick={() => this.delete(data._id)}
          />{" "}<RaisedButton
            label="No"
            onClick={() => this.cancelDeleteState()}
          />
          </div>
        }

          </form>
					</div>

          <List style={{width:'90%', margin:'0 auto'}}>
            {this.state.todos.map(item => (
              <ListItem
               key={item._id} style={item.completed? markCompleteStyle: {}}>
               <ActionSetting  onClick={()=> this.editTodo(item)} style={{...iconStyles, marginRight:20}} hoverColor={'green'}/>
               <span onClick={()=> this.toggleCompleted(item._id)}>
               {item.task}
               </span>
							 </ListItem>
            ))}
          </List>

      </div>
    );
  }
}

export default App;
