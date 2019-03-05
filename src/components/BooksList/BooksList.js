import React, {Component} from 'react';
import {Card} from 'semantic-ui-react';
import {serverAPI} from '../../api/api';
import adminContext from '../../contexts/adminContext';

class BooksList extends Component{
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