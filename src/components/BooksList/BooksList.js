import React, {Component} from 'react';
import {Card, Button, Icon} from 'semantic-ui-react';
import {serverAPI} from '../../api/api';
import adminContext from '../../contexts/adminContext';

class BooksList extends Component{
    deleteBook = book => {
        serverAPI.delete(`/books/${book._id}`)
        .then(() => {
            this.context.fetchBooksList();
        })
        .catch(err => console.log(err));
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
                            <Card.Content extra>
                                <Button size="small" negative onClick={() => {this.deleteBook(book)}}>
                                    <Icon name="delete" />
                                    Delete
                                </Button>
                            </Card.Content>
                        </Card.Content>
                    </Card>
                )
            })
        }
    }
    componentDidMount(){
        this.context.fetchBooksList()
    }
    render(){
        return (
            <div>
                <Card.Group>
                    {this.renderBooksList()}
                </Card.Group>
            </div>
        )
    }
}
BooksList.contextType = adminContext;
export default BooksList;