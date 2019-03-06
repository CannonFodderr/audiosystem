import React, {Component} from 'react';
import {Form, Message ,Button, Dimmer, Loader} from 'semantic-ui-react';
import adminContext from '../../contexts/adminContext';

class BookCreateForm extends Component{
    constructor(props){
        super(props);
        this.parts = null;
    }
    state = {
        name: null,
        author: null,
        err: null,
        showLoader: false
    }
    validateForm = () => {
        if(!this.state.name || this.state.name.length < 2){
            return this.setState({err: "Invalid name"})
        }
        if(!this.state.author || this.state.author.length < 2){
            return this.setState({err: "Invalid author"})
        }
        this.setState({err: null, showLoader: true});
        this.handleUpload()
    }
    handleUpload = () => {
        const data = new FormData();
        data.set("name", this.state.name)
        data.set("author", this.state.author)
        for(let i = 0; i < this.parts.length; i++){
            data.append(`file${i}`, this.parts[i], this.parts[i].name)
        }
        this.context.createNewBook(data);
    }
    setName = (event) => {
        this.setState({name: event.target.value})
    } 
    setAuthor = (event) => {
        this.setState({author: event.target.value})
    }
    setParts = (event) => {
        this.parts = event.target.files
    }
    renderErrorMessage = () => {
        if(this.state.err === null){
            return;
        }
        return (
            <Message error header="Something went wrong :("  content={this.state.err} style={{display:"block"}}/>
        )
    }
    renderContent = () => {
        if(this.state.showLoader){
            return (
                <Dimmer active>
                    <Loader indeterminate>Uploading Files...</Loader>
                </Dimmer>
            )
        } else {
            return (
            <Form>
                {this.renderErrorMessage()}
                <Form.Field>
                    <label>Book</label>
                    <input type="text" id="name" placeholder='Book Name' value={this.state.name} onChange={(e) => {this.setName(e)}} autoFocus required/>
                </Form.Field>
                <Form.Field>
                    <label>Author</label>
                    <input type="text" id="author" placeholder='Author Name' value={this.state.author} onChange={(e) => {this.setAuthor(e)}} required/>
                </Form.Field>
                <Form.Field>
                    <label>Upload files</label>
                    <input type="file" multiple id="author" placeholder='mp3 files' onChange={(e) => {this.setParts(e)}} required/>
                </Form.Field>
                <Button type='submit' fluid primary onClick={(e) => {this.validateForm()}}>Submit</Button>
            </Form>
            )
        }
    }
    render(){
        return(
            <div>
                {this.renderContent()}
            </div>
        )
    }
};

BookCreateForm.contextType = adminContext;
export default BookCreateForm;


