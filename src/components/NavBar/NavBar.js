import React, {Component} from 'react';
import {Menu, Input} from 'semantic-ui-react';
import adminContext from '../../contexts/adminContext';
import ModalNav  from '../ModalNav/ModalNav';
import UserCreateForm from '../UserCreateForm/UserCreateForm';
import BookCreateForm from '../BookCreateForm/BookCreateForm';

class NavBar extends Component{
    renderAddButton = () => {
        if(!this.context.activeMenuItem){
            return <Menu.Item name="" disabled/>
        }
        if(this.context.activeMenuItem === 'Books'){
            return <ModalNav header="Add Books" content={<BookCreateForm />} actions="" icon="book"/>
        }
        if(this.context.activeMenuItem === 'Users'){
            return <ModalNav header="Add Users" content={<UserCreateForm />} actions="" icon="add user"/>
        }
    }
    renderSearchBox = () => {
        if(!this.context.activeMenuItem){
            return <div></div>
        }
        if(this.context.activeMenuItem === 'Books'){
            return (
                <Input 
                inverted
                transparent
                icon={{ name: 'search books', link: true }}
                placeholder='Search books...'
                />
            )
        }
        if(this.context.activeMenuItem === 'Users'){
            return (
                <Input
                transparent
                inverted
                icon={{ name: 'search users', link: true }}
                placeholder='Search users...'
                />
            )
        }
    }
    renderMenu = () => {
        return (
            <Menu stackable inverted>
                <Menu.Item name="Rooms" active={this.context.activeMenuItem === 'Rooms'} onClick={this.context.handleMenuItemClick}/>
                <Menu.Item name="Books" active={this.context.activeMenuItem === 'Books'} onClick={this.context.handleMenuItemClick}/>
                <Menu.Item name="Users" active={this.context.activeMenuItem === 'Users'} onClick={this.context.handleMenuItemClick}/>
                <Menu.Menu position="right">
                        {this.renderAddButton()}
                        {this.renderSearchBox()}
                </Menu.Menu>
            </Menu>
        )
    }
    render(){
        return(
            <div>
                {this.renderMenu()}
            </div>
        )
    }
}

NavBar.contextType = adminContext;
export default NavBar