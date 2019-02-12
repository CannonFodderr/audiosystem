import React, {Component} from 'react';
import {Form, Message ,Button} from 'semantic-ui-react';
import {serverAPI} from '../../api/api';
import appContext from '../../contexts/appContext';

class LoginForm extends Component{
    state = {
        username: null,
        password: null,
        err: null
    }
    validateForm = () => {
        if(!this.state.username || this.state.username.length < 3){
            return this.setState({err: "Invalid username"})
        }
        if(!this.state.password || this.state.password.length < 3){
            return this.setState({err: "Invalid password"})
        }
        this.setState({err: null});
        return this.context.fetchRoomData({username: this.state.username, password: this.state.password});
    }
    setUsername = (event) => {
        this.setState({username: event.target.value})
    } 
    setPassword = (event) => {
        this.setState({password: event.target.value})
    }
    renderErrorMessage = () => {
        if(this.state.err === null){
            return;
        }
        return (
            <Message error header="Something went wrong :("  content={this.state.err} style={{display:"block"}}/>
        )
    } 
    render(){
        return(
            <Form>
                {this.renderErrorMessage()}
                <Form.Field>
                    <label>Room Name</label>
                    <input type="text" id="username" placeholder='myroom...' value={this.state.username} onChange={(e) => {this.setUsername(e)}} autoFocus required/>
                </Form.Field>
                <Form.Field>
                    <label>password</label>
                    <input type="password" id="password" placeholder='Last Name' value={this.state.password} onChange={(e) => {this.setPassword(e)}} required/>
                </Form.Field>
                <Button type='submit' fluid primary onClick={(e) => {this.validateForm()}}>Login</Button>
            </Form>
        )
    }
};

LoginForm.contextType = appContext;
export default LoginForm;


