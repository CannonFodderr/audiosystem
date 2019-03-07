import React, {Component} from 'react';
import {Card, Button, Icon} from 'semantic-ui-react';
import ConfirmTemplate from '../Confirm/Confim';
import {serverAPI} from '../../api/api';
import adminContext from '../../contexts/adminContext';

let INITIAL_STATE = {showConfirm: false, selectedBook: null}

class BooksList extends Component{
    state = INITIAL_STATE
    handleConfirm = book => {
        this.deleteBook(book)
    }
    handleCancel = () => {
        this.setState({showConfirm: false, selectedBook: null})
    }
    deleteBook = book => {
        serverAPI.delete(`/books/${this.state.selectedBook._id}`)
        .then(() => {
            this.setState({showConfirm: false, selectedBook: null});
            this.context.fetchBooksList();
        })
        .catch(err => console.log(err));
    }
    renderAuthor = book => {
        if(!book.author){
            return <span></span>
        }
        return <span>{book.author}</span>
    }
    renderBooksList = () => {
        let books = this.context.books;
        if(!books || books.length < 1){
            return <div>Loading books...</div>
        } else {
            return books.map(book => {
                return (
                    <Card key={book._id}>
                        <Card.Content>
                            <Card.Header as="a" >{book.name}</Card.Header>
                            <Card.Meta>
                                <p>Author: {this.renderAuthor(book)}</p>
                                {book.parts.length} parts
                            </Card.Meta>
                            <Card.Content extra>
                                <div className='ui two buttons'>
                                <Button basic size="small" 
                                color="blue"
                                disabled
                                >
                                    <Icon name="edit" />
                                    Edit
                                </Button>
                                <Button basic size="small" 
                                negative 
                                onClick={() => {
                                    this.setState({showConfirm: true, selectedBook: book})
                                    }}>
                                    <Icon name="delete" />
                                    Delete
                                </Button>
                                </div>
                            </Card.Content>
                        </Card.Content>
                    </Card>
                )
            })
        }
    }
    renderContent = () => {
        if(!this.state.showConfirm && !this.state.selectedBook){
            return (
                <Card.Group>
                    {this.renderBooksList()}
                </Card.Group>
            )
        } else {
            let content = `Are you sure you want to delete "${this.state.selectedBook.name}" ?`;
            return (
            <div>
                <ConfirmTemplate 
                handleConfirm={this.handleConfirm} 
                handleCancel={this.handleCancel}
                header="Delete Book"
                content={content}
                isopen={this.state.showConfirm}
                />
            </div>
            )
        }
    }
    componentDidMount(){
        this.context.fetchBooksList()
    }
    render(){
        return (
            <div>
                {this.renderContent()}
            </div>
        )
    }
}
BooksList.contextType = adminContext;
export default BooksList;