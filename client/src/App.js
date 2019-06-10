import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {Button} from 'react-bootstrap'

// Import socket.IO

import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:3001');

class App extends Component {

    constructor(props){
        super(props);
        this.state = {
            message : '',
            name : '',
            messages: []
        };

        this.updateChat = this.updateChat.bind(this);
        this.clearChat = this.clearChat.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.showMessages = this.showMessages.bind(this);
    }

    componentDidMount() {
        // Receive data at first
        socket.on('messages',this.showMessages);

        // Receive after changes
        socket.on('output',this.updateChat);

        // Clear Message
        socket.on('cleared', this.updateChat);
    }

    showMessages(data){
        this.setState({
            messages : data ? data : []
        })
    }

    updateChat(data){

        let chat = this.state.messages;
        data ? chat.push(data) : chat = [];

        this.setState({
            messages : chat
        })
    }

    sendMessage(){
        socket.emit('input', {
            name : this.state.name,
            message : this.state.message
        });
    }

    clearChat(){
        socket.emit('clear',{});
    }

    handleChange(event){
        if(event.key === 'Enter' && event.shiftKey === false){
            this.sendMessage();
            this.setState({
                message : ''
            });
            event.preventDefault();
        }
        else
            this.setState({message: event.target.value});
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1 className="App-title">REAL TIME CHAT APP WITH SOCKET.IO</h1>
                </header>

                {/*Chat View*/}

                <h1>ONLINE DATA REPLICATION FOR SOCIAL MEDIA APP SP19-MSCS</h1>
                <Button bsStyle="danger" active onClick={this.clearChat}>Clear Chat</Button>
                <br/>
                <input className="username" placeholder="name" value={this.state.name} onChange={(event)=>{this.setState({name: event.target.value})}} />
                <div className="chatArea">
                    {
                        this.state.messages.map(user =>
                        <div key={user._id}>{user.name}: {user.message}</div>)
                    }

                </div>
                <textarea placeholder="Enter message..." value={this.state.message} onKeyPress={this.handleChange} onChange={this.handleChange}/>
                <Button bsStyle="primary" onClick={this.sendMessage}>Send</Button>
            </div>
        );
    }
}

export default App;
