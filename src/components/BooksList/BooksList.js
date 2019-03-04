import React, {Component} from 'react';
import {Card} from 'semantic-ui-react';
import {serverAPI} from '../../api/api';

class BooksList extends Component{
    state = { books: [] }
    renderBooksList = () => {
        let books = this.state.books;
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
    setCurrentUsers = books => {
        this.setState({books});
    }
    componentDidMount(){
        serverAPI.get('/books')
        .then(res => { this.setCurrentUsers(res.data)})
        .catch(err => { console.log(err)});
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

export default BooksList;