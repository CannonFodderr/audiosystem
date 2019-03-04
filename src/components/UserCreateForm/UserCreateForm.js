import React, {Component} from 'react';
import {Form, Message ,Button} from 'semantic-ui-react';
import adminContext from '../../contexts/adminContext';

class UserCreateForm extends Component{
    state = {
        firstName: null,
        lastName: null,
        email: null,
        err: null
    }
    validateForm = () => {
        if(!this.state.firstName || this.state.firstName.length < 2){
            return this.setState({err: "Invalid firstName"})
        }
        if(!this.state.lastName || this.state.lastName.length < 2){
            return this.setState({err: "Invalid lastName"})
        }
        this.setState({err: null});
        return this.context.createNewUser({firstName: this.state.firstName, lastName: this.state.lastName, email: this.state.email});
    }
    setFirstName = (event) => {
        this.setState({firstName: event.target.value})
    } 
    setLastName = (event) => {
        this.setState({lastName: event.target.value})
    }
    setEmail = (event) => {
        this.setState({email: event.target.value})
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
                    <label>First Name</label>
                    <input type="text" id="firstName" placeholder='First Name' value={this.state.firstName} onChange={(e) => {this.setFirstName(e)}} autoFocus required/>
                </Form.Field>
                <Form.Field>
                    <label>Last Name</label>
                    <input type="text" id="lastName" placeholder='Last Name' value={this.state.lastName} onChange={(e) => {this.setLastName(e)}} required/>
                </Form.Field>
                <Form.Field>
                    <label>E-Mail</label>
                    <input type="email" id="lastName" placeholder='Last Name' value={this.state.email} onChange={(e) => {this.setEmail(e)}} required/>
                </Form.Field>
                <Button type='submit' fluid primary onClick={(e) => {this.validateForm()}}>Submit</Button>
            </Form>
        )
    }
};

UserCreateForm.contextType = adminContext;
export default UserCreateForm;


